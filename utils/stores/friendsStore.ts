import { create } from 'zustand';
import {
  UserProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} from '../firebase';

interface FriendsState {
  searchResults: UserProfile[];
  isLoading: boolean;
  error: string | null;
  // Actions
  searchUsers: (query: string) => Promise<void>;
  sendRequest: (fromUserId: string, toUserId: string) => Promise<void>;
  acceptRequest: (userId: string, friendId: string) => Promise<void>;
  removeFriend: (userId: string, friendId: string) => Promise<void>;
  clearError: () => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  searchResults: [],
  isLoading: false,
  error: null,

  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const results = await searchUsers(query);
      set({ searchResults: results });
    } catch (error) {
      set({ error: 'Failed to search users' });
      console.error('Search error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendRequest: async (fromUserId: string, toUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      await sendFriendRequest(fromUserId, toUserId);
    } catch (error) {
      set({ error: 'Failed to send friend request' });
      console.error('Send request error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  acceptRequest: async (userId: string, friendId: string) => {
    set({ isLoading: true, error: null });
    try {
      await acceptFriendRequest(userId, friendId);
    } catch (error) {
      set({ error: 'Failed to accept friend request' });
      console.error('Accept request error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeFriend: async (userId: string, friendId: string) => {
    set({ isLoading: true, error: null });
    try {
      await removeFriend(userId, friendId);
    } catch (error) {
      set({ error: 'Failed to remove friend' });
      console.error('Remove friend error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
