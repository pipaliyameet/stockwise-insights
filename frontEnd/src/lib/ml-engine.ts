import fs from "fs";
import path from "path";

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LinearRegressionMetrics {
  mae: number;
  rmse: number;
  r2: number;
}

export interface MLPredictionResult {
  symbol: string;
  inputSymbol: string;
  lastTradingDate: string;
  lastClose: number;
  lastClosePrice: number;
  linearRegression: {
    predictedOpen: number;
    predictedHigh: number;
    predictedLow: number;
    predictedClose: number;
    metrics: LinearRegressionMetrics;
  };
  knn: {
    prediction: "UP" | "DOWN";
    accuracy: number;
    accuracyPercentage: number;
    k: number;
    confusionMatrix: number[][];
  };
  chartData: Candle[];
  historicalData: Candle[];
}

/**
 * Format stock symbol (e.g. TCS -> TCS.NS)
 */
export function formatStockSymbol(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  if (!clean) throw new Error("Stock symbol cannot be empty.");
  if (clean.includes(".")) return clean;
  const usTickers = new Set(["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"]);
  if (usTickers.has(clean)) return clean;
  return `${clean}.NS`;
}

/**
 * Parse CSV raw rows
 */
function parseCsv(csvText: string): Candle[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  const dateIdx = headers.findIndex((h) => h === "date" || h === "datetime");
  const openIdx = headers.findIndex((h) => h === "open");
  const highIdx = headers.findIndex((h) => h === "high");
  const lowIdx = headers.findIndex((h) => h === "low");
  const closeIdx = headers.findIndex((h) => h === "close" || h === "adj close");
  const volIdx = headers.findIndex((h) => h === "volume");

  const candles: Candle[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i]!.split(",").map((p) => p.trim());
    if (parts.length < 5) continue;

    const dateStr = parts[dateIdx !== -1 ? dateIdx : 0] || "";
    const open = parseFloat(parts[openIdx !== -1 ? openIdx : 1] || "0");
    const high = parseFloat(parts[highIdx !== -1 ? highIdx : 2] || "0");
    const low = parseFloat(parts[lowIdx !== -1 ? lowIdx : 3] || "0");
    const close = parseFloat(parts[closeIdx !== -1 ? closeIdx : 4] || "0");
    const volume = parseInt(parts[volIdx !== -1 ? volIdx : 5] || "0", 10) || 0;

    if (!isNaN(close) && close > 0) {
      candles.push({
        date: dateStr.slice(0, 10),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });
    }
  }

  // Sort chronological ascending
  candles.sort((a, b) => a.date.localeCompare(b.date));
  return candles;
}

/**
 * Fetch stock data from Yahoo Finance API with CSV dataset fallback
 */
