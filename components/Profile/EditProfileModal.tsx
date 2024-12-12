import { useState } from 'react';
import { Sheet, Input, Button, XStack, YStack, Text, H2, Circle, ScrollView } from 'tamagui';
import { useUser } from '@clerk/clerk-expo';
import { Camera, X } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import { updateUserProfile } from '../../utils/firebase';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  userEmail: string;
  onUpdateUsername: (username: string) => Promise<void>;
}

interface ProfileImageSectionProps {
  selectedImage: string | null;
  userImageUrl?: string;
  onImagePick: () => void;
  isLoading: boolean;
}

const ProfileImageSection = ({
  selectedImage,
  userImageUrl,
  onImagePick,
  isLoading,
}: ProfileImageSectionProps) => (
  <YStack alignItems="center" space="$3">
    <Circle size={100} borderWidth={2} borderColor="$gray8" overflow="hidden">
      <Image
        source={{ uri: selectedImage || userImageUrl }}
        style={{ width: 100, height: 100 }}
        contentFit="cover"
      />
    </Circle>

    <Button size="$3" theme="blue" icon={Camera} onPress={onImagePick} disabled={isLoading}>
      Change Photo
    </Button>
  </YStack>
);

interface ProfileFormProps {
  username: string;
  userEmail: string;
  error: string;
  isLoading: boolean;
  onUsernameChange: (text: string) => void;
}

const ProfileForm = ({
  username,
  userEmail,
  error,
  isLoading,
  onUsernameChange,
}: ProfileFormProps) => (
  <YStack space="$4" flex={1}>
    <YStack space="$2">
      <Text color="$gray11">Username</Text>
      <Input
        value={username}
        onChangeText={onUsernameChange}
        placeholder="Enter username"
        borderColor={error ? '$red8' : '$gray8'}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        returnKeyType="done"
      />
      {error && (
        <Text color="$red10" fontSize="$2">
          {error}
        </Text>
      )}
    </YStack>

    <YStack space="$2">
      <Text color="$gray11">Email</Text>
      <Input value={userEmail} editable={false} opacity={0.7} backgroundColor="$gray3" />
    </YStack>
  </YStack>
);

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  hasChanges: boolean;
}

const ActionButtons = ({ onSave, onCancel, isLoading, hasChanges }: ActionButtonsProps) => (
  <YStack space="$4">
    <Button size="$4" theme="blue" onPress={onSave} disabled={isLoading || !hasChanges}>
      {isLoading ? 'Saving...' : 'Save Changes'}
    </Button>
    <Button size="$4" theme="gray" onPress={onCancel} disabled={isLoading}>
      Cancel
    </Button>
  </YStack>
);

const ModalContent = ({ onOpenChange, isSheet = false, ...props }: any) => {
  const { user } = useUser();
  const [username, setUsername] = useState(props.currentUsername);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [base64Data, setBase64Data] = useState('');

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access gallery was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage(result.assets[0].uri);
        setBase64Data(result.assets[0].base64 || '');
        setError('');
      }
    } catch (err) {
      setError('Failed to pick image');
      console.error('Image pick error:', err);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (selectedImage && base64Data) {
        const formattedBase64 = `data:image/jpeg;base64,${base64Data}`;
        await user?.setProfileImage({
          file: formattedBase64,
        });
      }

      if (username !== props.currentUsername) {
        await props.onUpdateUsername(username);
      }

      if (user) {
        await updateUserProfile(user.id, {
          userId: user.id,
          username: username,
          email: props.userEmail,
          imageUrl: selectedImage || user.imageUrl,
          updatedAt: Date.now(),
        });
      }

      onOpenChange(false);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = username !== props.currentUsername || selectedImage !== null;

  return (
    <YStack space="$4" flex={1}>
      <XStack justifyContent="space-between" alignItems="center">
        <H2 size="$6">Edit Profile</H2>
        <Button
          size="$3"
          circular
          icon={X}
          onPress={() => onOpenChange(false)}
          disabled={isLoading}
          chromeless
        />
      </XStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          flex={1}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none">
          <YStack space="$4" flex={1} paddingBottom="$4">
            <ProfileImageSection
              selectedImage={selectedImage}
              userImageUrl={user?.imageUrl}
              onImagePick={handleImagePick}
              isLoading={isLoading}
            />

            <ProfileForm
              username={username}
              userEmail={props.userEmail}
              error={error}
              isLoading={isLoading}
              onUsernameChange={(text) => {
                setUsername(text);
                setError('');
              }}
            />

            <ActionButtons
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
              isLoading={isLoading}
              hasChanges={hasChanges}
            />
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </YStack>
  );
};

export function EditProfileModal({
  open,
  onOpenChange,
  currentUsername,
  userEmail,
  onUpdateUsername,
}: EditProfileModalProps) {
  const modalProps = {
    currentUsername,
    userEmail,
    onUpdateUsername,
  };

  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => onOpenChange(false)}>
        <YStack flex={1} backgroundColor="$background" padding="$4">
          <ModalContent {...modalProps} onOpenChange={onOpenChange} />
        </YStack>
      </Modal>
    );
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
      position={0}
      dismissOnSnapToBottom
      zIndex={100000}>
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame padding="$4" space="$4" backgroundColor="$background">
        <Sheet.Handle />
        <ModalContent {...modalProps} onOpenChange={onOpenChange} isSheet={true} />
      </Sheet.Frame>
    </Sheet>
  );
}
