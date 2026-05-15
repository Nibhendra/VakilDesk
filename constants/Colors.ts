/**
 * VakilDesk Color System
 * Navy blue / Charcoal / White / Gold accent palette
 */

export const Colors = {
  light: {
    // Backgrounds
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    card: '#FFFFFF',

    // Text
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Brand
    primary: '#1E3A5F',
    primaryLight: '#2E5FA3',
    primaryDark: '#0F2040',

    // Accent
    accent: '#C9A84C',
    accentLight: '#F0D080',
    accentDark: '#A07828',

    // Status
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    info: '#2563EB',
    infoLight: '#DBEAFE',

    // Borders & Dividers
    border: '#E2E8F0',
    divider: '#F1F5F9',

    // Tabs
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#1E3A5F',
    tabBackground: '#FFFFFF',
  },
  dark: {
    // Backgrounds
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#162032',
    card: '#1E293B',

    // Text
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0F172A',

    // Brand
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#1D4ED8',

    // Accent
    accent: '#C9A84C',
    accentLight: '#F0D080',
    accentDark: '#A07828',

    // Status
    success: '#22C55E',
    successLight: '#14532D',
    warning: '#F59E0B',
    warningLight: '#451A03',
    error: '#EF4444',
    errorLight: '#450A0A',
    info: '#3B82F6',
    infoLight: '#1E3A8A',

    // Borders & Dividers
    border: '#334155',
    divider: '#1E293B',

    // Tabs
    tabIconDefault: '#64748B',
    tabIconSelected: '#60A5FA',
    tabBackground: '#1E293B',
  },
} as const;

export type ColorScheme = keyof typeof Colors;

// Use ReturnType pattern to avoid literal type conflicts
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  border: string;
  divider: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tabBackground: string;
};

