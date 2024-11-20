import { useAuth, useUser } from '@clerk/clerk-expo';
import { Text, YStack, Button, H2, Card, XStack, Avatar, Separator } from 'tamagui';
import { PageWrapper } from '~/components/Layout/PageWrapper';
import { Moon, Settings, ChevronRight, Sun } from '@tamagui/lucide-icons';
import { EditProfileModal } from '~/components/Profile/EditProfileModal';
import { useState, memo, useCallback } from 'react';
import { useDarkMode } from '~/utils/DarkModeContext';
import { Switch as RNSwitch } from 'react-native';
import { useTheme } from 'tamagui';

// Custom Switch component using React Native's Switch for better performance
const ThemeSwitch = memo(function ThemeSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: theme.gray5.val,
        true: theme.blue10.val,
      }}
      thumbColor={theme.background.val}
      ios_backgroundColor={theme.gray5.val}
    />
  );
});

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Memoize handlers
  const handleThemeChange = useCallback(
    (value: boolean) => {
      toggleDarkMode();
    },
    [toggleDarkMode]
  );

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const handleEditProfile = useCallback(() => {
    setIsOpen(true);
  }, []);

  if (!isLoaded || !user) {
    return (
      <PageWrapper>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text>Loading...</Text>
        </YStack>
      </PageWrapper>
    );
  }

  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  return (
    <PageWrapper>
      <YStack flex={1} space="$4">
        <H2 size="$8" color="$blue10">
          Profile
        </H2>

        {/* Profile Card */}
        <Card elevate bordered padding="$4" size="$4" space="$4">
          <XStack space="$4" alignItems="center">
            <Avatar circular size="$6">
              <Avatar.Image source={{ uri: user.imageUrl }} />
              <Avatar.Fallback backgroundColor="$blue5" />
            </Avatar>

            <YStack flex={1}>
              <Text fontSize="$6" fontWeight="bold">
                {user.username || 'Username not set'}
              </Text>
              <Text theme="alt2">{primaryEmail || 'No email'}</Text>
            </YStack>
          </XStack>

          <Button onPress={handleEditProfile} pressStyle={{ opacity: 0.7 }}>
            <XStack alignItems="center" space="$2">
              <Settings size={16} color="$color" />
              <Text>Edit Profile</Text>
            </XStack>
          </Button>
        </Card>

        {/* Settings Card */}
        <Card bordered padding="$4" size="$4" space="$4">
          <YStack>
            <XStack alignItems="center" justifyContent="space-between" paddingVertical="$2">
              <XStack space="$2" alignItems="center">
                {isDarkMode ? <Moon size={20} color="$color" /> : <Sun size={20} color="$color" />}
                <Text>Dark Mode</Text>
              </XStack>
              <ThemeSwitch value={isDarkMode} onValueChange={handleThemeChange} />
            </XStack>
            <Separator marginVertical="$2" />

            <Button chromeless pressStyle={{ opacity: 0.7 }}>
              <XStack alignItems="center" justifyContent="space-between" paddingVertical="$2">
                <XStack space="$2" alignItems="center">
                  <Settings size={20} color="$color" />
                  <Text>Settings</Text>
                </XStack>
                <ChevronRight size={20} color="$gray10" />
              </XStack>
            </Button>
          </YStack>
        </Card>

        <Button size="$4" theme="active" onPress={handleSignOut} pressStyle={{ opacity: 0.7 }}>
          Sign Out
        </Button>

        <EditProfileModal
          open={isOpen}
          onOpenChange={setIsOpen}
          currentUsername={user.username || ''}
          userEmail={primaryEmail || ''}
          onUpdateUsername={async (newUsername: string) => {
            try {
              await user.update({ username: newUsername });
            } catch (error) {
              console.error('Failed to update username:', error);
              throw error;
            }
          }}
        />
      </YStack>
    </PageWrapper>
  );
}
