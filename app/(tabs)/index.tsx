import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, YStack, Button, H1, XStack, Card, Paragraph, ScrollView, H2 } from 'tamagui';
import OverviewCarousel from '~/components/Home/OverviewCarousel';
import { sampleExpenses, ExpenseCard } from '~/components/Expenses/ExpenseCard';

export default function HomePage() {
  return (
    <YStack f={1} backgroundColor="$background">
      <SignedIn>
        <ScrollView>
          <YStack f={1} padding="$4" space="$4">
            <H2 size="$8" color="$blue10">
              Overview
            </H2>

            <OverviewCarousel />

            <XStack justifyContent="space-between" alignItems="center" marginTop="$4">
              <H2 size="$8" color="$blue10">
                Recent Expenses
              </H2>
              <Link href="/settlements" asChild>
                <Button size="$3" variant="outlined" theme="blue">
                  See All
                </Button>
              </Link>
            </XStack>

            <YStack space="$4">
              {sampleExpenses.slice(0, 3).map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </YStack>
          </YStack>
        </ScrollView>
      </SignedIn>

      <SignedOut>
        <Card elevate bordered padding="$4" size="$4" space="$4" alignItems="center">
          <H1 size="$9" color="$blue10">
            Welcome to StackSplit
          </H1>
          <Paragraph size="$5" theme="alt2">
            Please sign in or sign up to continue
          </Paragraph>
          <XStack space="$4">
            <Link href="/(auth)/sign-in" asChild>
              <Button
                size="$4"
                theme="active"
                backgroundColor="$blue10"
                pressStyle={{ opacity: 0.8 }}
                animation="quick">
                Sign In
              </Button>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <Button
                size="$4"
                theme="active"
                backgroundColor="$blue10"
                pressStyle={{ opacity: 0.8 }}
                animation="quick">
                Sign Up
              </Button>
            </Link>
          </XStack>
        </Card>
      </SignedOut>
    </YStack>
  );
}
