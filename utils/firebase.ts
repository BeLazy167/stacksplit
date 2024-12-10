// src/utils/firebase.ts
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
  runTransaction,
  arrayUnion,
  arrayRemove,
  limit,
  orderBy,
  DocumentReference,
} from 'firebase/firestore';
import { FriendshipError, UserProfile, FriendRequest, Friendship } from '~/types/friends';

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

// Helper function to validate user existence
async function validateUser(userId: string, transaction?: any): Promise<DocumentReference> {
  const userRef = doc(db, 'users', userId);
  const userDoc = transaction ? await transaction.get(userRef) : await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new FriendshipError(`User ${userId} not found`, 'USER_NOT_FOUND');
  }
  return userRef;
}

export async function searchUsers(
  searchTerm: string,
  currentUserId: string,
  pageSize = 20
): Promise<UserProfile[]> {
  if (!searchTerm?.trim()) {
    console.log('Empty search term, returning empty results');
    return [];
  }

  try {
    const usersRef = collection(db, 'users');
    const searchTermLower = searchTerm.toLowerCase().trim();

    const q = query(
      usersRef,
      orderBy('username'),
      where('username', '>=', searchTermLower),
      where('username', '<=', searchTermLower + '\uf8ff'),
      limit(pageSize)
    );

    console.log(`Searching for users matching: ${searchTermLower}`);
    const querySnapshot = await getDocs(q);

    const results = querySnapshot.docs
      .map((doc) => doc.data() as UserProfile)
      .filter((user) => user.userId !== currentUserId);

    console.log(`Found ${results.length} matches (excluding current user)`);
    return results;
  } catch (error) {
    console.error('Search users error:', error);
    throw new FriendshipError('Failed to search users', 'SEARCH_ERROR');
  }
}

export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  if (!fromUserId || !toUserId) {
    throw new FriendshipError('Invalid user IDs', 'INVALID_INPUT');
  }

  if (fromUserId === toUserId) {
    throw new FriendshipError('Cannot send friend request to yourself', 'SELF_REQUEST');
  }

  try {
    await runTransaction(db, async (transaction) => {
      await Promise.all([
        validateUser(fromUserId, transaction),
        validateUser(toUserId, transaction),
      ]);

      console.log(`Initiating friend request: ${fromUserId} -> ${toUserId}`);

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

      if (requestDoc.exists()) {
        const request = requestDoc.data() as FriendRequest;
        if (request.status === 'pending') {
          throw new FriendshipError('Friend request already pending', 'DUPLICATE_REQUEST');
        }
      }

      if (reverseRequestDoc.exists()) {
        throw new FriendshipError('Reverse friend request exists', 'REVERSE_REQUEST_EXISTS');
      }

      const friendshipId = [fromUserId, toUserId].sort().join('_');
      const friendshipRef = doc(db, 'friendships', friendshipId);
      const friendshipDoc = await transaction.get(friendshipRef);

      if (friendshipDoc.exists()) {
        throw new FriendshipError('Users are already friends', 'ALREADY_FRIENDS');
      }

      const timestamp = Timestamp.now();
      const request: FriendRequest = {
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      transaction.set(requestRef, request);

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
  } catch (error) {
    if (error instanceof FriendshipError) throw error;
    console.error('Send friend request error:', error);
    throw new FriendshipError('Failed to send friend request', 'REQUEST_FAILED');
  }
}

export async function getFriendRequests(
  userId: string,
  type: 'incoming' | 'outgoing'
): Promise<UserProfile[]> {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where(type === 'incoming' ? 'toUserId' : 'fromUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map((doc) => doc.data() as FriendRequest);

    const userIds = requests.map((r) => (type === 'incoming' ? r.fromUserId : r.toUserId));
    const profiles = await Promise.all(
      userIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
      })
    );

    return profiles.filter((p): p is UserProfile => p !== null);
  } catch (error) {
    console.error(`Error getting ${type} requests:`, error);
    throw new FriendshipError(`Failed to get ${type} requests`, 'GET_REQUESTS_FAILED');
  }
}

