import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polyline, Rect } from 'react-native-svg';

import type { ThemeColors } from './theme';
import type { Candle, LevelWithTarget, SupportLevelWithTarget } from './types';

interface Props {
  candles: Candle[];
  resistanceLevels: LevelWithTarget[];
  supportLevels: SupportLevelWithTarget[];
  colors: ThemeColors;
  width: number;
  height?: number;
}

function fmt(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CandlestickChart({ candles, resistanceLevels, supportLevels, colors, width, height = 260 }: Props) {
  if (candles.length < 2) return null;

  const padding = 8;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const allLevels = [...resistanceLevels.map((r) => r.level), ...supportLevels.map((s) => s.level)];
  const allValues = candles.flatMap((c) => [c.high, c.low]).concat(allLevels);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  function yFor(value: number): number {
    return padding + usableHeight - ((value - min) / range) * usableHeight;
  }

  const slot = usableWidth / candles.length;
  const bodyWidth = Math.max(1, slot * 0.6);

  const ema9Points = candles
    .map((c, i) => (c.ema9 !== null ? `${padding + i * slot + slot / 2},${yFor(c.ema9)}` : null))
    .filter((p): p is string => p !== null)
    .join(' ');
  const ema21Points = candles
    .map((c, i) => (c.ema21 !== null ? `${padding + i * slot + slot / 2},${yFor(c.ema21)}` : null))
    .filter((p): p is string => p !== null)
    .join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        {supportLevels.map((s, i) => (
          <Line
            key={`s-${i}`}
            x1={padding}
            y1={yFor(s.level)}
            x2={width - padding}
            y2={yFor(s.level)}
            stroke={colors.bearish}
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.6}
          />
        ))}
        {resistanceLevels.map((r, i) => (
          <Line
            key={`r-${i}`}
            x1={padding}
            y1={yFor(r.level)}
            x2={width - padding}
            y2={yFor(r.level)}
            stroke={colors.bullish}
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.6}
          />
        ))}

        {candles.map((c, i) => {
          const x = padding + i * slot + slot / 2;
          const isBullish = c.close >= c.open;
          const color = isBullish ? colors.bullish : colors.bearish;
          const bodyTop = yFor(Math.max(c.open, c.close));
          const bodyBottom = yFor(Math.min(c.open, c.close));
          return (
            <Fragment key={i}>
              <Line x1={x} y1={yFor(c.high)} x2={x} y2={yFor(c.low)} stroke={color} strokeWidth={1} />
              <Rect
                x={x - bodyWidth / 2}
                y={bodyTop}
                width={bodyWidth}
                height={Math.max(1, bodyBottom - bodyTop)}
                fill={color}
              />
            </Fragment>
          );
        })}

        <Polyline points={ema21Points} fill="none" stroke={colors.caution} strokeWidth={1.5} />
        <Polyline points={ema9Points} fill="none" stroke={colors.primary} strokeWidth={1.5} />
      </Svg>

      {(resistanceLevels.length > 0 || supportLevels.length > 0) && (
        <View style={{ marginTop: 8 }}>
          {resistanceLevels.map((r, i) => (
            <Text key={`rl-${i}`} style={[styles.levelText, { color: colors.bullish }]}>
              Direnç {fmt(r.level)} → kırılırsa hedef ≈ {fmt(r.breakout_target)}
            </Text>
          ))}
          {supportLevels.map((s, i) => (
            <Text key={`sl-${i}`} style={[styles.levelText, { color: colors.bearish }]}>
              Destek {fmt(s.level)} → kırılırsa hedef ≈ {fmt(s.breakdown_target)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  levelText: { fontSize: 11, marginBottom: 2, fontWeight: '600' },
});
