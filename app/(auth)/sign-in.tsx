import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { YStack, Input, Button, Text, Form, XStack, Card, H1, Paragraph, Separator } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: credentials.email,
        password: credentials.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Invalid email or password');
    }
  }, [isLoaded, credentials.email, credentials.password]);

  return (
    <YStack f={1} padding="$4" space="$4" backgroundColor="$background">
      <YStack space="$4" marginVertical="$6">
        <H1 size="$9" color="$blue10">
          StackSplit
        </H1>
        <Paragraph size="$5" theme="alt2">
          Welcome back! Sign in to manage your expenses
        </Paragraph>
      </YStack>

      <Card elevate bordered padding="$4" size="$4">
        <Form onSubmit={onSignInPress} space="$4">
          <YStack space="$3">
            <Text fontWeight="600">Email or Username</Text>
            <Input
              size="$4"
              placeholder="Enter your email and username"
              autoCapitalize="none"
              keyboardType="email-address"
              value={credentials.email}
              onChangeText={(text) => setCredentials((prev) => ({ ...prev, email: text }))}
            />
          </YStack>

          <YStack space="$3">
            <Text fontWeight="600">Password</Text>
            <Input
              size="$4"
              placeholder="Enter your password"
              secureTextEntry
              value={credentials.password}
              onChangeText={(text) => setCredentials((prev) => ({ ...prev, password: text }))}
            />
          </YStack>

          <Button
            size="$4"
            theme="active"
            backgroundColor="$blue10"
            onPress={onSignInPress}
            disabled={loading}
            pressStyle={{ opacity: 0.8 }}
            animation="quick">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
      </Card>

      <YStack space="$4" alignItems="center">
        <XStack space="$2" alignItems="center">
          <Separator />
          <Text color="$gray11">OR</Text>
          <Separator />
        </XStack>

        <XStack space="$2" justifyContent="center">
          <Text>Don't have an account?</Text>
          <Text
            color="$blue10"
            fontWeight="600"
            onPress={() => router.push('/sign-up')}
            pressStyle={{ opacity: 0.8 }}>
            Sign up
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
