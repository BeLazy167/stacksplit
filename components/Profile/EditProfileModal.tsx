import { useState } from 'react';
import {
  Adapt,
  Button,
  Dialog,
  Sheet,
  Unspaced,
  XStack,
  YStack,
  Text,
  Label,
  Input,
  Fieldset,
} from 'tamagui';
import { X, AlertTriangle } from '@tamagui/lucide-icons';
import { Platform } from 'react-native';

type EditProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  userEmail: string;
  onUpdateUsername: (username: string) => Promise<void>;
};

export function EditProfileModal({
  open,
  onOpenChange,
  currentUsername,
  userEmail,
  onUpdateUsername,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const validateUsername = (value: string) => {
    if (value.length < 6) {
      return 'Username must be at least 6 characters';
    }
    if (value.length > 14) {
      return 'Username must be less than 14 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return '';
  };

  const handleSaveAttempt = () => {
    if (username === currentUsername) {
      onOpenChange(false);
      return;
    }

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmedSave = async () => {
    try {
      setIsLoading(true);
      setError('');
      await onUpdateUsername(username);
      setShowConfirmDialog(false);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  const Content = () => (
    <YStack space="$5" padding="$4">
      <Text fontSize="$8" fontWeight="bold">
        Edit Profile
      </Text>

      <Text fontSize="$4" color="$gray11">
        Make changes to your username. Your email cannot be changed.
      </Text>

      <YStack space="$5">
        {/* Username Field */}
        <YStack space="$2">
          <Text fontSize="$5" fontWeight="600">
            Username
          </Text>
          <Input
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError('');
            }}
            placeholder="6-14 characters"
            borderColor={error ? '$red8' : undefined}
            autoCapitalize="none"
            size="$4"
          />
          {error && (
            <Text fontSize="$3" color="$red10">
              {error}
            </Text>
          )}
        </YStack>

        {/* Email Field */}
        <YStack space="$2">
          <Text fontSize="$5" fontWeight="600">
            Email
          </Text>
          <Input value={userEmail} size="$4" opacity={0.6} disabled />
        </YStack>
      </YStack>

      <XStack alignSelf="flex-end" gap="$3" marginTop="$4">
        <Button
          variant="outlined"
          disabled={isLoading}
          onPress={() => onOpenChange(false)}
          backgroundColor="transparent"
          borderColor="$gray7">
          <Button.Text>Cancel</Button.Text>
        </Button>
        <Button
          theme="active"
          onPress={handleSaveAttempt}
          backgroundColor="$blue9"
          disabled={
            isLoading || username === currentUsername || Boolean(error) || username.length === 0
          }>
          <Button.Text color="white">{isLoading ? 'Saving...' : 'Save changes'}</Button.Text>
        </Button>
      </XStack>
    </YStack>
  );

  const ConfirmationContent = () => (
    <YStack space="$4" padding="$4">
      <XStack space="$2" alignItems="center">
        <AlertTriangle size={20} color="$orange9" />
        <Text fontSize="$6" fontWeight="bold">
          Confirm Username Change
        </Text>
      </XStack>

      <Text>
        Are you sure you want to change your username from{' '}
        <Text fontWeight="bold">{currentUsername}</Text> to{' '}
        <Text fontWeight="bold">{username}</Text>?
      </Text>

      <XStack alignSelf="flex-end" gap="$3" marginTop="$4">
        <Button
          variant="outlined"
          onPress={() => setShowConfirmDialog(false)}
          disabled={isLoading}
          borderColor="$gray7"
          backgroundColor="transparent">
          <Button.Text>Cancel</Button.Text>
        </Button>
        <Button
          theme="active"
          onPress={handleConfirmedSave}
          disabled={isLoading}
          backgroundColor="$blue9">
          <Button.Text color="white">{isLoading ? 'Saving...' : 'Confirm Change'}</Button.Text>
        </Button>
      </XStack>
    </YStack>
  );

  if (Platform.OS === 'android') {
    return (
      <>
        <Sheet
          modal
          open={open}
          onOpenChange={onOpenChange}
          snapPoints={[85]}
          position={0}
          dismissOnSnapToBottom>
          <Sheet.Overlay />
          <Sheet.Frame>
            <Sheet.Handle />
            <Content />
          </Sheet.Frame>
        </Sheet>

        <Sheet
          modal
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          snapPoints={[50]}
          position={0}
          dismissOnSnapToBottom>
          <Sheet.Overlay />
          <Sheet.Frame>
            <Sheet.Handle />
            <ConfirmationContent />
          </Sheet.Frame>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            width="90%"
            maxWidth={500}
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}>
            <Content />
            <Unspaced>
              <Dialog.Close asChild>
                <Button
                  position="absolute"
                  top="$4"
                  right="$4"
                  size="$3"
                  circular
                  icon={X}
                  disabled={isLoading}
                />
              </Dialog.Close>
            </Unspaced>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <Dialog modal open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="confirm-overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="confirm-content"
            width="90%"
            maxWidth={400}
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}>
            <ConfirmationContent />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
