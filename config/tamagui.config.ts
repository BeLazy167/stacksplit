import { createTamagui, createFont, createMedia } from 'tamagui';
import { createAnimations } from '@tamagui/animations-react-native';
import { shorthands } from '@tamagui/shorthands';
import { tokens as defaultTokens, themes as defaultThemes, tokens } from '@tamagui/themes';
import { adelleFont } from './fonts';

// Create smooth animations
const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 12,
    mass: 1.2,
    stiffness: 150,
  },
  lazy: {
    type: 'spring',
    damping: 15,
    stiffness: 40,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
});

// Responsive breakpoints with modern values
const media = createMedia({
  xs: { maxWidth: 550 },
  sm: { maxWidth: 768 },
  md: { maxWidth: 1024 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1536 },
  xxl: { maxWidth: 1920 },
  gtXs: { minWidth: 551 },
  gtSm: { minWidth: 769 },
  gtMd: { minWidth: 1025 },
  gtLg: { minWidth: 1281 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
});

// Modern color palette and design tokens
const customTokens = {
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    // Primary blues
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',

    // Secondary indigo
    secondary: '#4F46E5',
    secondaryLight: '#6366F1',
    secondaryDark: '#4338CA',

    // Success greens
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',

    // Warning oranges
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',

    // Danger reds
    danger: '#EF4444',
    dangerLight: '#F87171',
    dangerDark: '#DC2626',

    // Neutral grays
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
  space: {
    ...defaultTokens.space,
    cardPadding: defaultTokens.space.$4,
    listGap: defaultTokens.space.$3,
    sectionGap: defaultTokens.space.$6,
    pageMargin: defaultTokens.space.$4,
  },
  size: {
    ...defaultTokens.size,
    cardWidth: defaultTokens.size.$10,
    iconSmall: defaultTokens.size.$4,
    iconMedium: defaultTokens.size.$5,
    iconLarge: defaultTokens.size.$6,
    maxWidth: 1200,
  },
  radius: {
    ...defaultTokens.radius,
    card: defaultTokens.radius[4],
    button: defaultTokens.radius[3],
    input: defaultTokens.radius[3],
    avatar: defaultTokens.radius[10],
  },
  zIndex: {
    ...defaultTokens.zIndex,
    modal: 100,
    overlay: 90,
    drawer: 80,
    header: 70,
    tooltip: 60,
  },
};

// Create the configuration with modern themes
const config = createTamagui({
  animations,
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: adelleFont,
    body: adelleFont,
    mono: createFont({
      family: 'monospace',
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
      },
      lineHeight: {
        1: 16,
        2: 20,
        3: 24,
        4: 28,
        5: 32,
      },
      weight: {
        4: '400',
        5: '500',
        6: '600',
      },
      letterSpacing: {
        4: 0,
        5: -0.2,
        6: -0.4,
      },
    }),
  },
  tokens: customTokens,
  themes: {
    ...defaultThemes,
    light: {
      ...defaultThemes.light,
      background: customTokens.color.gray50,
      backgroundHover: customTokens.color.gray100,
      backgroundPress: customTokens.color.gray200,
      backgroundFocus: customTokens.color.gray100,
      borderColor: customTokens.color.gray200,
      borderColorHover: customTokens.color.gray300,
      borderColorPress: customTokens.color.gray400,
      color: customTokens.color.gray900,
      colorHover: customTokens.color.gray800,
      colorPress: customTokens.color.gray700,
    },
    dark: {
      ...defaultThemes.dark,
      background: customTokens.color.gray900,
      backgroundHover: customTokens.color.gray800,
      backgroundPress: customTokens.color.gray700,
      backgroundFocus: customTokens.color.gray800,
      borderColor: customTokens.color.gray700,
      borderColorHover: customTokens.color.gray600,
      borderColorPress: customTokens.color.gray500,
      color: customTokens.color.gray50,
      colorHover: customTokens.color.gray100,
      colorPress: customTokens.color.gray200,
    },
  },
  media,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
