import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { PortalProvider } from 'tamagui';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config/v3';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { adelleFont } from '../config/fonts';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/utils/query-client';
import { DarkModeProvider, useDarkMode } from '~/utils/DarkModeContext';
import { YStack } from 'tamagui';

const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    heading: adelleFont,
    body: adelleFont,
  },
  themes: {
    ...config.themes,
  },
});

type Conf = typeof tamaguiConfig;
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'AdelleCyrillic-Thin': require('../assets/fonts/AdelleCyrillic-Thin.ttf'),
    'AdelleCyrillic-ThinItalic': require('../assets/fonts/AdelleCyrillic-ThinItalic.ttf'),
    'AdelleCyrillic-Light': require('../assets/fonts/AdelleCyrillic-Light.ttf'),
    'AdelleCyrillic-LightItalic': require('../assets/fonts/AdelleCyrillic-LightItalic.ttf'),
    AdelleCyrillic: require('../assets/fonts/AdelleCyrillic.ttf'),
    'AdelleCyrillic-Italic': require('../assets/fonts/AdelleCyrillic-Italic.ttf'),
    'AdelleCyrillic-SemiBold': require('../assets/fonts/AdelleCyrillic-SemiBold.ttf'),
    'AdelleCyrillic-SemiBoldItalic': require('../assets/fonts/AdelleCyrillic-SemiBoldItalic.ttf'),
    'AdelleCyrillic-Bold': require('../assets/fonts/AdelleCyrillic-Bold.ttf'),
    'AdelleCyrillic-BoldItalic': require('../assets/fonts/AdelleCyrillic-BoldItalic.ttf'),
    'AdelleCyrillic-Extrabold': require('../assets/fonts/AdelleCyrillic-Extrabold.ttf'),
    'AdelleCyrillic-ExtraboldItalic': require('../assets/fonts/AdelleCyrillic-ExtraboldItalic.ttf'),
    'AdelleCyrillic-Heavy': require('../assets/fonts/AdelleCyrillic-Heavy.ttf'),
    'AdelleCyrillic-HeavyItalic': require('../assets/fonts/AdelleCyrillic-HeavyItalic.ttf'),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <DarkModeProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ClerkLoaded>
              <TamaguiProviderWithDarkMode config={tamaguiConfig}>
                <PortalProvider>
                  <Slot />
                </PortalProvider>
              </TamaguiProviderWithDarkMode>
            </ClerkLoaded>
          </ClerkProvider>
        </QueryClientProvider>
      </DarkModeProvider>
    </SafeAreaProvider>
  );
}

function TamaguiProviderWithDarkMode({
  children,
  config,
}: {
  children: React.ReactNode;
  config: typeof tamaguiConfig;
}) {
  const { isDarkMode } = useDarkMode();

  return (
    <TamaguiProvider config={config} defaultTheme={isDarkMode ? 'dark' : 'light'}>
      <YStack f={1} backgroundColor="$background">
        {children}
      </YStack>
    </TamaguiProvider>
  );
}
