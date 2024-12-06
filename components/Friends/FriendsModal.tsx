// src/components/FriendsModal.tsx
import { useState, useEffect } from 'react';
import { Sheet, Input, Button, XStack, YStack, Text, H2, Spinner } from 'tamagui';
import { X, UserPlus, UserMinus, Check } from '@tamagui/lucide-icons';
import { Platform, KeyboardAvoidingView, Modal, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useFriendsStore } from '~/utils/stores/friendsStore';
import { useDebounce } from '~/utils/hooks/useDebounce';
import { FriendCard } from './FriendCard';

interface FriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendsModal({ open, onOpenChange }: FriendsModalProps) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    isLoading,
    error,
    initialize,
    searchUsers,
    sendRequest,
    acceptRequest,
    removeFriend,
  } = useFriendsStore();

  const debouncedSearch = useDebounce(
    (query: string) => {
      if (user && query.trim()) {
        searchUsers(query, user.id);
      }
    },
    300,
    [searchUsers, user]
  );

  useEffect(() => {
    if (user) {
      initialize(user.id);
    }
  }, [user, initialize]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
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
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {searchResults.map((result) => (
                      <FriendCard
                        key={result.userId}
                        profile={result}
                        action={{
                          label: 'Add',
                          icon: UserPlus,
                          onPress: () => user && sendRequest(user.id, result.userId),
                          disabled: isLoading,
                          theme: 'blue',
                        }}
                      />
                    ))}
                  </ScrollView>
                </YStack>
              )}
            </YStack>
          )}

          {activeTab === 'requests' && (
            <YStack space="$3" flex={1}>
              {incomingRequests.length === 0 ? (
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <Text color="$gray11">No pending requests</Text>
                </YStack>
              ) : (
                incomingRequests.map((profile) => (
                  <FriendCard
                    key={profile.userId}
                    profile={profile}
                    action={{
                      label: 'Accept',
                      icon: Check,
                      onPress: () => user && acceptRequest(user.id, profile.userId),
                      disabled: isLoading,
                      theme: 'blue',
                    }}
                  />
                ))
              )}
            </YStack>
          )}

          {activeTab === 'friends' && (
            <YStack space="$3" flex={1}>
              {friends.length === 0 ? (
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <Text color="$gray11">No friends added yet</Text>
                </YStack>
              ) : (
                friends.map((profile) => (
                  <FriendCard
                    key={profile.userId}
                    profile={profile}
                    action={{
                      label: 'Remove',
                      icon: UserMinus,
                      onPress: () => user && removeFriend(user.id, profile.userId),
                      disabled: isLoading,
                      theme: 'red',
                    }}
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
