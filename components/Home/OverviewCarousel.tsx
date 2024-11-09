import { Card, Text, XStack, YStack } from 'tamagui';
import { DollarSign, TrendingUp, Users } from '@tamagui/lucide-icons';
import Carousel from 'react-native-reanimated-carousel';
import { useWindowDimensions } from 'react-native';

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

export default function StockTickerCarousel() {
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.8; // Each card takes 80% of screen width

  return (
    <YStack flex={1}>
      <Carousel
        loop
        width={cardWidth}
        height={100}
        data={overviewData}
        scrollAnimationDuration={3000}
        autoPlay={true}
        autoPlayInterval={0}
        defaultIndex={0}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        style={{
          width: width,
          height: 100,
        }}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <Card
              elevate
              bordered
              padding="$3"
              marginHorizontal="$2"
              backgroundColor={item.bgColor}
              animation="lazy"
              scale={0.95}
              hoverStyle={{ scale: 1 }}>
              <XStack space="$4" alignItems="center">
                <Card
                  size="$3"
                  padding="$2"
                  backgroundColor={item.color}
                  borderRadius="$4"
                  opacity={0.9}>
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
                    <Text
                      fontSize="$3"
                      color={item.isPositive ? '$green10' : '$red10'}
                      fontWeight="bold">
                      {item.change}
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
            </Card>
          );
        }}
      />
    </YStack>
  );
}
