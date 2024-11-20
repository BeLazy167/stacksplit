import { ScrollView, YStack, useTheme } from 'tamagui';
import { ReactNode, memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StyleSheet } from 'react-native';

type PageWrapperProps = {
  children: ReactNode;
  withScrollView?: boolean;
};

export const PageWrapper = memo(function PageWrapper({
  children,
  withScrollView = true,
}: PageWrapperProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.background.val,
    paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 8,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const Content = (
    <YStack f={1} backgroundColor={theme.background.val} padding="$4" space="$4">
      {children}
    </YStack>
  );

  return (
    <YStack style={containerStyle}>
      {withScrollView ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentInsetAdjustmentBehavior="automatic">
          {Content}
        </ScrollView>
      ) : (
        Content
      )}
    </YStack>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
