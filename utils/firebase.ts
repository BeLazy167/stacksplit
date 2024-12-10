import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  limit,
  DocumentReference,
} from 'firebase/firestore';
import { UserProfile, FriendRequest, Friendship } from '~/types/friends';

// Initialize Firebase (unchanged)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Error classes for specific error handling
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class DuplicateFriendRequestError extends Error {
  constructor() {
    super('Friend request already exists');
    this.name = 'DuplicateFriendRequestError';
  }
}

export class AlreadyFriendsError extends Error {
  constructor() {
    super('Users are already friends');
    this.name = 'AlreadyFriendsError';
  }
}

// Helper function to validate user existence
async function validateUser(userId: string, transaction?: any): Promise<DocumentReference> {
  const userRef = doc(db, 'users', userId);
  const userDoc = transaction ? await transaction.get(userRef) : await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new UserNotFoundError(userId);
  }
  return userRef;
}

export async function updateUserProfile(userProfile: UserProfile) {
  const userRef = doc(db, 'users', userProfile.userId);
  await setDoc(
    userRef,
    {
      ...userProfile,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
}

export async function searchUsers(
  searchTerm: string,
  currentUserId: string,
  pageSize = 10
): Promise<UserProfile[]> {
  if (!searchTerm.trim()) {
    return [];
  }

  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('username', '>=', searchTerm.toLowerCase()),
    where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
    limit(pageSize)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((doc) => doc.data() as UserProfile)
    .filter((user) => user.userId !== currentUserId); // Exclude current user
}

export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  if (fromUserId === toUserId) {
    throw new Error('Cannot send friend request to yourself');
  }

  await runTransaction(db, async (transaction) => {
    // Validate both users exist
    await Promise.all([validateUser(fromUserId, transaction), validateUser(toUserId, transaction)]);

    // Check if already friends
    const friendshipId = [fromUserId, toUserId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);
    const friendshipDoc = await transaction.get(friendshipRef);

    if (friendshipDoc.exists()) {
      throw new AlreadyFriendsError();
    }

    // Check for existing requests
    const requestId = `${fromUserId}_${toUserId}`;
    const reverseRequestId = `${toUserId}_${fromUserId}`;
    const [requestRef, reverseRequestRef] = [
      doc(db, 'friendRequests', requestId),
      doc(db, 'friendRequests', reverseRequestId),
    ];

    const [requestDoc, reverseRequestDoc] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(reverseRequestRef),
    ]);

    if (requestDoc.exists() || reverseRequestDoc.exists()) {
      throw new DuplicateFriendRequestError();
    }

    const timestamp = Timestamp.now();
    const request: FriendRequest = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update friend request document
    transaction.set(requestRef, request);

    // Update both user profiles atomically
    const [fromUserRef, toUserRef] = [doc(db, 'users', fromUserId), doc(db, 'users', toUserId)];

    transaction.update(fromUserRef, {
      'friendRequests.outgoing': arrayUnion(toUserId),
      updatedAt: Date.now(),
    });

    transaction.update(toUserRef, {
      'friendRequests.incoming': arrayUnion(fromUserId),
      updatedAt: Date.now(),
    });
  });
}

export async function getFriendRequests(
  userId: string,
  type: 'incoming' | 'outgoing'
): Promise<UserProfile[]> {
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where(type === 'incoming' ? 'toUserId' : 'fromUserId', '==', userId),
    where('status', '==', 'pending')
  );

  const querySnapshot = await getDocs(q);
  const requests = querySnapshot.docs.map((doc) => doc.data() as FriendRequest);

  // Get user profiles for each request
  const userIds = requests.map((r) => (type === 'incoming' ? r.fromUserId : r.toUserId));
  const profiles = await Promise.all(userIds.map(getUserProfile));

  return profiles.filter((p): p is UserProfile => p !== null);
}

export async function acceptFriendRequest(userId: string, friendId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const requestId = `${friendId}_${userId}`;
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await transaction.get(requestRef);

    if (!requestDoc.exists() || requestDoc.data()?.status !== 'pending') {
      throw new Error('Friend request not found or already processed');
    }

    const timestamp = Timestamp.now();
    const friendshipId = [userId, friendId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);

    // Update request status
    transaction.update(requestRef, {
      status: 'accepted',
      updatedAt: timestamp,
    });

    // Create friendship
    const friendship: Friendship = {
      users: [userId, friendId].sort() as [string, string],
      createdAt: timestamp,
      lastInteractionAt: timestamp,
      status: 'active',
    };
    transaction.set(friendshipRef, friendship);

    // Update both user profiles
    const [userRef, friendRef] = [doc(db, 'users', userId), doc(db, 'users', friendId)];

    transaction.update(userRef, {
      'friendRequests.incoming': arrayRemove(friendId),
      friends: arrayUnion(friendId),
      updatedAt: Date.now(),
    });

    transaction.update(friendRef, {
      'friendRequests.outgoing': arrayRemove(userId),
      friends: arrayUnion(userId),
      updatedAt: Date.now(),
    });
  });
}

export async function getFriendships(userId: string): Promise<UserProfile[]> {
  const friendshipsRef = collection(db, 'friendships');
  const q = query(
    friendshipsRef,
    where('users', 'array-contains', userId),
    where('status', '==', 'active')
  );

  const querySnapshot = await getDocs(q);
  const friendships = querySnapshot.docs.map((doc) => doc.data() as Friendship);
  const friendIds = friendships.map((f) => f.users.find((u) => u !== userId)!);

  const profiles = await Promise.all(friendIds.map(getUserProfile));
  return profiles.filter((p): p is UserProfile => p !== null);
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const friendshipId = [userId, friendId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);
    const friendshipDoc = await transaction.get(friendshipRef);

    if (!friendshipDoc.exists()) {
      throw new Error('Friendship not found');
    }

    // Update friendship status
    transaction.update(friendshipRef, {
      status: 'blocked',
      lastInteractionAt: Timestamp.now(),
    });

    // Update both user profiles
    const [userRef, friendRef] = [doc(db, 'users', userId), doc(db, 'users', friendId)];

    transaction.update(userRef, {
      friends: arrayRemove(friendId),
      updatedAt: Date.now(),
    });

    transaction.update(friendRef, {
      friends: arrayRemove(userId),
      updatedAt: Date.now(),
    });
  });
}
