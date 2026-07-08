import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AnalyzeScreen from './AnalyzeScreen';
import AppLogo from './AppLogo';
import { AuthProvider, useAuth } from './AuthContext';
import CompareScreen from './CompareScreen';
import LoginScreen from './LoginScreen';
import RiskyStocksScreen from './RiskyStocksScreen';
import { ThemeProvider, useTheme } from './ThemeContext';
import TickerTape from './TickerTape';
import TopPicksScreen from './TopPicksScreen';

type Tab = 'analiz' | 'karsilastir' | 'riskli' | 'oneriler';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'analiz', label: 'Analiz', icon: '📊' },
  { key: 'oneriler', label: 'Öneriler', icon: '🚀' },
  { key: 'karsilastir', label: 'Karşılaştır', icon: '⚖️' },
  { key: 'riskli', label: 'Riskli Hisseler', icon: '🔥' },
];

function Root() {
  const { mode, colors, toggleMode } = useTheme();
  const { isAuthenticated, isChecking, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('analiz');
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);
  const styles = makeStyles(colors);

  function goToAnalyze(ticker: string) {
    setPendingSymbol(ticker);
    setTab('analiz');
  }

  if (isChecking) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <LoginScreen colors={colors} />
      </>
    );
  }

  return (
    <View style={[styles.screen]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <TickerTape colors={colors} />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <AppLogo size={40} colors={colors} />
          <View>
            <Text style={styles.title}>OmerAnaliz</Text>
            <Text style={styles.subtitle}>BIST Teknik + Temel Analiz</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <Pressable onPress={logout} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🚪</Text>
          </Pressable>
          <Pressable onPress={toggleMode} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, { color: tab === t.key ? colors.primary : colors.textMuted }]}>
              {t.icon} {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'analiz' && (
        <AnalyzeScreen
          colors={colors}
          pendingSymbol={pendingSymbol}
          onConsumePendingSymbol={() => setPendingSymbol(null)}
        />
      )}
      {tab === 'oneriler' && <TopPicksScreen colors={colors} onSelectTicker={goToAnalyze} />}
      {tab === 'karsilastir' && <CompareScreen colors={colors} />}
      {tab === 'riskli' && <RiskyStocksScreen colors={colors} />}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { fontSize: 26, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 13, color: colors.textMuted },
    headerButtons: { flexDirection: 'row', gap: 10 },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.chipBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonText: { fontSize: 18 },
    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginTop: 16,
      gap: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexWrap: 'wrap',
    },
    tab: { paddingBottom: 10 },
    tabText: { fontSize: 14, fontWeight: '700' },
  });
}
