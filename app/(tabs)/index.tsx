import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, YStack, Button, H1, XStack, Card, Paragraph } from 'tamagui';
import HomePage from '~/components/Home/HomePage';

export default function Page() {
  return (
    <YStack
      f={1}
      padding="$4"
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center">
      <SignedIn>
        <HomePage />
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
