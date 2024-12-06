// src/types/friends.ts

import { Timestamp } from 'firebase/firestore';
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
  users: [string, string];
  createdAt: Timestamp;
  lastInteractionAt: Timestamp;
  status: 'active' | 'blocked';
}
