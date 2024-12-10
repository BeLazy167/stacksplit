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
import { UserProfile, FriendshipError } from '~/types/friends';

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
  clearSearchResults: () => void;
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
          console.error('Initialize error:', error);
          set({
            error:
              error instanceof FriendshipError
                ? error.message
                : 'Failed to initialize friends data',
          });
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

          // Filter out users that are already friends or have pending requests
          const filteredResults = results.filter((user) => {
            if (!user?.userId) return false;

            const isNotFriend = !friends?.some((f) => f?.userId === user.userId);
            const noIncomingRequest = !incomingRequests?.some((r) => r?.userId === user.userId);
            const noOutgoingRequest = !outgoingRequests?.some((r) => r?.userId === user.userId);

            return isNotFriend && noIncomingRequest && noOutgoingRequest;
          });

          set({ searchResults: filteredResults });
        } catch (error) {
          console.error('Search error:', error);
          set({
            error: error instanceof FriendshipError ? error.message : 'Failed to search users',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      sendRequest: async (fromUserId: string, toUserId: string) => {
        set({ isLoading: true, error: null });
        try {
          await sendFriendRequest(fromUserId, toUserId);

          // Update local state
          const { searchResults } = get();
          const updatedResults = searchResults.filter((user) => user.userId !== toUserId);

          await get().initialize(fromUserId); // Refresh all friend data
          set({ searchResults: updatedResults }); // Update search results
        } catch (error) {
          console.error('Send request error:', error);
          set({
            error:
              error instanceof FriendshipError ? error.message : 'Failed to send friend request',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      acceptRequest: async (userId: string, friendId: string) => {
        set({ isLoading: true, error: null });
        try {
          await acceptFriendRequest(userId, friendId);

          // Update local state
          const { incomingRequests, friends } = get();
          const acceptedUser = incomingRequests.find((user) => user.userId === friendId);

          if (acceptedUser) {
            set({
              friends: [...friends, acceptedUser],
              incomingRequests: incomingRequests.filter((user) => user.userId !== friendId),
            });
          }

          await get().initialize(userId); // Refresh all friend data
        } catch (error) {
          console.error('Accept request error:', error);
          set({
            error:
              error instanceof FriendshipError ? error.message : 'Failed to accept friend request',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      removeFriend: async (userId: string, friendId: string) => {
        set({ isLoading: true, error: null });
        try {
          await removeFriend(userId, friendId);

          // Update local state
          const { friends } = get();
          set({
            friends: friends.filter((friend) => friend.userId !== friendId),
          });

          await get().initialize(userId); // Refresh all friend data
        } catch (error) {
          console.error('Remove friend error:', error);
          set({
            error: error instanceof FriendshipError ? error.message : 'Failed to remove friend',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      clearSearchResults: () => set({ searchResults: [] }),
    }),
    { name: 'friends-store' }
  )
);

// Usage examples:

/**
 * Initialize the store:
 *
 * const friendsStore = useFriendsStore();
 *
 * useEffect(() => {
 *   friendsStore.initialize(currentUserId);
 * }, [currentUserId]);
 */

/**
 * Search and send request:
 *
 * const { searchUsers, sendRequest, searchResults, isLoading, error } = useFriendsStore();
 *
 * const handleSearch = async (query: string) => {
 *   await searchUsers(query, currentUserId);
 * };
 *
 * const handleSendRequest = async (toUserId: string) => {
 *   await sendRequest(currentUserId, toUserId);
 * };
 */

/**
 * Handle incoming requests:
 *
 * const { incomingRequests, acceptRequest } = useFriendsStore();
 *
 * const handleAcceptRequest = async (friendId: string) => {
 *   await acceptRequest(currentUserId, friendId);
 * };
 */

/**
 * Remove friend:
 *
 * const { friends, removeFriend } = useFriendsStore();
 *
 * const handleRemoveFriend = async (friendId: string) => {
 *   await removeFriend(currentUserId, friendId);
 * };
 */
