import { useState, useCallback } from 'react';
import { Sheet, Input, Button, XStack, YStack, Text, H2, useTheme } from 'tamagui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/utils/query-client';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  userEmail: string;
  onUpdateUsername: (username: string) => Promise<void>;
}

export function EditProfileModal({
  open,
  onOpenChange,
  currentUsername,
  userEmail,
  onUpdateUsername,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const theme = useTheme();

  const validateUsername = useCallback((value: string) => {
    if (value.length < 6) {
      return 'Username must be at least 6 characters';
    }
    if (value.length > 14) {
      return 'Username must be less than 14 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  }, []);

  const updateUsernameMutation = useMutation({
    mutationFn: onUpdateUsername,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      onOpenChange(false);
    },
    onError: (error) => {
      setError('Failed to update username. Please try again.');
    },
  });

  const handleUsernameChange = (text: string) => {
    setUsername(text);
  };

  const handleSubmit = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (username === currentUsername) {
      onOpenChange(false);
      return;
    }

    updateUsernameMutation.mutate(username);
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[45]}
      position={0}
      dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Frame padding="$4" space="$4" backgroundColor={theme.background.val}>
        <Sheet.Handle />
        <YStack space="$4">
          <H2 size="$6" fontWeight="bold">
            Edit Profile
          </H2>

          <YStack space="$2">
            <Text theme="alt2">Username</Text>
            <Input
              // value={username}
              defaultValue={currentUsername}
              onChangeText={handleUsernameChange}
              placeholder="6-14 characters"
              borderWidth={2}
              borderColor={error ? '$red8' : '$gray8'}
              autoCapitalize="none"
              size="$4"
              focusStyle={{
                borderColor: error ? '$red8' : '$blue8',
              }}
            />
            {error && <Text color="$red10">{error}</Text>}
          </YStack>

          <YStack space="$2">
            <Text theme="alt2">Email</Text>
            <Input value={userEmail} editable={false} size="$4" opacity={0.7} borderWidth={2} />
          </YStack>

          <XStack space="$4" justifyContent="flex-end">
            <Button
              size="$4"
              theme="gray"
              onPress={() => onOpenChange(false)}
              disabled={updateUsernameMutation.isPending}>
              Cancel
            </Button>
            <Button
              size="$4"
              theme="blue"
              onPress={handleSubmit}
              disabled={
                !username ||
                username === currentUsername ||
                updateUsernameMutation.isPending ||
                !!error
              }>
              {updateUsernameMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
