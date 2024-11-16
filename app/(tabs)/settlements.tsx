import { H2, YStack, Card } from 'tamagui';
import { PageWrapper } from '~/components/Layout/PageWrapper';

export default function SettlementsScreen() {
  return (
    <PageWrapper>
      <H2 size="$8" color="$blue10">
        Settlements
      </H2>
      
      <Card elevate bordered padding="$4" size="$4">
        {/* ... content ... */}
      </Card>
    </PageWrapper>
  );
}
