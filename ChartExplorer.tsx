import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import CandlestickChart from './CandlestickChart';
import { API_BASE_URL } from './config';
import type { ThemeColors } from './theme';
import type { ChartResult, ChartTimeframeKey } from './types';

interface Props {
  ticker: string;
  colors: ThemeColors;
}

const TIMEFRAME_OPTIONS: { key: ChartTimeframeKey; label: string }[] = [
  { key: 'saatlik', label: 'Saatlik' },
  { key: 'gunluk', label: 'Günlük' },
  { key: 'haftalik', label: 'Haftalık' },
  { key: 'yillik', label: 'Yıllık' },
];

export default function ChartExplorer({ ticker, colors }: Props) {
  const [timeframe, setTimeframe] = useState<ChartTimeframeKey>('gunluk');
  const [data, setData] = useState<ChartResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 64, 480);
  const styles = makeStyles(colors);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/chart/${encodeURIComponent(ticker)}?timeframe=${timeframe}`)
      .then(async (resp) => {
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Grafik alınamadı.');
        if (!cancelled) setData(json as ChartResult);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Grafik alınamadı.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticker, timeframe]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grafik Gezgini</Text>
      <View style={styles.tabRow}>
        {TIMEFRAME_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[styles.tab, timeframe === opt.key && { backgroundColor: colors.primary }]}
            onPress={() => setTimeframe(opt.key)}
          >
            <Text style={[styles.tabText, { color: timeframe === opt.key ? colors.primaryText : colors.textMuted }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {data && !loading && (
        <CandlestickChart
          candles={data.candles}
          resistanceLevels={data.resistance_levels}
          supportLevels={data.support_levels}
          colors={colors}
          width={chartWidth}
        />
      )}

      {data && !loading && <Text style={styles.note}>{data.note}</Text>}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginTop: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
    },
    title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
    tabRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
    tab: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.chipBackground,
    },
    tabText: { fontSize: 13, fontWeight: '600' },
    error: { color: colors.bearish, marginTop: 8 },
    note: { fontSize: 11, color: colors.textMuted, marginTop: 10, lineHeight: 15 },
  });
}
