import { Card, H2, XStack, Avatar, Button, Text, YStack } from 'tamagui';
import { Users, Plus } from '@tamagui/lucide-icons';
import { PageWrapper } from '~/components/Layout/PageWrapper';

const sampleGroups = [
  {
    id: 1,
    name: 'Roommates',
    members: ['John', 'Sarah', 'Mike', 'Lisa'],
    totalExpenses: 2450.8,
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    name: 'Road Trip',
    members: ['John', 'Sarah', 'Mike'],
    totalExpenses: 856.4,
    lastActivity: '1 day ago',
  },
  {
    id: 3,
    name: 'Lunch Group',
    members: ['John', 'Sarah'],
    totalExpenses: 124.5,
    lastActivity: '3 days ago',
  },
];

function GroupCard({ group }: { group: (typeof sampleGroups)[0] }) {
  return (
    <Card elevate bordered padding="$4" size="$4" animation="lazy">
      <XStack space="$4" alignItems="center">
        <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
          <Users size={24} color="$blue10" />
        </Card>

        <YStack flex={1} space="$1">
          <Text fontSize="$6" fontWeight="bold">
            {group.name}
          </Text>
          <Text theme="alt2" fontSize="$3">
            {group.lastActivity}
          </Text>
        </YStack>

        <YStack alignItems="flex-end">
          <Text fontSize="$6" fontWeight="bold" color="$blue10">
            ${group.totalExpenses.toFixed(2)}
          </Text>
          <Text theme="alt2" fontSize="$3">
            {group.members.length} members
          </Text>
        </YStack>
      </XStack>

      <XStack marginTop="$4" space="$2" flexWrap="wrap">
        {group.members.map((member, index) => (
          <Avatar key={index} circular size="$3">
            <Avatar.Image source={{ uri: `https://i.pravatar.cc/150?u=${member}` }} />
            <Avatar.Fallback backgroundColor="$blue5" />
          </Avatar>
        ))}
      </XStack>
    </Card>
  );
}

export default function GroupsScreen() {
  return (
    <PageWrapper>
      <XStack justifyContent="space-between" alignItems="center">
        <H2 size="$8" color="$blue10">
          Groups
        </H2>
        <Button size="$4" theme="blue" icon={Plus} circular onPress={() => {}} />
      </XStack>

      <Card elevate bordered padding="$4" size="$4" backgroundColor="$blue5">
        <XStack justifyContent="space-between">
          <YStack>
            <Text theme="alt2">Total Groups</Text>
            <Text fontSize="$8" fontWeight="bold" color="$blue10">
              {sampleGroups.length}
            </Text>
          </YStack>
          <YStack alignItems="flex-end">
            <Text theme="alt2">Total Members</Text>
            <Text fontSize="$5" fontWeight="bold">
              {new Set(sampleGroups.flatMap((g) => g.members)).size}
            </Text>
          </YStack>
        </XStack>
      </Card>

      <YStack space="$4">
        {sampleGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </YStack>
    </PageWrapper>
  );
}
