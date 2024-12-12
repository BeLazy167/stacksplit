// src/components/FriendsModal.tsx
import { useState, useEffect } from 'react';
import { Sheet, Input, Button, XStack, YStack, Text, H2, Spinner } from 'tamagui';
import { X, UserPlus, UserMinus, Check } from '@tamagui/lucide-icons';
import { Platform, KeyboardAvoidingView, Modal, ScrollView, Keyboard } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useFriendsStore } from '~/utils/stores/friendsStore';
import { useDebounce } from '~/utils/hooks/useDebounce';
import { FriendCard } from './FriendCard';
import { UserProfile } from '~/types/friends';

interface FriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TabButtonProps {
  tab: 'friends' | 'requests' | 'search';
  label: string;
  activeTab: string;
  onPress: () => void;
}

const TabButton = ({ tab, label, activeTab, onPress }: TabButtonProps) => (
  <Button
    flex={1}
    size="$4"
    backgroundColor={activeTab === tab ? '$blue10' : 'transparent'}
    borderColor="$blue10"
    borderWidth={1}
    pressStyle={{ scale: 0.97 }}
    animation="quick"
    onPress={onPress}>
    <Text color={activeTab === tab ? 'white' : '$blue10'}>{label}</Text>
  </Button>
);

const SearchTab = ({
  searchQuery,
  handleSearchChange,
  isLoading,
  searchResults,
  user,
  sendRequest,
}: {
  searchQuery: string;
  handleSearchChange: (text: string) => void;
  isLoading: boolean;
  searchResults: UserProfile[];
  user: any;
  sendRequest: (userId: string, targetId: string) => void;
}) => (
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
      keyboardType="default"
      returnKeyType="search"
    />
    {isLoading ? (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue10" />
      </YStack>
    ) : (
      <YStack space="$3" flex={1}>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="none">
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
);

const RequestsTab = ({ incomingRequests, user, acceptRequest, isLoading }: any) => (
  <YStack space="$3" flex={1}>
    {incomingRequests.length === 0 ? (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$gray11">No pending requests</Text>
      </YStack>
    ) : (
      <ScrollView>
        {incomingRequests.map((profile: any) => (
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
        ))}
      </ScrollView>
    )}
  </YStack>
);

const FriendsTab = ({ friends, user, removeFriend, isLoading }: any) => (
  <YStack space="$3" flex={1}>
    {friends.length === 0 ? (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$gray11">No friends added yet</Text>
      </YStack>
    ) : (
      <ScrollView>
        {friends.map((profile: any) => (
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
        ))}
      </ScrollView>
    )}
  </YStack>
);

const ModalContent = ({ onOpenChange, isSheet = false, ...props }: any) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    props.debouncedSearch(text);
  };

  return (
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
          disabled={props.isLoading}
          chromeless
        />
      </XStack>

      <XStack space="$2" paddingVertical="$2">
        <TabButton
          tab="friends"
          label="Friends"
          activeTab={activeTab}
          onPress={() => setActiveTab('friends')}
        />
        <TabButton
          tab="requests"
          label="Requests"
          activeTab={activeTab}
          onPress={() => setActiveTab('requests')}
        />
        <TabButton
          tab="search"
          label="Add"
          activeTab={activeTab}
          onPress={() => setActiveTab('search')}
        />
      </XStack>

      {props.error && (
        <Text color="$red10" textAlign="center">
          {props.error}
        </Text>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <YStack space="$4" flex={1}>
          {activeTab === 'search' && (
            <SearchTab
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              isLoading={props.isLoading}
              searchResults={props.searchResults}
              user={props.user}
              sendRequest={props.sendRequest}
            />
          )}
          {activeTab === 'requests' && (
            <RequestsTab
              incomingRequests={props.incomingRequests}
              user={props.user}
              acceptRequest={props.acceptRequest}
              isLoading={props.isLoading}
            />
          )}
          {activeTab === 'friends' && (
            <FriendsTab
              friends={props.friends}
              user={props.user}
              removeFriend={props.removeFriend}
              isLoading={props.isLoading}
            />
          )}
        </YStack>
      </KeyboardAvoidingView>
    </YStack>
  );
};

export function FriendsModal({ open, onOpenChange }: FriendsModalProps) {
  const { user } = useUser();
  const {
    friends,
    incomingRequests,
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

  const modalProps = {
    user,
    friends,
    incomingRequests,
    searchResults,
    isLoading,
    error,
    debouncedSearch,
    sendRequest,
    acceptRequest,
    removeFriend,
  };

  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => onOpenChange(false)}>
        <YStack flex={1} backgroundColor="$background" padding="$4">
          <ModalContent {...modalProps} onOpenChange={onOpenChange} />
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
        <ModalContent {...modalProps} onOpenChange={onOpenChange} isSheet={true} />
      </Sheet.Frame>
    </Sheet>
  );
}
