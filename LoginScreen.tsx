import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Line, Polyline, Rect } from 'react-native-svg';

import AppLogo from './AppLogo';
import { useAuth } from './AuthContext';
import type { ThemeColors } from './theme';

interface Props {
  colors: ThemeColors;
}

function LoginChartDecoration({ colors }: { colors: ThemeColors }) {
  const bars = [
    { x: 10, h: 18, up: true },
    { x: 30, h: 28, up: false },
    { x: 50, h: 22, up: true },
    { x: 70, h: 40, up: true },
    { x: 90, h: 16, up: false },
    { x: 110, h: 46, up: true },
    { x: 130, h: 34, up: true },
    { x: 150, h: 54, up: true },
  ];
  const baseline = 70;

  return (
    <Svg width={170} height={80} viewBox="0 0 170 80">
      {bars.map((b, i) => (
        <Rect
          key={i}
          x={b.x}
          y={baseline - b.h}
          width={12}
          height={b.h}
          rx={2}
          fill={b.up ? colors.bullish : colors.bearish}
          opacity={0.85}
        />
      ))}
      <Polyline
        points={bars.map((b) => `${b.x + 6},${baseline - b.h - 4}`).join(' ')}
        fill="none"
        stroke={colors.primary}
        strokeWidth={2}
      />
      <Line x1={0} y1={baseline + 4} x2={170} y2={baseline + 4} stroke={colors.border} strokeWidth={1} />
    </Svg>
  );
}

export default function LoginScreen({ colors }: Props) {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const styles = makeStyles(colors);

  function handleSubmit() {
    const ok = login(userId, password);
    if (!ok) {
      setError('Kullanıcı ID veya şifre hatalı.');
    } else {
      setError(null);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.logoWrap}>
        <AppLogo size={84} colors={colors} />
      </View>
      <Text style={styles.title}>OmerAnaliz</Text>
      <Text style={styles.subtitle}>Devam etmek için giriş yap</Text>

      <View style={styles.chartDecoration}>
        <LoginChartDecoration colors={colors} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Kullanıcı ID</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Kullanıcı ID"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Şifre"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    logoWrap: { alignItems: 'center', marginBottom: 16 },
    chartDecoration: { alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 30, fontWeight: '800', color: colors.text, textAlign: 'center' },
    subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 20 },
    form: { gap: 6 },
    label: { fontSize: 13, color: colors.textSecondary, marginTop: 10 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: 16,
    },
    error: { color: colors.bearish, fontSize: 13, marginTop: 8 },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: { color: colors.primaryText, fontWeight: '700', fontSize: 16 },
  });
}
