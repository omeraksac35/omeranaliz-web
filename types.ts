export interface Criterion {
  label: string;
  positive: boolean;
}

export interface NewsArticle {
  title: string;
  source: string | null;
  pub_date: string;
  link: string;
}

export interface CriticalNote extends NewsArticle {
  categories: string[];
}

export interface NewsResult {
  query: string;
  critical_notes: CriticalNote[];
  articles: NewsArticle[];
  note: string;
}

export interface RiskyStock {
  ticker: string;
  price: number;
  volatility_pct: number;
  return_30d_pct: number;
  beta: number | null;
}

export interface RiskyStocksResult {
  stocks: RiskyStock[];
  scanned_count: number;
  note: string;
}

export interface NearestResistance {
  level: number;
  nearest_support: number;
  breakout_target: number;
  upside_to_level_pct: number;
  upside_to_target_pct: number;
}

export interface NearestSupport {
  level: number;
  nearest_resistance: number;
  breakdown_target: number;
  downside_to_level_pct: number;
  downside_to_target_pct: number;
}

export interface TrendSummary {
  label: string;
  signal: string;
  reason: string;
  rsi: number;
  macd_bullish: boolean;
}

export interface RiskProfile {
  ticker: string;
  price: number;
  volatility_pct: number;
  beta: number | null;
  return_30d_pct: number;
  entry_reference: number;
  kisa_vadeli_trend: TrendSummary;
  uzun_vadeli_trend: TrendSummary | null;
  nearest_resistance: NearestResistance | null;
  nearest_support: NearestSupport | null;
  all_resistance_levels: { level: number; nearest_support: number; breakout_target: number }[];
  all_support_levels: { level: number; nearest_resistance: number; breakdown_target: number }[];
  note: string;
}

export interface HistoryPoint {
  date: string;
  close: number;
  ema9: number;
  ema21: number;
  ema50: number | null;
}

export interface Fundamentals {
  sector: string | null;
  long_name: string | null;
  market_cap: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  debt_to_equity: number | null;
  roe: number | null;
  profit_margin: number | null;
  revenue_growth: number | null;
  earnings_growth: number | null;
  dividend_yield: number | null;
  current_ratio: number | null;
}

export interface TimeframeResult {
  label: string;
  price: number;
  signal: string;
  technical_signal: string;
  reason: string;
  confidence_pct: number;
  criteria: Criterion[];
  rsi: number;
  macd_bullish: boolean;
  support: number;
  resistance: number;
  volume_above_avg: boolean;
  is_buy_signal: boolean;
  entry_point: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  history: HistoryPoint[];
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  ema9: number | null;
  ema21: number | null;
  ema50: number | null;
}

export interface LevelWithTarget {
  level: number;
  nearest_support: number;
  breakout_target: number;
}

export interface SupportLevelWithTarget {
  level: number;
  nearest_resistance: number;
  breakdown_target: number;
}

export type ChartTimeframeKey = 'saatlik' | 'gunluk' | 'haftalik' | 'yillik';

export interface ChartResult {
  ticker: string;
  timeframe: ChartTimeframeKey;
  label: string;
  current_price: number;
  candles: Candle[];
  resistance_levels: LevelWithTarget[];
  support_levels: SupportLevelWithTarget[];
  note: string;
}

export interface RecommendationTarget {
  level: number;
  type: 'direnç' | 'destek';
  target_pct: number;
}

export interface MoveProbability {
  window_trading_days: number;
  required_move_pct: number;
  probability_pct: number;
  sample_size: number;
}

export interface BuyEntryPlan {
  action: 'AL';
  buy_level: number;
  stop_loss: number;
  take_profit: number;
  note: string;
}

export interface SellEntryPlan {
  action: 'SAT';
  sell_level: number;
  watch_level: number | null;
  note: string;
}

export interface LevelReference {
  level: number;
  pct: number;
  probability: MoveProbability | null;
}

export interface WaitEntryPlan {
  action: 'BEKLE';
  resistance: LevelReference | null;
  support: LevelReference | null;
  note: string;
}

export interface TopPick {
  ticker: string;
  price: number;
  potential_label: string;
  target_level: number | null;
  target_pct: number | null;
  probability_pct: number | null;
  has_resistance_overhead: boolean;
  support_level: number | null;
  support_distance_pct: number | null;
  downside_probability_pct: number | null;
  volatility_pct: number;
  critical_news_categories: string[];
}

export interface TopPicksResult {
  picks: TopPick[];
  scanned_count: number;
  matched_count: number;
  last_updated_unix: number;
  cache_ttl_seconds: number;
  note: string;
}

export interface OverallRecommendation {
  signal: string;
  is_buy_signal: boolean;
  reason: string;
  volatility_pct: number;
  is_speculative: boolean;
  target: RecommendationTarget | null;
  probability: MoveProbability | null;
  entry_plan: BuyEntryPlan | SellEntryPlan | WaitEntryPlan | null;
  note: string;
}

export interface AnalysisResult {
  ticker: string;
  price: number;
  saatlik: TimeframeResult;
  kisa_vadeli: TimeframeResult;
  uzun_vadeli: TimeframeResult;
  consistency_note: string;
  genel_tavsiye: OverallRecommendation;
  fundamentals: Fundamentals;
  fund_verdict: string;
  fund_notes: string[];
  disclaimer: string;
}
