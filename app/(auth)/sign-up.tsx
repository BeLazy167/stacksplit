import { useState } from 'react';
import { Alert } from 'react-native';
import { YStack, Input, Button, Text, Form, XStack, Card, H1, Paragraph, Separator } from 'tamagui';
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from '@tamagui/lucide-icons';
import { useSignUp } from '@clerk/clerk-expo';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <YStack f={1} padding="$4" space="$4" backgroundColor="$background">
      <YStack space="$4" marginVertical="$6">
        <H1 size="$9" color="$blue10">
          Join StackSplit
        </H1>
        <Paragraph size="$5" theme="alt2">
          Create an account to start splitting expenses
        </Paragraph>
      </YStack>

      <Card elevate bordered padding="$4" size="$4">
        <Form onSubmit={onSignUpPress} space="$4">
          <YStack space="$3">
            <Text fontWeight="600">Username</Text>
            <Input
              size="$4"
              placeholder="Enter your username"
              autoCapitalize="none"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </YStack>

          <YStack space="$3">
            <Text fontWeight="600">Email</Text>
            <Input
              size="$4"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={(text) => setEmailAddress(text)}
            />
          </YStack>

          <YStack space="$3">
            <Text fontWeight="600">Password</Text>
            <Input
              size="$4"
              placeholder="Choose a password"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </YStack>

          <Button
            size="$4"
            theme="active"
            backgroundColor="$blue10"
            onPress={onSignUpPress}
            pressStyle={{ opacity: 0.8 }}
            animation="quick">
            {pendingVerification ? 'Verify Email' : 'Create Account'}
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
          <Text>Already have an account?</Text>
          <Text
            color="$blue10"
            fontWeight="600"
            onPress={() => router.push('/sign-in')}
            pressStyle={{ opacity: 0.8 }}>
            Sign in
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