export async function fetchHistoricalCandles(symbol: string): Promise<{ candles: Candle[]; formattedSymbol: string }> {
  const formattedSymbol = formatStockSymbol(symbol);
  let candles: Candle[] = [];

  // 1. Try real-time Yahoo Finance query
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(formattedSymbol)}?range=5y&interval=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data: any = await res.json();
      const result = data?.chart?.result?.[0];
      if (result && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps = result.timestamp as number[];
        const quote = result.indicators.quote[0];
        const opens = quote.open || [];
        const highs = quote.high || [];
        const lows = quote.low || [];
        const closes = quote.close || [];
        const volumes = quote.volume || [];

        for (let i = 0; i < timestamps.length; i++) {
          const c = closes[i];
          const o = opens[i] || c;
          const h = highs[i] || c;
          const l = lows[i] || c;
          const v = volumes[i] || 0;

          if (c !== null && c !== undefined && !isNaN(c)) {
            const dateStr = new Date(timestamps[i]! * 1000).toISOString().slice(0, 10);
            candles.push({
              date: dateStr,
              open: Number(o.toFixed(2)),
              high: Number(h.toFixed(2)),
              low: Number(l.toFixed(2)),
              close: Number(c.toFixed(2)),
              volume: Math.round(v),
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[Data Loader] Yahoo Finance query failed for ${formattedSymbol}:`, err);
  }

  // 2. If online fetch returned insufficient data, load local CSV fallback
  if (candles.length < 30) {
    const baseDirs = [
      process.cwd(),
      path.resolve(process.cwd(), ".."),
      path.resolve(process.cwd(), "data"),
      path.resolve(process.cwd(), "ml-service", "data"),
    ];

    const possibleNames = [
      `${formattedSymbol}.csv`,
      `${symbol.trim().toUpperCase()}.csv`,
      `${symbol.trim().toUpperCase()}.NS.csv`,
    ];

    for (const b of baseDirs) {
      for (const name of possibleNames) {
        const filePaths = [path.join(b, name), path.join(b, "data", name), path.join(b, "ml-service", "data", name)];
        for (const fp of filePaths) {
          try {
            if (fs.existsSync(fp)) {
              const content = fs.readFileSync(fp, "utf-8");
              const parsed = parseCsv(content);
              if (parsed.length >= 30) {
                candles = parsed;
                console.log(`[Data Loader] Loaded ${parsed.length} rows from fallback ${fp}`);
                break;
              }
            }
          } catch {}
        }
        if (candles.length >= 30) break;
      }
      if (candles.length >= 30) break;
    }
  }

  if (candles.length < 30) {
    throw new Error(`Stock symbol '${symbol}' not found. Please enter a valid NSE stock symbol (e.g., TCS, INFY, RELIANCE).`);
  }

  return { candles, formattedSymbol };
}

/**
 * Ordinary Least Squares Multiple Linear Regression
 */
function trainLinearRegression(
  X_train: number[][],
  y_train: number[],
  X_test: number[][],
  y_test: number[],
  latest_features: number[]
) {
  // Features: [bias=1, Open, High, Low, Close, Volume]
  const addBias = (X: number[][]) => X.map((row) => [1, ...row]);
  const X_b = addBias(X_train);

  const n = X_b.length;
  const p = X_b[0]!.length;

  // Compute (X^T * X)
  const XtX: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += X_b[k]![i]! * X_b[k]![j]!;
      }
      XtX[i]![j] = sum;
    }
  }

  // Regularization lambda for matrix invertibility
  for (let i = 0; i < p; i++) {
    XtX[i]![i] += 1e-4;
  }

  // Invert p x p matrix using Gaussian elimination
  const inv = invertMatrix(XtX);

  // Compute X^T * y
  const Xty: number[] = Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += X_b[k]![i]! * y_train[k]!;
    }
    Xty[i] = sum;
  }

  // beta = inv(X^T * X) * X^T * y
  const beta: number[] = Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    let sum = 0;
    for (let j = 0; j < p; j++) {
      sum += inv[i]![j]! * Xty[j]!;
    }
    beta[i] = sum;
  }

  // Predict test set and calculate MAE, RMSE, R²
  const predictRow = (row: number[]) => {
    let val = beta[0]!;
    for (let i = 0; i < row.length; i++) {
      val += beta[i + 1]! * row[i]!;
    }
    return val;
  };

  const y_pred = X_test.map(predictRow);
  const nTest = y_test.length;

  let maeSum = 0;
  let mseSum = 0;
  let yMean = 0;
  for (let i = 0; i < nTest; i++) {
    yMean += y_test[i]!;
    const diff = Math.abs(y_test[i]! - y_pred[i]!);
    maeSum += diff;
    mseSum += diff * diff;
  }
  yMean /= nTest;

  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < nTest; i++) {
    ssTot += Math.pow(y_test[i]! - yMean, 2);
    ssRes += Math.pow(y_test[i]! - y_pred[i]!, 2);
  }

  const mae = Number((maeSum / nTest).toFixed(2));
  const rmse = Number(Math.sqrt(mseSum / nTest).toFixed(2));
  const r2 = Number(Math.max(0, 1 - ssRes / (ssTot || 1)).toFixed(4));

  // Predict latest tomorrow close
  const predictedClose = Number(predictRow(latest_features).toFixed(2));
  return {
    predictedClose,
    metrics: { mae, rmse, r2 },
  };
}

function invertMatrix(M: number[][]): number[][] {
  const n = M.length;
  const A: number[][] = M.map((row) => [...row]);
  const I: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let i = 0; i < n; i++) {
    let pivot = A[i]?.[i] ?? 0;
    if (Math.abs(pivot) < 1e-9) {
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k]?.[i] ?? 0) > Math.abs(pivot)) {
          const tempA = A[i]!;
          A[i] = A[k]!;
          A[k] = tempA;
          const tempI = I[i]!;
          I[i] = I[k]!;
          I[k] = tempI;
          pivot = A[i]?.[i] ?? 0;
          break;
        }
      }
    }
    if (Math.abs(pivot) < 1e-9) pivot = 1e-4;

    const rowAi = A[i]!;
    const rowIi = I[i]!;
    for (let j = 0; j < n; j++) {
      rowAi[j] = (rowAi[j] ?? 0) / pivot;
      rowIi[j] = (rowIi[j] ?? 0) / pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const rowAk = A[k]!;
        const rowIk = I[k]!;
        const factor = rowAk[i] ?? 0;
        for (let j = 0; j < n; j++) {
          rowAk[j] = (rowAk[j] ?? 0) - factor * (rowAi[j] ?? 0);
          rowIk[j] = (rowIk[j] ?? 0) - factor * (rowIi[j] ?? 0);
        }
      }
    }
  }

  return I;
}

/**
 * K-Nearest Neighbors Classifier (K=5, StandardScaler)
 */
function trainKnnClassifier(
  X_train: number[][],
  y_train: number[], // 1 = UP, 0 = DOWN
  X_test: number[][],
  y_test: number[],
  latest_features: number[],
  k = 5
) {
  const p = X_train[0]!.length;
  const nTrain = X_train.length;

  // 1. Calculate Mean and Std on Training set only (prevent data leakage)
  const means: number[] = Array(p).fill(0);
  const stds: number[] = Array(p).fill(0);

  for (let j = 0; j < p; j++) {
    let sum = 0;
    for (let i = 0; i < nTrain; i++) {
      sum += X_train[i]![j]!;
    }
    means[j] = sum / nTrain;

    let sumSq = 0;
    for (let i = 0; i < nTrain; i++) {
      sumSq += Math.pow(X_train[i]![j]! - means[j]!, 2);
    }
    stds[j] = Math.sqrt(sumSq / nTrain) || 1;
  }

  const scaleRow = (row: number[]) => row.map((val, j) => (val - means[j]!) / stds[j]!);

  const X_train_scaled = X_train.map(scaleRow);
  const X_test_scaled = X_test.map(scaleRow);
  const latest_scaled = scaleRow(latest_features);

  // Predict class using K nearest neighbors
  const classify = (sample: number[]): number => {
    const distances = X_train_scaled.map((trainRow, idx) => {
      let distSq = 0;
      for (let j = 0; j < p; j++) {
        distSq += Math.pow(sample[j]! - trainRow[j]!, 2);
      }
      return { dist: Math.sqrt(distSq), label: y_train[idx]! };
    });

    distances.sort((a, b) => a.dist - b.dist);
    const topK = distances.slice(0, k);
    const upVotes = topK.filter((item) => item.label === 1).length;
    return upVotes >= k / 2 ? 1 : 0;
  };

  // Evaluate on test set
  let correct = 0;
  const cm: number[][] = [
    [0, 0],
    [0, 0],
  ]; // [[True DOWN, False UP], [False DOWN, True UP]]

  for (let i = 0; i < X_test_scaled.length; i++) {
    const pred = classify(X_test_scaled[i]!);
    const actual = y_test[i]!;
    if (pred === actual) correct++;
    const row0 = cm[0]!;
    const row1 = cm[1]!;
    if (actual === 0 && pred === 0) row0[0] = (row0[0] ?? 0) + 1;
    if (actual === 0 && pred === 1) row0[1] = (row0[1] ?? 0) + 1;
    if (actual === 1 && pred === 0) row1[0] = (row1[0] ?? 0) + 1;
    if (actual === 1 && pred === 1) row1[1] = (row1[1] ?? 0) + 1;
  }

  const accuracy = Number((correct / (X_test_scaled.length || 1)).toFixed(4));
  const accuracyPercentage = Number((accuracy * 100).toFixed(2));

  const nextDirection = classify(latest_scaled) === 1 ? "UP" : "DOWN";

  return {
    prediction: nextDirection as "UP" | "DOWN",
    accuracy,
    accuracyPercentage,
    k,
    confusionMatrix: cm,
  };
}

/**
 * Run Complete Machine Learning Pipeline for a Stock
 */
export async function runStockPredictionEngine(symbol: string): Promise<MLPredictionResult> {
  const { candles, formattedSymbol } = await fetchHistoricalCandles(symbol);

  // Prepare Dataset: X = [Open, High, Low, Close, Volume], target = Tomorrow_Close
  const X: number[][] = [];
  const y_price: number[] = [];
  const y_direction: number[] = [];

  for (let i = 0; i < candles.length - 1; i++) {
    const curr = candles[i]!;
    const next = candles[i + 1]!;
    X.push([curr.open, curr.high, curr.low, curr.close, curr.volume]);
    y_price.push(next.close);
    y_direction.push(next.close > curr.close ? 1 : 0);
  }

  // 80% train, 20% test chronological split
  const splitIdx = Math.floor(X.length * 0.8);
  const X_train = X.slice(0, splitIdx);
  const y_train_price = y_price.slice(0, splitIdx);
  const y_train_dir = y_direction.slice(0, splitIdx);

  const X_test = X.slice(splitIdx);
  const y_test_price = y_price.slice(splitIdx);
  const y_test_dir = y_direction.slice(splitIdx);

  const lastCandle = candles[candles.length - 1]!;
  const latestFeatures = [lastCandle.open, lastCandle.high, lastCandle.low, lastCandle.close, lastCandle.volume];

  // 1. Train Linear Regression & Predict Continuous Next-Day Price
  const lr = trainLinearRegression(X_train, y_train_price, X_test, y_test_price, latestFeatures);

  // 2. Train KNN Classifier & Predict Direction
  const knn = trainKnnClassifier(X_train, y_train_dir, X_test, y_test_dir, latestFeatures, 5);

  const lastClose = lastCandle.close;
  const priceRatio = lr.predictedClose / (lastClose || 1);

  const predictedOpen = Number((lastCandle.open * priceRatio).toFixed(2));
  const predictedHigh = Number((Math.max(lastCandle.high * priceRatio, lr.predictedClose * 1.01)).toFixed(2));
  const predictedLow = Number((Math.min(lastCandle.low * priceRatio, lr.predictedClose * 0.99)).toFixed(2));

  return {
    symbol: formattedSymbol,
    inputSymbol: symbol.trim().toUpperCase(),
    lastTradingDate: lastCandle.date,
    lastClose: lastClose,
    lastClosePrice: lastClose,
    linearRegression: {
      predictedOpen,
      predictedHigh,
      predictedLow,
      predictedClose: lr.predictedClose,
      metrics: lr.metrics,
    },
    knn: {
      prediction: knn.prediction,
      accuracy: knn.accuracy,
      accuracyPercentage: knn.accuracyPercentage,
      k: knn.k,
      confusionMatrix: knn.confusionMatrix,
    },
    chartData: candles.slice(-60),
    historicalData: candles,
  };
}
