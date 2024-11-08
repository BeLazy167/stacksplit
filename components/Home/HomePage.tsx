import { Card, H1, YStack, XStack, Text, ScrollView } from 'tamagui';
import { DollarSign, ArrowUpRight, ArrowDownRight, Users } from '@tamagui/lucide-icons';

const stats = [
  {
    label: 'Total Balance',
    value: '$2,450.80',
    subValue: '+$350.20',
    icon: DollarSign,
    type: 'positive',
  },
  {
    label: 'You Owe',
    value: '$180.50',
    subValue: '3 people',
    icon: ArrowUpRight,
    type: 'negative',
  },
  {
    label: 'You are Owed',
    value: '$425.30',
    subValue: '5 people',
    icon: ArrowDownRight,
    type: 'positive',
  },
  {
    label: 'Active Groups',
    value: '4',
    subValue: '12 members',
    icon: Users,
    type: 'neutral',
  },
];

const StatCard = ({ stat }: { stat: any }) => (
  <Card elevate bordered animation="lazy" backgroundColor="white" padding="$4" marginVertical="$2">
    <YStack space="$2">
      <Text color="$gray10" fontSize={16}>
        {stat.label}
      </Text>
      <Text fontSize={32} fontWeight="700" lineHeight={40}>
        {stat.value}
      </Text>
      <XStack space="$2" alignItems="center">
        <stat.icon
          size={14}
          color={
            stat.type === 'positive' ? '$green10' : stat.type === 'negative' ? '$red10' : '$gray10'
          }
        />
        <Text
          fontSize={14}
          color={
            stat.type === 'positive' ? '$green10' : stat.type === 'negative' ? '$red10' : '$gray10'
          }>
          {stat.subValue}
        </Text>
      </XStack>
    </YStack>
  </Card>
);

export default function HomePage() {
  return (
    <ScrollView backgroundColor="$gray1">
      <YStack f={1} padding="$4">
        <H1 size="$10" color="$gray12" marginBottom="$4" fontWeight="800">
          Overview
        </H1>

        <YStack>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
