import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import type { ThemeColors } from './theme';

interface Props {
  size?: number;
  colors: ThemeColors;
}

export default function AppLogo({ size = 44, colors }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.primary} />
          <Stop offset="1" stopColor={colors.bullish} />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="48" fill="url(#logoGrad)" />
      <SvgText x="50" y="64" fontSize="40" fontWeight="800" fill="#ffffff" textAnchor="middle">
        OA
      </SvgText>
      <Path
        d="M66,38 L82,22 M82,22 L73,22 M82,22 L82,31"
        stroke="#ffffff"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
