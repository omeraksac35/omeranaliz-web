import { View } from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';

import type { ThemeColors } from './theme';
import type { HistoryPoint } from './types';

interface Props {
  history: HistoryPoint[];
  support: number;
  resistance: number;
  colors: ThemeColors;
  width: number;
  height?: number;
}

function buildPoints(values: (number | null)[], width: number, height: number, min: number, max: number, padding: number): string {
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const range = max - min || 1;
  const step = values.length > 1 ? usableWidth / (values.length - 1) : 0;

  return values
    .map((v, i) => {
      if (v === null) return null;
      const x = padding + i * step;
      const y = padding + usableHeight - ((v - min) / range) * usableHeight;
      return `${x},${y}`;
    })
    .filter((p): p is string => p !== null)
    .join(' ');
}

export default function PriceChart({ history, support, resistance, colors, width, height = 220 }: Props) {
  if (history.length < 2) return null;

  const padding = 12;
  const closes = history.map((h) => h.close);
  const ema9s = history.map((h) => h.ema9);
  const ema21s = history.map((h) => h.ema21);

  const allValues = [...closes, ...ema9s, ...ema21s, support, resistance].filter(
    (v): v is number => v !== null && v !== undefined && !Number.isNaN(v)
  );
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const usableHeight = height - padding * 2;

  function yFor(value: number): number {
    return padding + usableHeight - ((value - min) / range) * usableHeight;
  }

  return (
    <View>
      <Svg width={width} height={height}>
        <Line
          x1={padding}
          y1={yFor(support)}
          x2={width - padding}
          y2={yFor(support)}
          stroke={colors.bearish}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <SvgText x={width - padding} y={yFor(support) - 4} fill={colors.bearish} fontSize={10} textAnchor="end">
          Destek {support.toFixed(2)}
        </SvgText>

        <Line
          x1={padding}
          y1={yFor(resistance)}
          x2={width - padding}
          y2={yFor(resistance)}
          stroke={colors.bullish}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <SvgText x={width - padding} y={yFor(resistance) - 4} fill={colors.bullish} fontSize={10} textAnchor="end">
          Direnç {resistance.toFixed(2)}
        </SvgText>

        <Polyline
          points={buildPoints(ema21s, width, height, min, max, padding)}
          fill="none"
          stroke={colors.caution}
          strokeWidth={1.5}
        />
        <Polyline
          points={buildPoints(ema9s, width, height, min, max, padding)}
          fill="none"
          stroke={colors.primary}
          strokeWidth={1.5}
        />
        <Polyline
          points={buildPoints(closes, width, height, min, max, padding)}
          fill="none"
          stroke={colors.text}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}
