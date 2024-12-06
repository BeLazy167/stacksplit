import { memo, useCallback } from 'react';
import { Card, Text, XStack, YStack } from 'tamagui';
import { DollarSign, TrendingUp, Users } from '@tamagui/lucide-icons';
import Carousel from 'react-native-reanimated-carousel';
import { useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const overviewData = [
  {
    title: 'Total Spent',
    value: '$1,413.70',
    change: '+2.4%',
    isPositive: true,
    icon: DollarSign,
    color: '$blue10',
    bgColor: '$blue5',
  },
  {
    title: 'Monthly Avg',
    value: '$353.43',
    change: '-1.2%',
    isPositive: false,
    icon: TrendingUp,
    color: '$green10',
    bgColor: '$green5',
  },
  {
    title: 'Active Groups',
    value: '3',
    change: '+5.0%',
    isPositive: true,
    icon: Users,
    color: '$purple10',
    bgColor: '$purple5',
  },
  // Duplicate items for continuous scroll
  {
    title: 'Total Spent',
    value: '$1,413.70',
    change: '+2.4%',
    isPositive: true,
    icon: DollarSign,
    color: '$blue10',
    bgColor: '$blue5',
  },
  {
    title: 'Monthly Avg',
    value: '$353.43',
    change: '-1.2%',
    isPositive: false,
    icon: TrendingUp,
    color: '$green10',
    bgColor: '$green5',
  },
];

const OverviewCard = memo(function OverviewCard({
  item,
  index,
}: {
  item: (typeof overviewData)[0];
  index: number;
}) {
  const Icon = item.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(0.95) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Card elevate bordered padding="$3" marginHorizontal="$2" backgroundColor={item.bgColor}>
        <XStack space="$4" alignItems="center">
          <Card size="$3" padding="$2" backgroundColor={item.color} borderRadius="$4" opacity={0.9}>
            <Icon size={20} color="white" />
          </Card>

          <YStack>
            <Text theme="alt2" fontSize="$3" fontFamily="$body">
              {item.title}
            </Text>
            <XStack space="$2" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color={item.color}>
                {item.value}
              </Text>
              <Text fontSize="$3" color={item.isPositive ? '$green10' : '$red10'} fontWeight="bold">
                {item.change}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </Card>
    </Animated.View>
  );
});

export default memo(function OverviewCarousel() {
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.8;

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof overviewData)[0]; index: number }) => (
      <OverviewCard item={item} index={index} />
    ),
    []
  );

  return (
    <YStack flex={1}>
      <Carousel
        loop
        width={cardWidth}
        height={100}
        data={overviewData}
        scrollAnimationDuration={1000}
        autoPlay={true}
        autoPlayInterval={3000}
        renderItem={renderItem}
        defaultIndex={0}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        style={{
          width: width,
          height: 100,
        }}
      />
    </YStack>
  );
});
