import { createFont } from 'tamagui';

export const adelleFont = createFont({
  family: 'AdelleCyrillic',
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 32,
    9: 48,
    10: 64,
  },
  lineHeight: {
    1: 17,
    2: 19,
    3: 20,
    4: 21,
    5: 24,
    6: 26,
    7: 31,
    8: 40,
    9: 57,
    10: 74,
  },
  weight: {
    1: '100', // Thin
    3: '300', // Light
    4: '400', // Regular
    6: '600', // SemiBold
    7: '700', // Bold
    8: '800', // ExtraBold
    9: '900', // Heavy
  },
  letterSpacing: {
    4: 0,
    5: -0.2,
    6: -0.45,
    7: -0.45,
    8: -0.45,
    9: -0.45,
  },
  face: {
    100: { normal: 'AdelleCyrillic-Thin', italic: 'AdelleCyrillic-ThinItalic' },
    300: { normal: 'AdelleCyrillic-Light', italic: 'AdelleCyrillic-LightItalic' },
    400: { normal: 'AdelleCyrillic', italic: 'AdelleCyrillic-Italic' },
    600: { normal: 'AdelleCyrillic-SemiBold', italic: 'AdelleCyrillic-SemiBoldItalic' },
    700: { normal: 'AdelleCyrillic-Bold', italic: 'AdelleCyrillic-BoldItalic' },
    800: { normal: 'AdelleCyrillic-Extrabold', italic: 'AdelleCyrillic-ExtraboldItalic' },
    900: { normal: 'AdelleCyrillic-Heavy', italic: 'AdelleCyrillic-HeavyItalic' },
  },
});
