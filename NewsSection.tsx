import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from './theme';
import type { NewsResult } from './types';

interface Props {
  data: NewsResult | null;
  loading: boolean;
  error: string | null;
  colors: ThemeColors;
}

function formatDate(pubDate: string): string {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NewsSection({ data, loading, error, colors }: Props) {
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Güncel Haberler</Text>

      {loading && <ActivityIndicator color={colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {data && data.critical_notes.length > 0 && (
        <View style={styles.criticalBox}>
          <Text style={styles.criticalTitle}>🔴 Kritik Gelişmeler</Text>
          {data.critical_notes.map((c, i) => (
            <Pressable key={i} onPress={() => Linking.openURL(c.link)} style={styles.criticalItem}>
              <Text style={styles.criticalCategory}>{c.categories.join(', ')}</Text>
              <Text style={styles.itemTitle}>{c.title}</Text>
              <Text style={styles.itemMeta}>
                {c.source ?? 'Kaynak bilinmiyor'} · {formatDate(c.pub_date)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {data && !loading && data.articles.length === 0 && (
        <Text style={styles.empty}>Son günlerde bu hisseyle ilgili haber bulunamadı.</Text>
      )}

      {data && (
        <>
          <Text style={styles.subheading}>Tüm başlıklar</Text>
          {data.articles.map((a, i) => (
            <Pressable key={i} onPress={() => Linking.openURL(a.link)} style={styles.item}>
              <Text style={styles.itemTitle}>{a.title}</Text>
              <Text style={styles.itemMeta}>
                {a.source ?? 'Kaynak bilinmiyor'} · {formatDate(a.pub_date)}
              </Text>
            </Pressable>
          ))}
        </>
      )}

      {data && <Text style={styles.note}>{data.note}</Text>}
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
    subheading: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginTop: 10, marginBottom: 4 },
    error: { color: colors.bearish },
    empty: { color: colors.textMuted, fontStyle: 'italic' },
    criticalBox: {
      backgroundColor: colors.chipBackground,
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
    },
    criticalTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
    criticalItem: {
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    criticalCategory: { fontSize: 11, fontWeight: '700', color: colors.caution, marginBottom: 2 },
    item: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemTitle: { fontSize: 14, color: colors.primary, fontWeight: '600' },
    itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    note: { fontSize: 11, color: colors.textMuted, marginTop: 12, lineHeight: 15 },
  });
}
