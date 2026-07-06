import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { API_BASE_URL } from './config';
import { signalColor, type ThemeColors } from './theme';
import type { AnalysisResult } from './types';

interface Props {
  colors: ThemeColors;
}

interface Row {
  symbol: string;
  result?: AnalysisResult;
  error?: string;
}

export default function CompareScreen({ colors }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const styles = makeStyles(colors);

  async function handleCompare() {
    const symbols = input
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (symbols.length === 0) return;

    setLoading(true);
    setRows(symbols.map((symbol) => ({ symbol })));

    const results = await Promise.all(
      symbols.map(async (symbol): Promise<Row> => {
        try {
          const resp = await fetch(`${API_BASE_URL}/analyze/${encodeURIComponent(symbol)}`);
          const data = await resp.json();
          if (!resp.ok) throw new Error(data.detail || 'Analiz alınamadı.');
          return { symbol, result: data as AnalysisResult };
        } catch (e: any) {
          return { symbol, error: e.message || 'Hata' };
        }
      })
    );

    function buyCount(r?: AnalysisResult): number {
      if (!r) return -1;
      return (r.kisa_vadeli.is_buy_signal ? 1 : 0) + (r.uzun_vadeli.is_buy_signal ? 1 : 0);
    }
    function avgConfidence(r?: AnalysisResult): number {
      if (!r) return -1;
      return (r.kisa_vadeli.confidence_pct + r.uzun_vadeli.confidence_pct) / 2;
    }

    results.sort((a, b) => {
      const diff = buyCount(b.result) - buyCount(a.result);
      if (diff !== 0) return diff;
      return avgConfidence(b.result) - avgConfidence(a.result);
    });

    setRows(results);
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.hint}>Virgülle ayırarak birden fazla hisse kodu gir (örn. THYAO, GARAN, ASELS)</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="THYAO, GARAN, ASELS"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleCompare}
          returnKeyType="search"
        />
        <Pressable style={styles.button} onPress={handleCompare} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '...' : 'Karşılaştır'}</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} size="large" color={colors.primary} />}

      {rows.map((row) => (
        <View key={row.symbol} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.symbol}>{row.symbol}</Text>
            {row.result && <Text style={styles.detail}>{row.result.price.toFixed(2)} TL</Text>}
          </View>
          {row.result ? (
            <>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: signalColor(colors, row.result.kisa_vadeli.signal) }]}>
                  <Text style={styles.badgeText}>
                    Kısa: {row.result.kisa_vadeli.signal} (%{row.result.kisa_vadeli.confidence_pct})
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: signalColor(colors, row.result.uzun_vadeli.signal) }]}>
                  <Text style={styles.badgeText}>
                    Uzun: {row.result.uzun_vadeli.signal} (%{row.result.uzun_vadeli.confidence_pct})
                  </Text>
                </View>
              </View>
              <Text style={styles.detail}>Bilanço: {row.result.fund_verdict}</Text>
            </>
          ) : row.error ? (
            <Text style={styles.errorText}>{row.error}</Text>
          ) : (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      ))}

      {rows.length > 0 && !loading && (
        <Text style={styles.disclaimer}>
          Bu bir yatırım tavsiyesi değildir. Güven oranı istatistiksel bir olasılık değildir, sadece
          kaç kriterin sinyali desteklediğinin oranıdır.
        </Text>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: 20, paddingBottom: 60 },
    hint: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
    searchRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
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
    row: {
      marginTop: 12,
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
    },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    symbol: { fontSize: 16, fontWeight: '700', color: colors.text },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 4 },
    badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { color: '#fff', fontWeight: '700', fontSize: 11 },
    detail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    errorText: { fontSize: 13, color: colors.bearish, marginTop: 2 },
    disclaimer: { fontSize: 11, color: colors.textMuted, marginTop: 16, lineHeight: 16 },
  });
}
