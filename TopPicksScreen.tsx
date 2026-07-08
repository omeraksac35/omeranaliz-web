import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from './config';
import { signalColor, type ThemeColors } from './theme';
import type { TopPick, TopPicksResult } from './types';

const AUTO_REFRESH_MS = 60 * 60 * 1000;

interface Props {
  colors: ThemeColors;
  onSelectTicker: (ticker: string) => void;
}

function fmt(n: number, digits = 2): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatUpdatedAt(unixSeconds: number): string {
  if (!unixSeconds) return '-';
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

function PickCard({ pick, colors, rank, onPress }: { pick: TopPick; colors: ThemeColors; rank: number; onPress: () => void }) {
  const styles = makeCardStyles(colors);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.rank}>#{rank}</Text>
        <Text style={styles.ticker}>{pick.ticker.replace('.IS', '')}</Text>
        <Text style={styles.price}>{fmt(pick.price)} TL</Text>
        <View style={[styles.signalBadge, { backgroundColor: signalColor(colors, pick.potential_label) }]}>
          <Text style={styles.signalText}>{pick.potential_label}</Text>
        </View>
      </View>

      {pick.probability_pct !== null && pick.target_level !== null ? (
        <View style={styles.metricsRow}>
          <Text style={styles.probabilityValue}>%{fmt(pick.probability_pct, 1)}</Text>
          <Text style={styles.metricLabel}>olasılıkla</Text>
          <Text style={styles.targetValue}>{fmt(pick.target_level)} TL</Text>
          <Text style={styles.metricLabel}>
            (+{fmt(pick.target_pct ?? 0, 1)}%) görebilir
          </Text>
        </View>
      ) : (
        <Text style={styles.metricLabel}>Belirgin bir hedef seviye tespit edilemedi.</Text>
      )}

      {pick.downside_probability_pct !== null && pick.support_level !== null && (
        <View style={styles.metricsRow}>
          <Text style={styles.downsideValue}>%{fmt(pick.downside_probability_pct, 1)}</Text>
          <Text style={styles.metricLabel}>olasılıkla</Text>
          <Text style={styles.targetValue}>{fmt(pick.support_level)} TL</Text>
          <Text style={styles.metricLabel}>
            (-{fmt(Math.abs(pick.support_distance_pct ?? 0), 1)}%) düşebilir
          </Text>
        </View>
      )}

      <Text style={styles.detailRow}>
        {pick.has_resistance_overhead
          ? `Önünde direnç var (${fmt(pick.target_level ?? 0)} TL civarı)`
          : 'Önünde belirgin bir direnç yok (1 yıllık zirve referans alındı)'}
        {pick.support_distance_pct !== null && ` · Desteğine %${fmt(pick.support_distance_pct, 1)} uzaklıkta`}
      </Text>

      {pick.critical_news_categories.length > 0 && (
        <View style={styles.newsRow}>
          {pick.critical_news_categories.map((c) => (
            <View key={c} style={styles.newsBadge}>
              <Text style={styles.newsBadgeText}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.volatility}>Yıllıklandırılmış oynaklık: %{fmt(pick.volatility_pct, 1)}</Text>
    </Pressable>
  );
}

export default function TopPicksScreen({ colors, onSelectTicker }: Props) {
  const [data, setData] = useState<TopPicksResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback((forceRefresh: boolean) => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/top-picks?top_n=20${forceRefresh ? '&force_refresh=true' : ''}`)
      .then(async (resp) => {
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Hisse sıralaması alınamadı.');
        setData(json as TopPicksResult);
      })
      .catch((e) => setError(e.message || 'Sunucuya bağlanılamadı.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(false);
    intervalRef.current = setInterval(() => load(false), AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  const styles = makeStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>🚀 Yükselme Potansiyeli Sıralaması</Text>
        <Text style={styles.headerText}>
          Taranan tüm hisseler (BIST100/BIST30'a yakın kapsam, 100+ hisse) hem yükselme hem
          düşme olasılığına göre değerlendirilir. Düşme olasılığı yükselme olasılığından
          yüksekse AL önerilmez; yükselme olasılığı %50'nin üzerindeyse GÜÇLÜ AL. Liste önce
          bu güce, sonra hedefe ne kadar gidebileceğine göre sıralanır ve saatte bir otomatik
          güncellenir. Bu bir yatırım tavsiyesi değildir.
        </Text>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.updatedText}>
          Son güncelleme: {data ? formatUpdatedAt(data.last_updated_unix) : '-'}
        </Text>
        <Pressable style={styles.refreshButton} onPress={() => load(true)} disabled={loading}>
          <Text style={styles.refreshButtonText}>{loading ? 'Taranıyor...' : 'Şimdi Yenile'}</Text>
        </Pressable>
      </View>

      {loading && !data && <ActivityIndicator style={{ marginTop: 24 }} size="large" color={colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {data && data.picks.length === 0 && !loading && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            Şu anda hiçbir hisse için veri hesaplanamadı. Birkaç saniye sonra "Şimdi Yenile"yi
            deneyebilirsin.
          </Text>
        </View>
      )}

      {data &&
        data.picks.map((p, i) => (
          <PickCard
            key={p.ticker}
            pick={p}
            colors={colors}
            rank={i + 1}
            onPress={() => onSelectTicker(p.ticker.replace('.IS', ''))}
          />
        ))}

      {data && (
        <Text style={styles.note}>
          {data.note} ({data.matched_count}/{data.scanned_count} hisse hesaplandı)
        </Text>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: 20, paddingBottom: 60 },
    headerBox: {
      backgroundColor: colors.chipBackground,
      borderRadius: 10,
      padding: 14,
      marginBottom: 12,
    },
    headerTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
    headerText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    updatedText: { fontSize: 12, color: colors.textMuted },
    refreshButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    refreshButtonText: { color: colors.primaryText, fontWeight: '600', fontSize: 13 },
    error: { color: colors.bearish, marginTop: 8, textAlign: 'center' },
    emptyBox: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 16,
      marginTop: 8,
    },
    emptyText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
    note: { fontSize: 11, color: colors.textMuted, marginTop: 16, lineHeight: 15 },
  });
}

function makeCardStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rank: { fontSize: 12, color: colors.textMuted, fontWeight: '700', width: 24 },
    ticker: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
    price: { fontSize: 14, color: colors.text },
    signalBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    signalText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    metricsRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 4, marginTop: 8 },
    probabilityValue: { fontSize: 20, fontWeight: '800', color: colors.bullish },
    downsideValue: { fontSize: 16, fontWeight: '700', color: colors.bearish },
    metricLabel: { fontSize: 12, color: colors.textSecondary },
    targetValue: { fontSize: 15, fontWeight: '700', color: colors.text },
    detailRow: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
    newsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    newsBadge: {
      backgroundColor: colors.chipBackground,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    newsBadgeText: { fontSize: 11, color: colors.text, fontWeight: '600' },
    volatility: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
  });
}
