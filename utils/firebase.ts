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
  updateDoc,
} from 'firebase/firestore';
import { UserProfile, FriendRequest, Friendship } from '~/types/friends';

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

export async function updateUserProfile(userProfile: UserProfile) {
  const userRef = doc(db, 'users', userProfile.userId);
  await setDoc(userRef, userProfile, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
}

export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('username', '>=', searchTerm),
    where('username', '<=', searchTerm + '\uf8ff')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as UserProfile);
}

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  const requestsRef = collection(db, 'friendRequests');
  const requestId = `${fromUserId}_${toUserId}`;

  await setDoc(doc(requestsRef, requestId), {
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  } as FriendRequest);

  // Update user profiles
  const fromUser = await getUserProfile(fromUserId);
  const toUser = await getUserProfile(toUserId);

  if (fromUser && toUser) {
    await updateUserProfile({
      ...fromUser,
      friendRequests: {
        ...fromUser.friendRequests,
        outgoing: [...(fromUser.friendRequests?.outgoing || []), toUserId],
      } as { incoming: string[]; outgoing: string[] },
    });

    await updateUserProfile({
      ...toUser,
      friendRequests: {
        ...toUser.friendRequests,
        incoming: [...(toUser.friendRequests?.incoming || []), fromUserId],
      } as { incoming: string[]; outgoing: string[] },
    });
  }
}

export async function getFriendRequests(userId: string, type: 'incoming' | 'outgoing') {
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

export async function acceptFriendRequest(userId: string, friendId: string) {
  const requestId = `${friendId}_${userId}`;
  const requestRef = doc(db, 'friendRequests', requestId);

  await updateDoc(requestRef, {
    status: 'accepted',
    updatedAt: Timestamp.now(),
  });

  const friendshipId = [userId, friendId].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);

  await setDoc(friendshipRef, {
    users: [userId, friendId].sort() as [string, string],
    createdAt: Timestamp.now(),
    lastInteractionAt: Timestamp.now(),
    status: 'active',
  } as Friendship);

  // Update user profiles
  const user = await getUserProfile(userId);
  const friend = await getUserProfile(friendId);

  if (user && friend) {
    await updateUserProfile({
      ...user,
      friendRequests: {
        incoming: (user.friendRequests?.incoming || []).filter((id) => id !== friendId),
        outgoing: user.friendRequests?.outgoing || [],
      } as { incoming: string[]; outgoing: string[] },
    });

    await updateUserProfile({
      ...friend,
      friendRequests: {
        outgoing: (friend.friendRequests?.outgoing || []).filter((id) => id !== userId),
        incoming: friend.friendRequests?.incoming || [],
      } as { incoming: string[]; outgoing: string[] },
    });
  }
}

export async function getFriendships(userId: string) {
  const friendshipsRef = collection(db, 'friendships');
  const q = query(
    friendshipsRef,
    where('users', 'array-contains', userId),
    where('status', '==', 'active')
  );

  const querySnapshot = await getDocs(q);
  const friendships = querySnapshot.docs.map((doc) => doc.data() as Friendship);

  // Get user profiles for friends
  const friendIds = friendships.map((f) => f.users.find((u) => u !== userId)!);
  const profiles = await Promise.all(friendIds.map(getUserProfile));
  return profiles.filter((p): p is UserProfile => p !== null);
}

export async function removeFriend(userId: string, friendId: string) {
  const friendshipId = [userId, friendId].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);

  await updateDoc(friendshipRef, {
    status: 'blocked',
    lastInteractionAt: Timestamp.now(),
  });

  // Update user profiles
  const user = await getUserProfile(userId);
  const friend = await getUserProfile(friendId);

  if (user && friend) {
    await updateUserProfile({
      ...user,
      friends: (user.friends || []).filter((id) => id !== friendId),
    });

    await updateUserProfile({
      ...friend,
      friends: (friend.friends || []).filter((id) => id !== userId),
    });
  }
}
