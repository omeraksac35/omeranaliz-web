import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from './config';
import type { ThemeColors } from './theme';

interface TickerItem {
  label: string;
  price: number;
  change_pct: number;
}

function fmtPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TickerTape({ colors }: { colors: ThemeColors }) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const measuredWidth = useRef(0);
  const animationRef = useRef<ReturnType<typeof Animated.loop> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ticker-tape`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true, easing: Easing.ease }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.ease }),
      ])
    ).start();
  }, []);

  function startScroll(width: number) {
    if (animationRef.current) animationRef.current.stop();
    translateX.setValue(0);
    animationRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: -width,
        duration: width * 22,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animationRef.current.start();
  }

  function handleLayout(e: { nativeEvent: { layout: { width: number } } }) {
    const fullWidth = e.nativeEvent.layout.width;
    const halfWidth = fullWidth / 2;
    if (halfWidth > 0 && Math.abs(halfWidth - measuredWidth.current) > 1) {
      measuredWidth.current = halfWidth;
      startScroll(halfWidth);
    }
  }

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.liveTag}>
        <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
        <Text style={[styles.liveText, { color: colors.textMuted }]}>CANLI</Text>
      </View>
      <View style={styles.viewport}>
        <Animated.View style={[styles.row, { transform: [{ translateX }] }]} onLayout={handleLayout}>
          {doubled.map((item, i) => (
            <View key={i} style={styles.item}>
              <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.price, { color: colors.textSecondary }]}>{fmtPrice(item.price)}</Text>
              <Text style={[styles.change, { color: item.change_pct >= 0 ? colors.bullish : colors.bearish }]}>
                {item.change_pct >= 0 ? '▲' : '▼'} %{Math.abs(item.change_pct).toFixed(2)}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  liveTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e53935' },
  liveText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  viewport: { flex: 1, overflow: 'hidden', height: 40, justifyContent: 'center' },
  row: { flexDirection: 'row' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14 },
  label: { fontSize: 12, fontWeight: '700' },
  price: { fontSize: 12 },
  change: { fontSize: 12, fontWeight: '700' },
});
