// src/stores/friendsStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  searchUsers as searchUsersAPI,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriendRequests,
  getFriendships,
} from '~/utils/firebase';
import { UserProfile } from '~/types/friends';

interface FriendsState {
  friends: UserProfile[];
  incomingRequests: UserProfile[];
  outgoingRequests: UserProfile[];
  searchResults: UserProfile[];
  isLoading: boolean;
  error: string | null;
  initialize: (userId: string) => Promise<void>;
  searchUsers: (query: string, currentUserId: string) => Promise<void>;
  sendRequest: (fromUserId: string, toUserId: string) => Promise<void>;
  acceptRequest: (userId: string, friendId: string) => Promise<void>;
  removeFriend: (userId: string, friendId: string) => Promise<void>;
  clearError: () => void;
}

export const useFriendsStore = create<FriendsState>()(
  devtools(
    (set, get) => ({
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      searchResults: [],
      isLoading: false,
      error: null,

      initialize: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const [friends, incomingReqs, outgoingReqs] = await Promise.all([
            getFriendships(userId),
            getFriendRequests(userId, 'incoming'),
            getFriendRequests(userId, 'outgoing'),
          ]);

          set({
            friends,
            incomingRequests: incomingReqs,
            outgoingRequests: outgoingReqs,
          });
        } catch (error) {
          set({ error: 'Failed to initialize friends data' });
        } finally {
          set({ isLoading: false });
        }
      },

      searchUsers: async (query: string, currentUserId: string) => {
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const results = await searchUsersAPI(query, currentUserId);
          const { friends, incomingRequests, outgoingRequests } = get();

          // Add proper type checking and handle potential undefined values
          const filteredResults = results.filter((user) => {
            if (!user?.userId) return false;

            return (
              user.userId !== currentUserId &&
              !friends?.some((f) => f?.userId === user.userId) &&
              !incomingRequests?.some((r) => r?.userId === user.userId) &&
              !outgoingRequests?.some((r) => r?.userId === user.userId)
            );
          });

          set({ searchResults: filteredResults });
        } catch (error) {
          console.error('Search error:', error);
          set({ error: 'Failed to search users' });
        } finally {
          set({ isLoading: false });
        }
      },

      sendRequest: async (fromUserId: string, toUserId: string) => {
        set({ isLoading: true, error: null });
        try {
          await sendFriendRequest(fromUserId, toUserId);
          await get().initialize(fromUserId);
        } catch (error) {
          set({ error: 'Failed to send friend request' });
        } finally {
          set({ isLoading: false });
        }
      },

      acceptRequest: async (userId: string, friendId: string) => {
        set({ isLoading: true, error: null });
        try {
          await acceptFriendRequest(userId, friendId);
          await get().initialize(userId);
        } catch (error) {
          set({ error: 'Failed to accept friend request' });
        } finally {
          set({ isLoading: false });
        }
      },

      removeFriend: async (userId: string, friendId: string) => {
        set({ isLoading: true, error: null });
        try {
          await removeFriend(userId, friendId);
          await get().initialize(userId);
        } catch (error) {
          set({ error: 'Failed to remove friend' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'friends-store' }
  )
);
