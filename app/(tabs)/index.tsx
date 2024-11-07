import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, YStack, Button, H1, XStack, Card, Paragraph } from 'tamagui';

export default function Page() {
  const { user } = useUser();
  const { signOut } = useAuth();
  return (
    <YStack
      f={1}
      padding="$4"
      space="$4"
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center">
      <SignedIn>
        <Card elevate bordered padding="$4" size="$4" space="$4" alignItems="center">
          <H1 size="$9" color="$blue10">
            Welcome Back!
          </H1>
          <Paragraph size="$5" theme="alt2">
            Hello {user?.emailAddresses[0].emailAddress}
          </Paragraph>
          <Button
            size="$4"
            theme="active"
            backgroundColor="$blue10"
            onPress={() => signOut()}
            pressStyle={{ opacity: 0.8 }}
            animation="quick">
            Sign Out
          </Button>
        </Card>
      </SignedIn>
      <SignedOut>
        <Card elevate bordered padding="$4" size="$4" space="$4" alignItems="center">
          <H1 size="$9" color="$blue10">
            Welcome to StackSplit
          </H1>
          <Paragraph size="$5" theme="alt2">
            Please sign in or sign up to continue
          </Paragraph>
          <XStack space="$4">
            <Link href="/(auth)/sign-in" asChild>
              <Button
                size="$4"
                theme="active"
                backgroundColor="$blue10"
                pressStyle={{ opacity: 0.8 }}
                animation="quick">
                Sign In
              </Button>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <Button
                size="$4"
                theme="active"
                backgroundColor="$blue10"
                pressStyle={{ opacity: 0.8 }}
                animation="quick">
                Sign Up
              </Button>
            </Link>
          </XStack>
        </Card>
      </SignedOut>
    </YStack>
  );
}
