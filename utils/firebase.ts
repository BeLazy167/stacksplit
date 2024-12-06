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
  arrayUnion,
  arrayRemove,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  imageUrl: string;
  updatedAt: number;
  friends?: string[];
  friendRequests?: {
    incoming: string[];
    outgoing: string[];
  };
}

export interface FriendRequest {
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Friendship {
  users: [string, string]; // Array of two user IDs
  createdAt: Timestamp;
  lastInteractionAt: Timestamp;
  status: 'active' | 'blocked';
}

export async function updateUserProfile(userProfile: UserProfile) {
  try {
    const userRef = doc(db, 'users', userProfile.userId);
    await setDoc(userRef, userProfile, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as UserProfile);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const requestId = `${fromUserId}_${toUserId}`;

    await setDoc(doc(requestsRef, requestId), {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as FriendRequest);

    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

export async function getFriendRequests(userId: string, type: 'incoming' | 'outgoing') {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where(type === 'incoming' ? 'toUserId' : 'fromUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as FriendRequest);
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
}

export async function acceptFriendRequest(userId: string, friendId: string) {
  try {
    const requestId = `${friendId}_${userId}`;
    const requestRef = doc(db, 'friendRequests', requestId);

    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: Timestamp.now(),
    });

    // Create friendship document
    const friendshipId = [userId, friendId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);

    await setDoc(friendshipRef, {
      users: [userId, friendId].sort(),
      createdAt: Timestamp.now(),
      lastInteractionAt: Timestamp.now(),
      status: 'active',
    } as Friendship);

    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

export async function getFriendships(userId: string) {
  try {
    const friendshipsRef = collection(db, 'friendships');
    const q = query(
      friendshipsRef,
      where('users', 'array-contains', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Friendship);
  } catch (error) {
    console.error('Error getting friendships:', error);
    throw error;
  }
}

export async function removeFriend(userId: string, friendId: string) {
  try {
    const friendshipId = [userId, friendId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);

    await updateDoc(friendshipRef, {
      status: 'blocked',
      lastInteractionAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}
