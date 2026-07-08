import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ChartExplorer from './ChartExplorer';
import { API_BASE_URL } from './config';
import NewsSection from './NewsSection';
import OverallCommentary from './OverallCommentary';
import ResultCard from './ResultCard';
import type { ThemeColors } from './theme';
import type { AnalysisResult } from './types';
import { useNews } from './useNews';
import { useWatchlist } from './useWatchlist';

interface Props {
  colors: ThemeColors;
  pendingSymbol?: string | null;
  onConsumePendingSymbol?: () => void;
}

export default function AnalyzeScreen({ colors, pendingSymbol, onConsumePendingSymbol }: Props) {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { recent, favorites, addRecent, toggleFavorite, isFavorite } = useWatchlist();
  const news = useNews(result?.ticker ?? null);

  useEffect(() => {
    if (!pendingSymbol) return;
    setSymbol(pendingSymbol);
    runAnalysis(pendingSymbol);
    onConsumePendingSymbol?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSymbol]);

  async function runAnalysis(rawSymbol: string) {
    const trimmed = rawSymbol.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch(`${API_BASE_URL}/analyze/${encodeURIComponent(trimmed)}`);
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'Analiz alınamadı.');
      }
      setResult(data as AnalysisResult);
      addRecent(trimmed.toUpperCase());
    } catch (e: any) {
      setError(e.message || 'Sunucuya bağlanılamadı. Backend çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  }

  function handleChipPress(t: string) {
    setSymbol(t);
    runAnalysis(t);
  }

  const styles = makeStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Hisse kodu (örn. THYAO)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          value={symbol}
          onChangeText={setSymbol}
          onSubmitEditing={() => runAnalysis(symbol)}
          returnKeyType="search"
        />
        <Pressable style={styles.button} onPress={() => runAnalysis(symbol)} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '...' : 'Analiz Et'}</Text>
        </Pressable>
      </View>

      {favorites.length > 0 && (
        <View style={styles.chipSection}>
          <Text style={styles.chipLabel}>Favoriler</Text>
          <View style={styles.chipRow}>
            {favorites.map((t) => (
              <Pressable key={t} style={styles.chip} onPress={() => handleChipPress(t)}>
                <Text style={styles.chipText}>★ {t}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {recent.length > 0 && (
        <View style={styles.chipSection}>
          <Text style={styles.chipLabel}>Son aramalar</Text>
          <View style={styles.chipRow}>
            {recent.map((t) => (
              <Pressable key={t} style={styles.chip} onPress={() => handleChipPress(t)}>
                <Text style={styles.chipText}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 24 }} size="large" color={colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <>
          <ResultCard
            result={result}
            colors={colors}
            isFavorite={isFavorite(result.ticker.replace('.IS', ''))}
            onToggleFavorite={() => toggleFavorite(result.ticker.replace('.IS', ''))}
          />
          <OverallCommentary result={result} news={news.data} colors={colors} />
          <ChartExplorer ticker={result.ticker} colors={colors} />
          <NewsSection data={news.data} loading={news.loading} error={news.error} colors={colors} />
        </>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: 20, paddingBottom: 60 },
    searchRow: { flexDirection: 'row', gap: 8 },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
    buttonText: { color: colors.primaryText, fontWeight: '600' },
    error: { color: colors.bearish, marginTop: 16, textAlign: 'center' },
    chipSection: { marginTop: 14 },
    chipLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6, fontWeight: '600' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      backgroundColor: colors.chipBackground,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  });
}
