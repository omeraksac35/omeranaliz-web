export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBackground: string;
  primary: string;
  primaryText: string;
  bullish: string;
  bearish: string;
  caution: string;
  neutral: string;
  chipBackground: string;
}

const light: ThemeColors = {
  background: '#f5f6f8',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  border: '#d1d5db',
  inputBackground: '#ffffff',
  primary: '#2563eb',
  primaryText: '#ffffff',
  bullish: '#1b8a3a',
  bearish: '#c0392b',
  caution: '#b8860b',
  neutral: '#6b7280',
  chipBackground: '#e5e7eb',
};

const dark: ThemeColors = {
  background: '#0f1115',
  card: '#1a1d24',
  text: '#f3f4f6',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  border: '#2d323c',
  inputBackground: '#1f232b',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  bullish: '#34d058',
  bearish: '#f0605a',
  caution: '#e0b03d',
  neutral: '#9ca3af',
  chipBackground: '#262b34',
};

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? dark : light;
}

export function signalColor(colors: ThemeColors, signal: string): string {
  if (signal === 'AL' || signal === 'GÜÇLÜ AL') return colors.bullish;
  if (signal === 'DİKKATLİ AL') return colors.caution;
  if (signal === 'SAT') return colors.bearish;
  return colors.neutral;
}
