import { useAuth, useUser } from '@clerk/clerk-expo';
import { Text, YStack, Button, H2, Card, XStack, Switch, Avatar, Separator } from 'tamagui';
import { PageWrapper } from '~/components/Layout/PageWrapper';
import { Moon, Settings, ChevronRight, Sun } from '@tamagui/lucide-icons';
import { EditProfileModal } from '~/components/Profile/EditProfileModal';
import { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useDarkMode } from '~/utils/DarkModeContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const menuItems = [
    {
      icon: isDarkMode ? Moon : Sun,
      label: 'Dark Mode',
      value: isDarkMode,
      onValueChange: toggleDarkMode,
    },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <PageWrapper>
      <H2 size="$8" color="$blue10">
        Profile
      </H2>

      <Card elevate bordered padding="$4" size="$4" space="$4">
        <XStack space="$4" alignItems="center">
          <Avatar circular size="$6">
            <Avatar.Image source={{ uri: user?.imageUrl }} />
            <Avatar.Fallback backgroundColor="$blue5" />
          </Avatar>

          <YStack>
            <Text fontSize="$6" fontWeight="bold">
              {user?.username}
            </Text>
            <Text theme="alt2">{user?.emailAddresses[0].emailAddress}</Text>
          </YStack>
        </XStack>
        <Button onPress={() => setIsOpen(true)}>
          <XStack alignItems="center" space="$2">
            <Settings size={16} color="$color" />
            <Text>Edit Profile</Text>
          </XStack>
        </Button>
        {Platform.OS === 'ios' ? (
          <EditProfileModal
            open={isOpen}
            onOpenChange={setIsOpen}
            currentUsername={user?.username ?? ''}
            userEmail={user?.emailAddresses[0].emailAddress ?? ''}
            onUpdateUsername={async (newUsername) => {
              await user?.update({
                username: newUsername,
              });
            }}
          />
        ) : (
          isOpen && (
            <EditProfileModal
              open={isOpen}
              onOpenChange={setIsOpen}
              currentUsername={user?.username ?? ''}
              userEmail={user?.emailAddresses[0].emailAddress ?? ''}
              onUpdateUsername={async (newUsername) => {
                await user?.update({
                  username: newUsername,
                });
              }}
            />
          )
        )}
      </Card>

      <Card bordered padding="$4" size="$4" space="$4">
        {menuItems.map((item, index) => (
          <YStack key={item.label}>
            <XStack alignItems="center" justifyContent="space-between" paddingVertical="$2">
              <XStack space="$2" alignItems="center">
                <item.icon size={20} color="$color" />
                <Text>{item.label}</Text>
              </XStack>
              {'value' in item ? (
                <Switch
                  checked={item.value}
                  onCheckedChange={item.onValueChange}
                  animation={[
                    'quick',
                    {
                      transform: {
                        type: 'lazy',
                        damping: 20,
                        stiffness: 160,
                      },
                    },
                  ]}
                  backgroundColor={item.value ? '$blue10' : '$gray5'}
                  size="$3"
                  margin="$-0.5"
                  padding="$0.5"
                  borderRadius="$10"
                  pressStyle={{
                    scale: 0.97,
                    opacity: 0.9,
                  }}>
                  <Switch.Thumb
                    animation="quick"
                    scale={0.9}
                    backgroundColor="$background"
                    shadowColor="black"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                  />
                </Switch>
              ) : (
                <ChevronRight size={20} color="$gray10" />
              )}
            </XStack>
            {index < menuItems.length - 1 && <Separator marginVertical="$2" />}
          </YStack>
        ))}
      </Card>

      <Button size="$4" theme="active" onPress={() => signOut()} pressStyle={{ opacity: 0.7 }}>
        Sign Out
      </Button>
    </PageWrapper>
  );
}