export async function acceptFriendRequest(userId: string, friendId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      console.log(`Accepting friend request: ${friendId} -> ${userId}`);

      const requestId = `${friendId}_${userId}`;
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await transaction.get(requestRef);

      if (!requestDoc.exists()) {
        throw new FriendshipError('Friend request not found', 'REQUEST_NOT_FOUND');
      }

      const request = requestDoc.data() as FriendRequest;
      if (request.status !== 'pending') {
        throw new FriendshipError('Friend request is no longer pending', 'INVALID_REQUEST_STATUS');
      }

      const timestamp = Timestamp.now();
      const friendshipId = [userId, friendId].sort().join('_');
      const friendshipRef = doc(db, 'friendships', friendshipId);

      const friendship: Friendship = {
        users: [userId, friendId].sort() as [string, string],
        createdAt: timestamp,
        lastInteractionAt: timestamp,
        status: 'active',
      };

      transaction.set(friendshipRef, friendship);
      transaction.delete(requestRef);

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
  } catch (error) {
    if (error instanceof FriendshipError) throw error;
    console.error('Accept friend request error:', error);
    throw new FriendshipError('Failed to accept friend request', 'ACCEPT_FAILED');
  }
}

export async function getFriendships(userId: string): Promise<UserProfile[]> {
  try {
    const friendshipsRef = collection(db, 'friendships');
    const q = query(
      friendshipsRef,
      where('users', 'array-contains', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const friendships = querySnapshot.docs.map((doc) => doc.data() as Friendship);
    const friendIds = friendships.map((f) => f.users.find((u) => u !== userId)!);

    const profiles = await Promise.all(
      friendIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
      })
    );

    return profiles.filter((p): p is UserProfile => p !== null);
  } catch (error) {
    console.error('Get friendships error:', error);
    throw new FriendshipError('Failed to get friendships', 'GET_FRIENDS_FAILED');
  }
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      console.log(`Removing friendship between ${userId} and ${friendId}`);

      // First, perform ALL reads
      const friendshipId = [userId, friendId].sort().join('_');
      const friendshipRef = doc(db, 'friendships', friendshipId);
      const request1Id = `${userId}_${friendId}`;
      const request2Id = `${friendId}_${userId}`;
      const request1Ref = doc(db, 'friendRequests', request1Id);
      const request2Ref = doc(db, 'friendRequests', request2Id);
      const userRef = doc(db, 'users', userId);
      const friendRef = doc(db, 'users', friendId);

      // Perform all reads first
      const [friendshipDoc, request1Doc, request2Doc, userDoc, friendDoc] = await Promise.all([
        transaction.get(friendshipRef),
        transaction.get(request1Ref),
        transaction.get(request2Ref),
        transaction.get(userRef),
        transaction.get(friendRef),
      ]);

      if (!friendshipDoc.exists()) {
        throw new FriendshipError('Friendship not found', 'FRIENDSHIP_NOT_FOUND');
      }

      // Now perform all writes
      console.log('Deleting friendship document');
      transaction.delete(friendshipRef);

      if (request1Doc.exists()) {
        console.log(`Deleting friend request ${request1Id}`);
        transaction.delete(request1Ref);
      }

      if (request2Doc.exists()) {
        console.log(`Deleting friend request ${request2Id}`);
        transaction.delete(request2Ref);
      }

      console.log('Updating user profiles');
      transaction.update(userRef, {
        friends: arrayRemove(friendId),
        'friendRequests.incoming': arrayRemove(friendId),
        'friendRequests.outgoing': arrayRemove(friendId),
        updatedAt: Date.now(),
      });

      transaction.update(friendRef, {
        friends: arrayRemove(userId),
        'friendRequests.incoming': arrayRemove(userId),
        'friendRequests.outgoing': arrayRemove(userId),
        updatedAt: Date.now(),
      });

      console.log('Friend removal transaction completed');
    });
  } catch (error) {
    if (error instanceof FriendshipError) throw error;
    console.error('Remove friend error:', error);
    throw new FriendshipError('Failed to remove friend', 'REMOVE_FAILED');
  }
}

export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, profile, { merge: true });
}
