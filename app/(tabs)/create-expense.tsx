import {
  H2,
  YStack,
  Input,
  Button,
  XStack,
  Form,
  Card,
  Text,
  ScrollView,
  Select,
  Separator,
  Avatar,
} from 'tamagui';
import { DollarSign, FileText, Users, Percent, X } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Check } from '@tamagui/lucide-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/utils/query-client';
import { PageWrapper } from '~/components/Layout/PageWrapper';

type Person = {
  id: string;
  name: string;
};

export default function CreateExpense() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [participants, setParticipants] = useState<Person[]>([]);
  const [splitType, setSplitType] = useState('equal');

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: {
      amount: string;
      description: string;
      participants: Person[];
      splitType: string;
    }) => {
      // Replace this with your actual API call
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: expenseData });
        }, 1000);
      });
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });

      // Reset form
      setAmount('');
      setDescription('');
      setParticipants([]);
      setSplitType('equal');
    },
  });

  const handleAddPerson = () => {
    if (newPerson.trim()) {
      setParticipants((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newPerson.trim(),
        },
      ]);
      setNewPerson('');
    }
  };

  const handleRemovePerson = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = () => {
    createExpenseMutation.mutate({
      amount,
      description,
      participants,
      splitType,
    });
  };

  return (
    <PageWrapper>
      <H2 size="$8" color="$blue10">
        Create Expense
      </H2>

      <Card elevate bordered padding="$4" size="$4" space="$4">
        <Form onSubmit={handleSubmit}>
          <YStack space="$4">
            {/* Amount Input */}
            <YStack space="$2">
              <Text theme="alt2">Amount</Text>
              <XStack alignItems="center" space="$2">
                <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
                  <DollarSign size={20} color="$blue10" />
                </Card>
                <Input
                  flex={1}
                  size="$4"
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  borderWidth={2}
                  focusStyle={{
                    borderColor: '$blue8',
                  }}
                />
              </XStack>
            </YStack>

            {/* Description Input */}
            <YStack space="$2">
              <Text theme="alt2">Description</Text>
              <XStack alignItems="center" space="$2">
                <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
                  <FileText size={20} color="$blue10" />
                </Card>
                <Input
                  flex={1}
                  size="$4"
                  placeholder="What's this expense for?"
                  value={description}
                  onChangeText={setDescription}
                  borderWidth={2}
                  focusStyle={{
                    borderColor: '$blue8',
                  }}
                />
              </XStack>
            </YStack>

            <Separator />

            {/* Split Type Selection */}
            <YStack space="$2">
              <Text theme="alt2">Split Type</Text>
              <XStack alignItems="center" space="$2">
                <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
                  <Percent size={20} color="$blue10" />
                </Card>
                <Select value={splitType} onValueChange={setSplitType} size="$4">
                  <Select.Trigger flex={1} borderWidth={2} focusStyle={{ borderColor: '$blue8' }}>
                    <Select.Value placeholder="Select split type" />
                  </Select.Trigger>

                  <Select.Content>
                    <Select.ScrollUpButton />
                    <Select.Viewport>
                      <Select.Group>
                        {[
                          { value: 'equal', label: 'Split Equally' },
                          { value: 'percentage', label: 'Split by Percentage' },
                          { value: 'amount', label: 'Split by Amount' },
                        ].map((type, index) => (
                          <Select.Item key={type.value} value={type.value} index={index}>
                            <Select.ItemText>{type.label}</Select.ItemText>
                            <Select.ItemIndicator>
                              <Check size={16} />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Viewport>
                    <Select.ScrollDownButton />
                  </Select.Content>
                </Select>
              </XStack>
            </YStack>

            {/* Split With Input */}
            <YStack space="$2">
              <Text theme="alt2">Split With</Text>
              <XStack alignItems="center" space="$2">
                <Card size="$4" padding="$2" backgroundColor="$blue5" borderRadius="$4">
                  <Users size={20} color="$blue10" />
                </Card>
                <Input
                  flex={1}
                  size="$4"
                  placeholder="Add person's name"
                  value={newPerson}
                  onChangeText={setNewPerson}
                  borderWidth={2}
                  focusStyle={{
                    borderColor: '$blue8',
                  }}
                  onSubmitEditing={handleAddPerson}
                />
                <Button
                  size="$4"
                  theme="active"
                  onPress={handleAddPerson}
                  disabled={!newPerson.trim()}>
                  Add
                </Button>
              </XStack>

              {participants.length > 0 && (
                <Card bordered padding="$4" marginTop="$2">
                  <XStack flexWrap="wrap" gap="$2">
                    {participants.map((person) => (
                      <XStack
                        key={person.id}
                        backgroundColor="$blue5"
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        borderRadius="$4"
                        alignItems="center"
                        space="$2">
                        <Avatar circular size="$2">
                          <Avatar.Image
                            source={{ uri: `https://i.pravatar.cc/150?u=${person.name}` }}
                          />
                          <Avatar.Fallback backgroundColor="$blue3" />
                        </Avatar>
                        <Text>{person.name}</Text>
                        <Button
                          size="$2"
                          padding="$0"
                          backgroundColor="transparent"
                          onPress={() => handleRemovePerson(person.id)}>
                          <X size={16} color="$gray11" />
                        </Button>
                      </XStack>
                    ))}
                  </XStack>
                </Card>
              )}
            </YStack>

            <Button
              size="$4"
              theme="active"
              backgroundColor="$blue10"
              onPress={handleSubmit}
              pressStyle={{ opacity: 0.8 }}
              animation="quick"
              disabled={
                !amount ||
                !description ||
                participants.length === 0 ||
                createExpenseMutation.isPending
              }>
              {createExpenseMutation.isPending ? 'Creating...' : 'Create Expense'}
            </Button>

            {createExpenseMutation.isError && (
              <Text color="$red10" textAlign="center">
                Error creating expense. Please try again.
              </Text>
            )}
          </YStack>
        </Form>
      </Card>
    </PageWrapper>
  );
}
