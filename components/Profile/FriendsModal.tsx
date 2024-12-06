import { useState, useCallback, useEffect } from 'react';
import { Sheet, Input, Button, XStack, YStack, Text, H2, Avatar, Spinner, Card } from 'tamagui';
import { X, Search, UserPlus, UserMinus, Check, Users } from '@tamagui/lucide-icons';
import { Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { getUserProfile, UserProfile } from '../../utils/firebase';
import { useFriendsStore } from '../../utils/stores/friendsStore';
import { useDebounce } from '../../utils/hooks/useDebounce';

interface FriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendsModal({ open, onOpenChange }: FriendsModalProps) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [requestUsers, setRequestUsers] = useState<Record<string, UserProfile>>({});
  const [friendUsers, setFriendUsers] = useState<Record<string, UserProfile>>({});

  const {
    searchResults,
    isLoading,
    error,
    searchUsers: performSearch,
    sendRequest,
    acceptRequest,
    removeFriend: removeUserFriend,
  } = useFriendsStore();

  const debouncedSearch = useDebounce(
    (query: string) => {
      if (query.trim()) {
        performSearch(query);
      }
    },
    300,
    [performSearch]
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const loadUserProfile = useCallback(async () => {
    if (user) {
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);

      // Load friend request user profiles
      const requestIds = profile?.friendRequests?.incoming || [];
      const requestProfiles = await Promise.all(requestIds.map((id) => getUserProfile(id)));
      const requestProfileMap = requestProfiles.reduce(
        (acc, profile) => {
          if (profile) acc[profile.userId] = profile;
          return acc;
        },
        {} as Record<string, UserProfile>
      );
      setRequestUsers(requestProfileMap);

      // Load friend user profiles
      const friendIds = profile?.friends || [];
      const friendProfiles = await Promise.all(friendIds.map((id) => getUserProfile(id)));
      const friendProfileMap = friendProfiles.reduce(
        (acc, profile) => {
          if (profile) acc[profile.userId] = profile;
          return acc;
        },
        {} as Record<string, UserProfile>
      );
      setFriendUsers(friendProfileMap);
    }
  }, [user]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleSendRequest = async (toUserId: string) => {
    if (!user) return;
    await sendRequest(user.id, toUserId);
    await loadUserProfile();
  };

  const handleAcceptRequest = async (friendId: string) => {
    if (!user) return;
    await acceptRequest(user.id, friendId);
    await loadUserProfile();
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    await removeUserFriend(user.id, friendId);
    await loadUserProfile();
  };

  const TabButton = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
    <Button
      flex={1}
      size="$4"
      backgroundColor={activeTab === tab ? '$blue10' : 'transparent'}
      borderColor="$blue10"
      borderWidth={1}
      pressStyle={{ scale: 0.97 }}
      animation="quick"
      onPress={() => setActiveTab(tab)}>
      <Text color={activeTab === tab ? 'white' : '$blue10'}>{label}</Text>
    </Button>
  );

  const UserCard = ({
    profile,
    actionButton,
  }: {
    profile: UserProfile;
    actionButton: React.ReactNode;
  }) => (
    <Card
      animation="lazy"
      scale={0.97}
      hoverStyle={{ scale: 0.99 }}
      pressStyle={{ scale: 0.95 }}
      borderColor="$gray5"
      backgroundColor="$gray1">
      <XStack space="$3" padding="$3" alignItems="center">
        <Avatar circular size="$5">
          <Avatar.Image source={{ uri: profile.imageUrl }} />
          <Avatar.Fallback backgroundColor="$blue5">
            <Users size={20} color="$blue10" />
          </Avatar.Fallback>
        </Avatar>
        <YStack flex={1} space="$1">
          <Text fontWeight="bold" fontSize="$5">
            {profile.username}
          </Text>
          <Text fontSize="$3" color="$gray11">
            {profile.email}
          </Text>
        </YStack>
        {actionButton}
      </XStack>
    </Card>
  );

  const ContentComponent = ({ isSheet = false }) => (
    <YStack space="$4" flex={1}>
      <XStack justifyContent="space-between" alignItems="center">
        <H2 size="$7" color="$blue10">
          Friends
        </H2>
        <Button
          size="$3"
          circular
          icon={X}
          onPress={() => onOpenChange(false)}
          disabled={isLoading}
          chromeless
        />
      </XStack>

      <XStack space="$2" paddingVertical="$2">
        <TabButton tab="friends" label="Friends" />
        <TabButton tab="requests" label="Requests" />
        <TabButton tab="search" label="Add" />
      </XStack>

      {error && (
        <Text color="$red10" textAlign="center">
          {error}
        </Text>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <YStack space="$4" flex={1}>
          {activeTab === 'search' && (
            <YStack space="$3" flex={1}>
              <Input
                size="$4"
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                borderColor="$gray5"
                backgroundColor="$gray1"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />

              {isLoading ? (
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <Spinner size="large" color="$blue10" />
                </YStack>
              ) : (
                <YStack space="$3" flex={1}>
                  {searchResults.map((result) => (
                    <UserCard
                      key={result.userId}
                      profile={result}
                      actionButton={
                        <Button
                          size="$3"
                          theme={
                            userProfile?.friendRequests?.outgoing.includes(result.userId)
                              ? 'gray'
                              : 'blue'
                          }
                          icon={UserPlus}
                          disabled={
                            isLoading ||
                            userProfile?.friendRequests?.outgoing.includes(result.userId) ||
                            userProfile?.friends?.includes(result.userId)
                          }>
                          {userProfile?.friendRequests?.outgoing.includes(result.userId)
                            ? 'Pending'
                            : 'Add'}
                        </Button>
                      }
                    />
                  ))}
                </YStack>
              )}
            </YStack>
          )}

          {activeTab === 'requests' && (
            <YStack space="$3" flex={1}>
              {Object.values(requestUsers).length === 0 ? (
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <Text color="$gray11">No pending requests</Text>
                </YStack>
              ) : (
                Object.values(requestUsers).map((profile) => (
                  <UserCard
                    key={profile.userId}
                    profile={profile}
                    actionButton={
                      <Button
                        size="$3"
                        theme="blue"
                        icon={Check}
                        onPress={() => handleAcceptRequest(profile.userId)}
                        disabled={isLoading}>
                        Accept
                      </Button>
                    }
                  />
                ))
              )}
            </YStack>
          )}

          {activeTab === 'friends' && (
            <YStack space="$3" flex={1}>
              {Object.values(friendUsers).length === 0 ? (
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <Text color="$gray11">No friends added yet</Text>
                </YStack>
              ) : (
                Object.values(friendUsers).map((profile) => (
                  <UserCard
                    key={profile.userId}
                    profile={profile}
                    actionButton={
                      <Button
                        size="$3"
                        theme="red"
                        icon={UserMinus}
                        onPress={() => handleRemoveFriend(profile.userId)}
                        disabled={isLoading}>
                        Remove
                      </Button>
                    }
                  />
                ))
              )}
            </YStack>
          )}
        </YStack>
      </KeyboardAvoidingView>
    </YStack>
  );

  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => onOpenChange(false)}>
        <YStack flex={1} backgroundColor="$background" padding="$4">
          <ContentComponent />
        </YStack>
      </Modal>
    );
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      position={0}
      dismissOnSnapToBottom
      zIndex={100000}>
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame padding="$4" space="$4" backgroundColor="$background">
        <Sheet.Handle />
        <ContentComponent isSheet={true} />
      </Sheet.Frame>
    </Sheet>
  );
}
