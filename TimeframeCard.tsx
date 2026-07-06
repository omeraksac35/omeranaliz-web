import { useWindowDimensions, StyleSheet, Text, View } from 'react-native';

import PriceChart from './PriceChart';
import { signalColor, type ThemeColors } from './theme';
import type { TimeframeResult } from './types';

function fmt(n: number | null, digits = 2): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

interface Props {
  data: TimeframeResult;
  colors: ThemeColors;
}

export default function TimeframeCard({ data, colors }: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 96, 460);
  const styles = makeStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{data.label}</Text>

      <View style={[styles.signalBadge, { backgroundColor: signalColor(colors, data.signal) }]}>
        <Text style={styles.signalText}>{data.signal}</Text>
      </View>

      <Text style={styles.confidenceLabel}>Güven oranı: %{data.confidence_pct}</Text>
      <View style={styles.confidenceBarBg}>
        <View
          style={[
            styles.confidenceBarFill,
            { width: `${data.confidence_pct}%`, backgroundColor: signalColor(colors, data.signal) },
          ]}
        />
      </View>

      <Text style={styles.reason}>{data.reason}</Text>

      {data.history.length > 1 && (
        <PriceChart
          history={data.history}
          support={data.support}
          resistance={data.resistance}
          colors={colors}
          width={chartWidth}
        />
      )}

      {data.criteria.map((c, i) => (
        <Text key={i} style={styles.criterionRow}>
          {c.positive ? '✅' : '❌'} {c.label}
        </Text>
      ))}

      {data.is_buy_signal ? (
        <View style={styles.levelsBox}>
          <Text style={styles.levelRow}>Giriş noktası: {fmt(data.entry_point)} TL</Text>
          <Text style={styles.levelRow}>Stop-loss: {fmt(data.stop_loss)} TL</Text>
          <Text style={styles.levelRow}>Take-profit: {fmt(data.take_profit)} TL</Text>
        </View>
      ) : (
        <Text style={styles.noLevels}>
          Bu vadede AL sinyali yok — giriş/stop-loss/take-profit gösterilmiyor.
        </Text>
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
    signalBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
    signalText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    confidenceLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
    confidenceBarBg: { height: 6, backgroundColor: colors.chipBackground, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
    confidenceBarFill: { height: 6 },
    reason: { fontSize: 12, color: colors.textMuted, marginBottom: 8, fontStyle: 'italic' },
    criterionRow: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
    levelsBox: { marginTop: 8 },
    levelRow: { fontSize: 13, color: colors.text, marginBottom: 2 },
    noLevels: { fontSize: 12, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  });
}
