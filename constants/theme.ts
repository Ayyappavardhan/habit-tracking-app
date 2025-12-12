/**
 * Habit Tracking App Theme
 * Dark theme: Black background with Yellow accent
 * Light theme: White background with Blue accent
 */

import { Platform } from 'react-native';

export type ThemeMode = 'dark' | 'light';

// Dark theme colors (Black + Yellow)
const DarkColors = {
  // Primary colors
  background: '#0D0D0D',
  backgroundSecondary: '#1A1A1A',
  card: '#1C1C1E',
  cardBorder: '#2C2C2E',

  // Accent
  accent: '#FFD700',
  accentDark: '#C9A900',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',

  // Status
  success: '#34C759',
  error: '#FF3B30',

  // Grid
  gridComplete: '#FFD700',
  gridIncomplete: '#2C2C2E',

  // Tab bar
  tabBar: '#1A1A1A',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#FFD700',
};

// Light theme colors (White + Blue)
const LightColors = {
  // Primary colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  card: '#FFFFFF',
  cardBorder: '#E5E5EA',

  // Accent
  accent: '#007AFF',
  accentDark: '#0056B3',

  // Text
  text: '#000000',
  textSecondary: '#6C6C70',
  textMuted: '#8E8E93',

  // Status
  success: '#34C759',
  error: '#FF3B30',

  // Grid
  gridComplete: '#007AFF',
  gridIncomplete: '#E5E5EA',

  // Tab bar
  tabBar: '#FFFFFF',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#007AFF',
};

// Get colors based on theme mode
export function getColors(theme: ThemeMode = 'dark') {
  return theme === 'light' ? LightColors : DarkColors;
}

// Default export for backward compatibility (dark theme)
export const Colors = {
  ...DarkColors,
  // Legacy support
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#007AFF',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#007AFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D0D0D',
    tint: '#FFD700',
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#FFD700',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

