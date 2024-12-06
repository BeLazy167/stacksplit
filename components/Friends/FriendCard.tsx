// src/components/FriendCard.tsx
import { Card, XStack, YStack, Text, Avatar, Button, ThemeName } from 'tamagui';
import { Users } from '@tamagui/lucide-icons';
import { UserProfile } from '~/types/friends';

interface FriendCardProps {
  profile: UserProfile;
  action: {
    label: string;
    icon: any;
    onPress: () => void;
    theme?: string;
    disabled?: boolean;
  };
}

export function FriendCard({ profile, action }: FriendCardProps) {
  return (
    <Card
      animation="lazy"
      scale={0.97}
      hoverStyle={{ scale: 0.99 }}
      pressStyle={{ scale: 0.95 }}
      borderColor="$gray5"
      backgroundColor="$gray1">
      <XStack space="$3" padding="$3" alignItems="center">
        <Avatar circular size="$5">
          <Avatar.Image source={{ uri: profile.imageUrl }} />
          <Avatar.Fallback backgroundColor="$blue5">
            <Users size={20} color="$blue10" />
          </Avatar.Fallback>
        </Avatar>
        <YStack flex={1} space="$1">
          <Text fontWeight="bold" fontSize="$5">
            {profile.username}
          </Text>
          <Text fontSize="$3" color="$gray11">
            {profile.email}
          </Text>
        </YStack>
        <Button
          size="$3"
          theme={action.theme as ThemeName}
          icon={action.icon}
          onPress={action.onPress}
          disabled={action.disabled}>
          {action.label}
        </Button>
      </XStack>
    </Card>
  );
}
