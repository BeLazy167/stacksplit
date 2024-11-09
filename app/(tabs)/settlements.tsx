import { Text, YStack, Card, H2, ScrollView, XStack, Avatar, Separator } from 'tamagui';
import { DollarSign, Coffee, ShoppingCart, Car, Home } from '@tamagui/lucide-icons';

// Add new type definitions
type Settlement = {
  userId: string;
  userName: string;
  amount: number;
};

const currentUserId = 'John'; // This would come from your auth system

const sampleExpenses = [
  {
    id: 1,
    title: 'Coffee Run',
    amount: 24.5,
    date: '2024-03-15',
    category: 'Food',
    participants: ['John', 'Sarah', 'Mike'],
    icon: Coffee,
    payer: 'John',
  },
  {
    id: 2,
    title: 'Grocery Shopping',
    amount: 156.8,
    date: '2024-03-14',
    category: 'Shopping',
    participants: ['John', 'Sarah'],
    icon: ShoppingCart,
    payer: 'Sarah',
  },
  {
    id: 3,
    title: 'Uber Ride',
    amount: 32.4,
    date: '2024-03-14',
    category: 'Transport',
    participants: ['John', 'Mike'],
    icon: Car,
    payer: 'John',
  },
  {
    id: 4,
    title: 'Rent Payment',
    amount: 1200.0,
    date: '2024-03-01',
    category: 'Housing',
    participants: ['John', 'Sarah', 'Mike', 'Lisa'],
    icon: Home,
    payer: 'Lisa',
  },
];

// New function to calculate settlements
function calculateSettlements(expenses: typeof sampleExpenses, userId: string): Settlement[] {
  const settlements: { [key: string]: number } = {};

  expenses.forEach((expense) => {
    const totalPerPerson = expense.amount / expense.participants.length;
    const isPayer = expense.payer === userId;

    expense.participants.forEach((participant) => {
      if (participant !== userId) {
        if (isPayer) {
          // You paid, others owe you
          settlements[participant] = (settlements[participant] || 0) + totalPerPerson;
        } else if (expense.payer === participant) {
          // They paid, you owe them
          settlements[participant] = (settlements[participant] || 0) - totalPerPerson;
        }
      }
    });
  });

  return Object.entries(settlements).map(([userName, amount]) => ({
    userId: userName,
    userName,
    amount: Number(amount.toFixed(2)),
  }));
}

function SettlementCard({ settlement }: { settlement: Settlement }) {
  const isPositive = settlement.amount > 0;

  return (
    <Card elevate bordered padding="$4" size="$4" animation="lazy">
      <XStack space="$4" alignItems="center">
        <Avatar circular size="$4">
          <Avatar.Image source={{ uri: `https://i.pravatar.cc/150?u=${settlement.userName}` }} />
          <Avatar.Fallback backgroundColor="$blue5" />
        </Avatar>

        <YStack flex={1}>
          <Text fontSize="$6" fontFamily="$body" fontWeight="$7">
            {settlement.userName}
          </Text>
          <Text theme="alt2" fontSize="$3" fontFamily="$body" fontWeight="$4">
            {isPositive ? 'Owes you' : 'You owe'}
          </Text>
        </YStack>

        <Text
          fontSize="$6"
          fontFamily="$body"
          fontWeight="$7"
          color={isPositive ? '$green10' : '$red10'}>
          ${Math.abs(settlement.amount).toFixed(2)}
        </Text>
      </XStack>
    </Card>
  );
}

export default function ExpensesScreen() {
  const settlements = calculateSettlements(sampleExpenses, currentUserId);
  const totalBalance = settlements.reduce((acc, settlement) => acc + settlement.amount, 0);

  return (
    <ScrollView>
      <YStack f={1} padding="$4" space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H2 size="$8" color="$blue10">
            Settlements
          </H2>
          <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
            <DollarSign size={24} color="$blue10" />
          </Card>
        </XStack>

        <Card elevate bordered padding="$4" size="$4" backgroundColor="$blue5">
          <XStack justifyContent="space-between">
            <YStack>
              <Text theme="alt2">Total Balance</Text>
              <Text
                fontSize="$8"
                fontWeight="bold"
                color={totalBalance >= 0 ? '$green10' : '$red10'}>
                ${Math.abs(totalBalance).toFixed(2)}
              </Text>
            </YStack>
            <YStack alignItems="flex-end">
              <Text theme="alt2">Status</Text>
              <Text
                fontSize="$5"
                fontWeight="bold"
                color={totalBalance >= 0 ? '$green10' : '$red10'}>
                {totalBalance >= 0 ? 'To Collect' : 'To Pay'}
              </Text>
            </YStack>
          </XStack>
        </Card>

        <YStack>
          {settlements.map((settlement) => (
            <SettlementCard key={settlement.userId} settlement={settlement} />
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
