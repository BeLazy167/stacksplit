import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '~/utils/firebase';
import { useFirebaseUser } from '~/utils/useFirebaseUser';
import { ExpenseCard } from './ExpenseCard';
import { YStack, Text } from 'tamagui';
import { Expense } from './Expenses';

export function ExpenseList() {
  const { firebaseUser } = useFirebaseUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!firebaseUser) return;

      try {
        const q = query(collection(db, 'expenses'), where('userId', '==', firebaseUser.uid));

        const querySnapshot = await getDocs(q);
        const expenseData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExpenses(expenseData as Expense[]);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [firebaseUser]);

  if (loading) {
    return <Text>Loading expenses...</Text>;
  }

  return (
    <YStack space="$4">
      {expenses.map((expense: Expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </YStack>
  );
}
