import { StyleSheet, Text, View } from 'react-native';

import { signalColor, type ThemeColors } from './theme';
import type { OverallRecommendation as OverallRecommendationType } from './types';

function fmt(n: number, digits = 2): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

interface Props {
  data: OverallRecommendationType;
  colors: ThemeColors;
}

export default function OverallRecommendation({ data, colors }: Props) {
  const styles = makeStyles(colors);
  const badgeColor = signalColor(colors, data.signal);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Genel Tavsiye (Saatlik + Günlük)</Text>
        {data.is_speculative && (
          <View style={styles.speculativeBadge}>
            <Text style={styles.speculativeText}>SPEKÜLATİF</Text>
          </View>
        )}
      </View>

      <View style={[styles.signalBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.signalText}>{data.signal}</Text>
      </View>

      <Text style={styles.reason}>{data.reason}</Text>

      <Text style={styles.volatilityRow}>
        Yıllıklandırılmış oynaklık: %{fmt(data.volatility_pct, 1)}
        {data.is_speculative ? ' — yüksek oynaklık, büyük kazanç/kayıp potansiyeli var.' : ''}
      </Text>

      {data.entry_plan && data.entry_plan.action === 'AL' && (
        <View style={styles.entryPlanBox}>
          <Text style={styles.entryPlanTitle}>Alım/Satış Seviyeleri</Text>
          <Text style={styles.entryPlanRow}>Giriş (alım) seviyesi: {fmt(data.entry_plan.buy_level)} TL</Text>
          <Text style={styles.entryPlanRow}>Zarar-kes (stop-loss): {fmt(data.entry_plan.stop_loss)} TL</Text>
          <Text style={styles.entryPlanRow}>Kâr-al (take-profit): {fmt(data.entry_plan.take_profit)} TL</Text>
          <Text style={styles.entryPlanNote}>{data.entry_plan.note}</Text>
        </View>
      )}

      {data.entry_plan && data.entry_plan.action === 'SAT' && (
        <View style={styles.entryPlanBox}>
          <Text style={styles.entryPlanTitle}>Alım/Satış Seviyeleri</Text>
          <Text style={styles.entryPlanRow}>Satış/çıkış seviyesi: {fmt(data.entry_plan.sell_level)} TL</Text>
          {data.entry_plan.watch_level !== null && (
            <Text style={styles.entryPlanRow}>
              Yeniden değerlendirme (destek) seviyesi: {fmt(data.entry_plan.watch_level)} TL
            </Text>
          )}
          <Text style={styles.entryPlanNote}>{data.entry_plan.note}</Text>
        </View>
      )}

      {data.target && data.probability ? (
        <View style={styles.targetBox}>
          <Text style={styles.targetTitle}>
            Şimdi {data.is_buy_signal ? 'alırsan' : 'satarsan/kaçınırsan'} en yakın {data.target.type}: {fmt(data.target.level)} TL (
            {data.target.target_pct > 0 ? '+' : ''}
            {fmt(data.target.target_pct, 1)}%)
          </Text>
          <Text style={styles.probabilityText}>
            Bu seviyeye ulaşma olasılığı: %{fmt(data.probability.probability_pct, 1)}
          </Text>
          <Text style={styles.probabilityNote}>
            (Son 1 yılda her {data.probability.window_trading_days} işlem gününde benzer büyüklükte bir hareketin
            geçmişte görülme sıklığı — {data.probability.sample_size} örnek üzerinden. Bu bir tahmin ya da garanti
            DEĞİLDİR.)
          </Text>
        </View>
      ) : (
        <Text style={styles.noTarget}>
          Net bir yön olmadığı için hedef seviye ve olasılık gösterilmiyor.
        </Text>
      )}

      <Text style={styles.disclaimer}>{data.note}</Text>
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 15, fontWeight: '700', color: colors.text, flexShrink: 1 },
    speculativeBadge: {
      backgroundColor: colors.caution,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: 8,
    },
    speculativeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    signalBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 },
    signalText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    reason: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
    volatilityRow: { fontSize: 12, color: colors.textMuted, marginBottom: 10 },
    entryPlanBox: {
      backgroundColor: colors.chipBackground,
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    entryPlanTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 },
    entryPlanRow: { fontSize: 14, color: colors.text, marginBottom: 2 },
    entryPlanNote: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
    targetBox: {
      backgroundColor: colors.chipBackground,
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    targetTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 },
    probabilityText: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
    probabilityNote: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },
    noTarget: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginBottom: 8 },
    disclaimer: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },
  });
}
