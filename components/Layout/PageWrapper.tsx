import { ScrollView, YStack, useTheme } from 'tamagui';
import { ReactNode } from 'react';

type PageWrapperProps = {
  children: ReactNode;
  withScrollView?: boolean;
};

export function PageWrapper({ children, withScrollView = true }: PageWrapperProps) {
  const theme = useTheme();
  
  const Content = (
    <YStack 
      f={1} 
      backgroundColor={theme.background.val}
      padding="$4" 
      space="$4"
    >
      {children}
    </YStack>
  );

  if (withScrollView) {
    return (
      <ScrollView 
        style={{ 
          flex: 1, 
          backgroundColor: theme.background.val 
        }}
      >
        {Content}
      </ScrollView>
    );
  }

  return Content;
} 