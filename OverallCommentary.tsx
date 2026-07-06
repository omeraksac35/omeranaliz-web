import { StyleSheet, Text, View } from 'react-native';

import { buildCommentary } from './commentary';
import type { ThemeColors } from './theme';
import type { AnalysisResult, NewsResult } from './types';

interface Props {
  result: AnalysisResult;
  news: NewsResult | null;
  colors: ThemeColors;
}

export default function OverallCommentary({ result, news, colors }: Props) {
  const styles = makeStyles(colors);
  const text = buildCommentary(result, news);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Genel Değerlendirme</Text>
      <Text style={styles.text}>{text}</Text>
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
    title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
    text: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  });
}
