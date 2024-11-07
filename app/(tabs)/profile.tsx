import { useAuth, useUser } from '@clerk/clerk-expo';
import { Text, YStack, Button, H2, Card, XStack, Switch, Avatar, Separator } from 'tamagui';
import { Moon, Bell, Shield, CreditCard, HelpCircle, Settings } from '@tamagui/lucide-icons';

const menuItems = [
  { icon: Bell, label: 'Notifications', value: true },
  { icon: Moon, label: 'Dark Mode', value: false },
  { icon: Shield, label: 'Privacy', href: '/privacy' },
  { icon: CreditCard, label: 'Payment Methods', href: '/payments' },
  { icon: HelpCircle, label: 'Help & Support', href: '/support' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <YStack f={1} padding="$4" space="$4">
      <H2 size="$8" color="$blue10">Profile</H2>

      <Card elevate bordered padding="$4" size="$4" space="$4">
        <XStack space="$4" alignItems="center">
          <Avatar circular size="$6">
            <Avatar.Image source={{ uri: user?.imageUrl }} />
            <Avatar.Fallback backgroundColor="$blue5" />
          </Avatar>
          
          <YStack>
            <Text fontSize="$6" fontWeight="bold">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text theme="alt2">
              {user?.emailAddresses[0].emailAddress}
            </Text>
          </YStack>
        </XStack>
      </Card>

      <Card elevate bordered padding="$4" size="$4" space="$4">
        {menuItems.map((item, index) => (
          <YStack key={item.label}>
            <XStack alignItems="center" justifyContent="space-between" paddingVertical="$2">
              <XStack space="$2" alignItems="center">
                <item.icon size={20} color="$color" />
                <Text>{item.label}</Text>
              </XStack>
              {'value' in item ? (
                <Switch size="$4" defaultChecked={item.value} />
              ) : (
                <Text color="$blue10">›</Text>
              )}
            </XStack>
            {index < menuItems.length - 1 && <Separator marginVertical="$2" />}
          </YStack>
        ))}
      </Card>

      <Button
        size="$4"
        theme="red"
        onPress={() => signOut()}
        pressStyle={{ opacity: 0.7 }}>
        Sign Out
      </Button>
    </YStack>
  );
} 