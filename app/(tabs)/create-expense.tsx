import { H2, YStack, Input, Button, XStack, Form } from 'tamagui';
import { useState } from 'react';

export default function CreateExpense() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // TODO: Implement expense creation logic
    console.log({ amount, description });
  };

  return (
    <YStack f={1} backgroundColor="$background" padding="$4" space="$4">
      <H2>Create Expense</H2>
      
      <Form onSubmit={handleSubmit}>
        <YStack space="$3">
          <Input
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          
          <Input
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />

          <XStack justifyContent="flex-end">
            <Button onPress={handleSubmit}>
              Create Expense
            </Button>
          </XStack>
        </YStack>
      </Form>
    </YStack>
  );
}
