import { Pressable, StyleSheet, Text, View } from 'react-native';

import TimeframeCard from './TimeframeCard';
import type { ThemeColors } from './theme';
import type { AnalysisResult } from './types';

function fmt(n: number | null, digits = 2): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function pct(n: number | null): string {
  if (n === null || n === undefined) return '-';
  return `%${(n * 100).toFixed(1)}`;
}

interface Props {
  result: AnalysisResult;
  colors: ThemeColors;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ResultCard({ result, colors, isFavorite, onToggleFavorite }: Props) {
  const styles = makeStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.ticker}>{result.ticker}</Text>
          <Text style={styles.price}>{fmt(result.price)} TL</Text>
        </View>
        <Pressable onPress={onToggleFavorite} hitSlop={12}>
          <Text style={styles.star}>{isFavorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      <View style={styles.consistencyBox}>
        <Text style={styles.consistencyText}>{result.consistency_note}</Text>
      </View>

      <TimeframeCard data={result.kisa_vadeli} colors={colors} />
      <TimeframeCard data={result.uzun_vadeli} colors={colors} />

      <Text style={styles.sectionTitle}>Bilanço ({result.fundamentals.long_name ?? result.ticker})</Text>
      <Text style={styles.levelRow}>Sektör: {result.fundamentals.sector ?? 'bilinmiyor'}</Text>
      <Text style={styles.levelRow}>F/K: {fmt(result.fundamentals.pe_ratio, 1)}</Text>
      <Text style={styles.levelRow}>PD/DD: {fmt(result.fundamentals.pb_ratio, 2)}</Text>
      <Text style={styles.levelRow}>ROE: {pct(result.fundamentals.roe)}</Text>
      <Text style={styles.levelRow}>Kâr marjı: {pct(result.fundamentals.profit_margin)}</Text>
      <Text style={styles.levelRow}>Gelir büyümesi: {pct(result.fundamentals.revenue_growth)}</Text>
      <Text style={styles.levelRow}>Bilanço değerlendirmesi: {result.fund_verdict}</Text>
      {result.fund_notes.map((n, i) => (
        <Text key={i} style={styles.criterionRow}>
          {n}
        </Text>
      ))}

      <Text style={styles.disclaimer}>{result.disclaimer}</Text>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      marginTop: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    ticker: { fontSize: 20, fontWeight: '700', color: colors.text },
    price: { fontSize: 28, fontWeight: '800', marginBottom: 8, color: colors.text },
    star: { fontSize: 26, color: colors.caution },
    consistencyBox: {
      backgroundColor: colors.chipBackground,
      borderRadius: 8,
      padding: 10,
      marginBottom: 4,
    },
    consistencyText: { fontSize: 13, color: colors.text, fontWeight: '600' },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 4, color: colors.text },
    criterionRow: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
    levelRow: { fontSize: 14, color: colors.text, marginBottom: 2 },
    disclaimer: { fontSize: 11, color: colors.textMuted, marginTop: 16, lineHeight: 16 },
  });
}
