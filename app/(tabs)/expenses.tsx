import { Text, YStack, Card, H2, ScrollView, XStack, Avatar, Separator } from 'tamagui';
import { DollarSign, Coffee, ShoppingCart, Car, Home } from '@tamagui/lucide-icons';

const sampleExpenses = [
  {
    id: 1,
    title: 'Coffee Run',
    amount: 24.5,
    date: '2024-03-15',
    category: 'Food',
    participants: ['John', 'Sarah', 'Mike'],
    icon: Coffee,
  },
  {
    id: 2,
    title: 'Grocery Shopping',
    amount: 156.8,
    date: '2024-03-14',
    category: 'Shopping',
    participants: ['John', 'Sarah'],
    icon: ShoppingCart,
  },
  {
    id: 3,
    title: 'Uber Ride',
    amount: 32.4,
    date: '2024-03-14',
    category: 'Transport',
    participants: ['John', 'Mike'],
    icon: Car,
  },
  {
    id: 4,
    title: 'Rent Payment',
    amount: 1200.0,
    date: '2024-03-01',
    category: 'Housing',
    participants: ['John', 'Sarah', 'Mike', 'Lisa'],
    icon: Home,
  },
];

function ExpenseCard({ expense }: { expense: (typeof sampleExpenses)[0] }) {
  const Icon = expense.icon;

  return (
    <Card elevate bordered padding="$4" size="$4" animation="lazy">
      <XStack space="$4" alignItems="center">
        <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
          <Icon size={24} color="$blue10" />
        </Card>

        <YStack flex={1} space="$1">
          <Text fontSize="$6" fontWeight="bold">
            {expense.title}
          </Text>
          <Text theme="alt2" fontSize="$3">
            {expense.date} • {expense.category}
          </Text>
        </YStack>

        <YStack alignItems="flex-end">
          <Text fontSize="$6" fontWeight="bold" color="$blue10">
            ${expense.amount.toFixed(2)}
          </Text>
          <Text theme="alt2" fontSize="$3">
            {expense.participants.length} people
          </Text>
        </YStack>
      </XStack>

      <Separator marginVertical="$3" />

      <XStack space="$2" flexWrap="wrap">
        {expense.participants.map((participant, index) => (
          <Avatar key={index} circular size="$2">
            <Avatar.Image source={{ uri: `https://i.pravatar.cc/150?u=${participant}` }} />
            <Avatar.Fallback backgroundColor="$blue5" />
          </Avatar>
        ))}
      </XStack>
    </Card>
  );
}

export default function ExpensesScreen() {
  return (
    <ScrollView>
      <YStack f={1} padding="$4" space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H2 size="$8" color="$blue10">
            Expenses
          </H2>
          <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
            <DollarSign size={24} color="$blue10" />
          </Card>
        </XStack>

        <Card elevate bordered padding="$4" size="$4" backgroundColor="$blue5">
          <XStack justifyContent="space-between">
            <YStack>
              <Text theme="alt2">Total Spent</Text>
              <Text fontSize="$8" fontWeight="bold" color="$blue10">
                ${sampleExpenses.reduce((acc, exp) => acc + exp.amount, 0).toFixed(2)}
              </Text>
            </YStack>
            <YStack alignItems="flex-end">
              <Text theme="alt2">This Month</Text>
              <Text fontSize="$5" fontWeight="bold">
                {sampleExpenses.length} expenses
              </Text>
            </YStack>
          </XStack>
        </Card>

        <YStack space="$4">
          {sampleExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
