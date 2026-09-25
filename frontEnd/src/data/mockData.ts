/**
 * Stock Definitions, Domain Types, and Mathematical Analytics Utilities.
 *
 * All data in the application is fetched live from the backend API.
 * This file contains strictly pure domain types, static stock metadata
 * (e.g. NSE tickers), and mathematical formulas (moving averages,
 * box plot statistics, histograms, correlation matrices) operating on REAL historical data.
 */

export type Candle = {
  date: string; // ISO yyyy-mm-dd
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockMeta = {
  symbol: string; // TCS
  ticker: string; // TCS.NS
  name: string;
  sector: string;
  basePrice?: number;
};

/** Supported Indian NSE stocks */
export const STOCKS: StockMeta[] = [
  {
    symbol: "TCS",
    ticker: "TCS.NS",
    name: "Tata Consultancy Services",
    sector: "Information Technology",
  },
  {
    symbol: "INFY",
    ticker: "INFY.NS",
    name: "Infosys Limited",
    sector: "Information Technology",
  },
  {
    symbol: "RELIANCE",
    ticker: "RELIANCE.NS",
    name: "Reliance Industries",
    sector: "Energy / Conglomerate",
  },
  {
    symbol: "HDFCBANK",
    ticker: "HDFCBANK.NS",
    name: "HDFC Bank Limited",
    sector: "Financial Services",
  },
  {
    symbol: "ICICIBANK",
    ticker: "ICICIBANK.NS",
    name: "ICICI Bank Limited",
    sector: "Financial Services",
  },
  {
    symbol: "ITC",
    ticker: "ITC.NS",
    name: "ITC Limited",
    sector: "FMCG / Consumer Goods",
  },
  {
    symbol: "SBIN",
    ticker: "SBIN.NS",
    name: "State Bank of India",
    sector: "Financial Services",
  },
  {
    symbol: "TATAMOTORS",
    ticker: "TATAMOTORS.NS",
    name: "Tata Motors Limited",
    sector: "Automobile",
  },
  {
    symbol: "WIPRO",
    ticker: "WIPRO.NS",
    name: "Wipro Limited",
    sector: "Information Technology",
  },
];

export const DEFAULT_SYMBOL = "TCS";

export function findStock(symbol: string): StockMeta | undefined {
  if (!symbol) return undefined;
  const clean = symbol.toUpperCase().replace(/\.NS$/, "");
  return STOCKS.find(
    (s) =>
      s.symbol.toUpperCase() === clean ||
      s.ticker.toUpperCase() === symbol.toUpperCase() ||
      s.symbol.toUpperCase() === symbol.toUpperCase(),
  );
}

export const PERIODS = [
  { value: "1W", label: "1 Week", days: 7 },
  { value: "1M", label: "1 Month", days: 30 },
  { value: "3M", label: "3 Months", days: 90 },
  { value: "6M", label: "6 Months", days: 180 },
  { value: "1Y", label: "1 Year", days: 365 },
  { value: "5Y", label: "5 Years", days: 1825 },
] as const;

export type PeriodValue = (typeof PERIODS)[number]["value"];

export function periodDays(period: string): number {
  return PERIODS.find((p) => p.value === period)?.days ?? 365;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates Simple Moving Average (SMA) for a given window over real historical candles.
 */
export function movingAverage(
  candles: Candle[],
  window: number,
): { date: string; value: number | null }[] {
  const res: { date: string; value: number | null }[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    sum += c.close;
    if (i >= window) {
      sum -= candles[i - window]!.close;
    }
    res.push({
      date: c.date,
      value: i >= window - 1 ? round2(sum / window) : null,
    });
  }
  return res;
}

export const CORRELATION_FEATURES = ["Open", "High", "Low", "Close", "Volume"] as const;

/**
 * Computes Pearson correlation matrix across numerical features for real historical candles.
 */
export function buildCorrelationMatrix(candles: Candle[]) {
  if (!candles || candles.length === 0) return [];
  const cols: Record<string, number[]> = {
    Open: candles.map((c) => c.open),
    High: candles.map((c) => c.high),
    Low: candles.map((c) => c.low),
    Close: candles.map((c) => c.close),
    Volume: candles.map((c) => c.volume),
  };

  const corr = (a: number[], b: number[]) => {
    const n = a.length;
    if (n === 0) return 0;
    const ma = a.reduce((s, v) => s + v, 0) / n;
    const mb = b.reduce((s, v) => s + v, 0) / n;
    let num = 0;
    let da = 0;
    let db = 0;
    for (let i = 0; i < n; i++) {
      const av = a[i]!;
      const bv = b[i]!;
      num += (av - ma) * (bv - mb);
      da += (av - ma) ** 2;
      db += (bv - mb) ** 2;
    }
    return da && db ? num / Math.sqrt(da * db) : 0;
  };

  return CORRELATION_FEATURES.map((r) => ({
    row: r,
    values: CORRELATION_FEATURES.map((c) => ({
      col: c,
      value: round2(corr(cols[r]!, cols[c]!)),
    })),
  }));
}

export type BoxStats = {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
};

/**
 * Computes box-plot quartiles and IQR boundaries from real historical price data.
 */
export function buildBoxStats(candles: Candle[]): BoxStats[] {
  if (!candles || candles.length === 0) return [];
  const series: Record<string, number[]> = {
    Open: candles.map((c) => c.open),
    High: candles.map((c) => c.high),
    Low: candles.map((c) => c.low),
    Close: candles.map((c) => c.close),
  };

  return Object.entries(series).map(([label, raw]) => {
    const v = [...raw].sort((a, b) => a - b);
    const q = (p: number) => v[Math.min(v.length - 1, Math.floor(p * (v.length - 1)))] ?? 0;
    const q1 = q(0.25);
    const q3 = q(0.75);
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    return {
      label,
      min: round2(Math.max(v[0] ?? 0, lo)),
      q1: round2(q1),
      median: round2(q(0.5)),
      q3: round2(q3),
      max: round2(Math.min(v[v.length - 1] ?? 0, hi)),
      outliers: v.filter((x) => x < lo || x > hi).map(round2),
    };
  });
}

/**
 * Computes frequency histogram buckets from real prices.
 */
export function buildHistogram(values: number[], bins = 12) {
  if (!values || values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / bins || 1;
  const out = Array.from({ length: bins }, (_, i) => ({
    bin: `${Math.round(min + i * width)}`,
    rangeLabel: `${round2(min + i * width)} – ${round2(min + (i + 1) * width)}`,
    count: 0,
  }));
  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v - min) / width));
    if (out[idx]) {
      out[idx]!.count++;
    }
  }
  return out;
}
