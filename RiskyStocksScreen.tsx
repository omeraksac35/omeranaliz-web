import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { API_BASE_URL } from './config';
import { signalColor, type ThemeColors } from './theme';
import type { RiskProfile, RiskyStocksResult, TrendSummary } from './types';

interface Props {
  colors: ThemeColors;
}

function fmtSigned(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}`;
}

function fmt(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TrendRow({ trend, colors }: { trend: TrendSummary; colors: ThemeColors }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 12, color: colors.textMuted, width: 130 }}>{trend.label}</Text>
        <View
          style={{
            backgroundColor: signalColor(colors, trend.signal),
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{trend.signal}</Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>RSI {trend.rsi}</Text>
      </View>
    </View>
  );
}

export default function RiskyStocksScreen({ colors }: Props) {
  const [symbol, setSymbol] = useState('');
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [discover, setDiscover] = useState<RiskyStocksResult | null>(null);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  const styles = makeStyles(colors);

  function searchRiskProfile(rawSymbol: string) {
    const trimmed = rawSymbol.trim();
    if (!trimmed) return;
    setProfileLoading(true);
    setProfileError(null);
    setProfile(null);
    fetch(`${API_BASE_URL}/risk-profile/${encodeURIComponent(trimmed)}`)
      .then(async (resp) => {
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Risk profili alınamadı.');
        setProfile(json as RiskProfile);
      })
      .catch((e) => setProfileError(e.message || 'Risk profili alınamadı.'))
      .finally(() => setProfileLoading(false));
  }

  function loadDiscover() {
    setDiscoverLoading(true);
    setDiscoverError(null);
    fetch(`${API_BASE_URL}/risky-stocks`)
      .then(async (resp) => {
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Riskli hisseler alınamadı.');
        setDiscover(json as RiskyStocksResult);
      })
      .catch((e) => setDiscoverError(e.message || 'Riskli hisseler alınamadı.'))
      .finally(() => setDiscoverLoading(false));
  }

  useEffect(() => {
    loadDiscover();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Risk Değerlendirmesi</Text>
        <Text style={styles.warningText}>
          Bir hisse ara: giriş noktası, en yakın direnç/destek ve kırılırsa ne kadar
          gidebileceğini gösterir. Bu bir yön tahmini değildir — yüksek oynaklık hem
          büyük kazanç hem büyük kayıp riski taşır.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Hisse kodu (örn. MANAS)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          value={symbol}
          onChangeText={setSymbol}
          onSubmitEditing={() => searchRiskProfile(symbol)}
          returnKeyType="search"
        />
        <Pressable style={styles.button} onPress={() => searchRiskProfile(symbol)} disabled={profileLoading}>
          <Text style={styles.buttonText}>{profileLoading ? '...' : 'Risk Analizi'}</Text>
        </Pressable>
      </View>

      {profileLoading && <ActivityIndicator style={{ marginTop: 16 }} size="large" color={colors.primary} />}
      {profileError && <Text style={styles.error}>{profileError}</Text>}

      {profile && !profileLoading && (
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.ticker}>{profile.ticker}</Text>
            <Text style={styles.price}>{fmt(profile.price)} TL</Text>
          </View>

          <View style={styles.metricsRow}>
            <Text style={styles.metric}>
              Oynaklık: <Text style={styles.metricValue}>%{profile.volatility_pct}</Text>
            </Text>
            <Text style={[styles.metric, { color: profile.return_30d_pct >= 0 ? colors.bullish : colors.bearish }]}>
              30g: {fmtSigned(profile.return_30d_pct)}%
            </Text>
            {profile.beta !== null && <Text style={styles.metric}>Beta: {profile.beta}</Text>}
          </View>

          <View style={styles.entryBox}>
            <Text style={styles.entryLabel}>Giriş noktası (referans, güncel fiyat)</Text>
            <Text style={styles.entryValue}>{fmt(profile.entry_reference)} TL</Text>
          </View>

          <Text style={styles.trendSectionTitle}>Şu anki trend</Text>
          <TrendRow trend={profile.kisa_vadeli_trend} colors={colors} />
          {profile.uzun_vadeli_trend && <TrendRow trend={profile.uzun_vadeli_trend} colors={colors} />}
          <Text style={styles.trendReason}>{profile.kisa_vadeli_trend.reason}</Text>

          {profile.nearest_resistance && (
            <View style={[styles.levelBox, { borderColor: colors.bullish }]}>
              <Text style={[styles.levelTitle, { color: colors.bullish }]}>📈 Yukarı kırılırsa (direnç)</Text>
              <Text style={styles.levelDetail}>
                Direnç seviyesi: {fmt(profile.nearest_resistance.level)} TL (
                {fmtSigned(profile.nearest_resistance.upside_to_level_pct)}%)
              </Text>
              <Text style={styles.levelDetail}>
                Kırılırsa hedef: {fmt(profile.nearest_resistance.breakout_target)} TL (
                {fmtSigned(profile.nearest_resistance.upside_to_target_pct)}% potansiyel)
              </Text>
            </View>
          )}

          {profile.nearest_support && (
            <View style={[styles.levelBox, { borderColor: colors.bearish }]}>
              <Text style={[styles.levelTitle, { color: colors.bearish }]}>📉 Aşağı kırılırsa (destek)</Text>
              <Text style={styles.levelDetail}>
                Destek seviyesi: {fmt(profile.nearest_support.level)} TL (-
                {profile.nearest_support.downside_to_level_pct}%)
              </Text>
              <Text style={styles.levelDetail}>
                Kırılırsa hedef: {fmt(profile.nearest_support.breakdown_target)} TL (-
                {profile.nearest_support.downside_to_target_pct}% risk)
              </Text>
            </View>
          )}

          {!profile.nearest_resistance && !profile.nearest_support && (
            <Text style={styles.empty}>Belirgin bir direnç/destek seviyesi tespit edilemedi.</Text>
          )}

          <Text style={styles.note}>{profile.note}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Keşfet: En Oynak Hisseler</Text>
      <Pressable style={styles.refreshButton} onPress={loadDiscover} disabled={discoverLoading}>
        <Text style={styles.buttonText}>{discoverLoading ? 'Taranıyor...' : 'Yenile'}</Text>
      </Pressable>

      {discoverLoading && <ActivityIndicator style={{ marginTop: 12 }} color={colors.primary} />}
      {discoverError && <Text style={styles.error}>{discoverError}</Text>}

      {discover &&
        !discoverLoading &&
        discover.stocks.map((s, i) => (
          <Pressable
            key={s.ticker}
            style={styles.row}
            onPress={() => {
              const base = s.ticker.replace('.IS', '');
              setSymbol(base);
              searchRiskProfile(base);
            }}
          >
            <View style={styles.rowHeader}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.rowTicker}>{s.ticker.replace('.IS', '')}</Text>
              <Text style={styles.price}>{s.price.toFixed(2)} TL</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metric}>
                Oynaklık: <Text style={styles.metricValue}>%{s.volatility_pct}</Text>
              </Text>
              <Text style={[styles.metric, { color: s.return_30d_pct >= 0 ? colors.bullish : colors.bearish }]}>
                30g: {fmtSigned(s.return_30d_pct)}%
              </Text>
              {s.beta !== null && <Text style={styles.metric}>Beta: {s.beta}</Text>}
            </View>
          </Pressable>
        ))}

      {discover && !discoverLoading && (
        <Text style={styles.note}>
          {discover.note} ({discover.scanned_count} hisse tarandı)
        </Text>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: 20, paddingBottom: 60 },
    warningBox: {
      backgroundColor: colors.chipBackground,
      borderRadius: 10,
      padding: 14,
      marginBottom: 12,
    },
    warningTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
    warningText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
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
    error: { color: colors.bearish, marginTop: 8 },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      marginBottom: 20,
    },
    profileHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    ticker: { fontSize: 18, fontWeight: '700', color: colors.text },
    price: { fontSize: 16, color: colors.text },
    entryBox: {
      backgroundColor: colors.chipBackground,
      borderRadius: 8,
      padding: 10,
      marginTop: 10,
      marginBottom: 10,
    },
    entryLabel: { fontSize: 12, color: colors.textMuted },
    entryValue: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
    trendSectionTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
    trendReason: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginBottom: 10 },
    levelBox: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
    },
    levelTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
    levelDetail: { fontSize: 13, color: colors.text, marginBottom: 2 },
    empty: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', marginTop: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
    refreshButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      marginBottom: 12,
    },
    row: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
    },
    rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rank: { fontSize: 12, color: colors.textMuted, fontWeight: '700', width: 24 },
    rowTicker: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
    metricsRow: { flexDirection: 'row', gap: 16, marginTop: 6 },
    metric: { fontSize: 12, color: colors.textSecondary },
    metricValue: { fontWeight: '700', color: colors.caution },
    note: { fontSize: 11, color: colors.textMuted, marginTop: 16, lineHeight: 15 },
  });
}
