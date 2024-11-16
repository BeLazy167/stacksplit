import { Redirect, Tabs } from 'expo-router';
import { Home, Receipt, Users, User, Plus } from '@tamagui/lucide-icons';
import { useTheme, YStack, Text } from 'tamagui';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <YStack f={1} backgroundColor={theme.background.val}>
      <SignedIn>
        <Tabs
          screenOptions={{
            tabBarStyle: {
              backgroundColor: theme.background.val,
              borderTopColor: theme.borderColor.val,
              height: 60,
              paddingBottom: 4,
              paddingTop: 4,
            },
            tabBarActiveTintColor: theme.blue10.val,
            tabBarInactiveTintColor: theme.gray11.val,
            headerStyle: {
              backgroundColor: theme.background.val,
            },
            headerTintColor: theme.color.val,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontFamily: 'AdelleCyrillic-SemiBold',
              fontWeight: '600',
              fontSize: 12,
            },
            tabBarLabelStyle: {
              fontFamily: 'AdelleCyrillic-SemiBold',
              fontSize: 12,
              fontWeight: '500',
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="settlements"
            options={{
              title: 'Settlements',
              tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="create-expense"
            options={{
              title: 'Create',
              tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="groups"
            options={{
              title: 'Groups',
              tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
              headerShown: false,
            }}
          />
        </Tabs>
      </SignedIn>
      <SignedOut>
        <Redirect href="/(auth)/sign-in" />
        <YStack alignItems="center" padding="$4">
          <Text color={theme.gray11.val} fontSize={16} fontFamily="$body" fontWeight="$6">
            Please sign in to access the tabs.
          </Text>
        </YStack>
      </SignedOut>
    </YStack>
  );
}
