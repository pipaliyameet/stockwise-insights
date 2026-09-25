import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  Compass,
  TrendingUp,
  BarChart3,
  Calendar,
  History,
  RefreshCw,
  Database,
  CheckCircle2,
} from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, ChartFrame, GRID_STROKE, TOOLTIP_STYLE } from "@/components/charts/chartTheme";
import { ChartCard } from "@/components/common/ChartCard";
import type { RealPredictionData, PredictionHistoryRecord } from "@/services/api";
import { formatINR, formatPercent, formatShortDate, formatSigned } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PredictionDisclaimer({ className }: { className?: string | undefined }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground shadow-sm",
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">Academic Machine Learning Model</p>
        <p>
          Predictions are computed live via scikit-learn (Linear Regression &amp; KNN Classifier)
          and are estimates for educational evaluation, not financial advice.
        </p>
      </div>
    </div>
  );
}

/**
 * 1. Linear Regression Price Prediction Card
 */
export function LinearRegressionCard({ data }: { data: RealPredictionData }) {
  const { symbol, lastTradingDate, lastClose, lastClosePrice, linearRegression } = data;
  const currentPrice = lastClose ?? lastClosePrice;
  const { predictedOpen, predictedHigh, predictedLow, predictedClose } = linearRegression;

  const priceDiff = predictedClose - currentPrice;
  const priceDiffPct = currentPrice ? (priceDiff / currentPrice) * 100 : 0;
  const isUp = priceDiff >= 0;

  return (
    <div className="panel overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-4" />
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold tracking-tight">
              Linear Regression — Next-Day Price
            </h2>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">
              Continuous stock price prediction (Tomorrow_Close)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] sm:text-xs font-semibold text-primary">
            {symbol}
          </span>
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground">
            <Calendar className="size-3" /> {lastTradingDate}
          </span>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 p-3.5 sm:p-5">
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Predicted Next-Day Close
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              {formatINR(predictedClose)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-xs sm:text-sm font-semibold",
                isUp
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              )}
            >
              {isUp ? (
                <ArrowUpRight className="size-3.5 sm:size-4" />
              ) : (
                <ArrowDownRight className="size-3.5 sm:size-4" />
              )}
              {formatSigned(priceDiff)} ({formatPercent(priceDiffPct)})
            </span>
          </div>
          <p className="mt-1.5 text-[11px] sm:text-xs text-muted-foreground">
            Compared to last recorded market close of{" "}
            <span className="font-mono font-medium text-foreground">{formatINR(currentPrice)}</span>
          </p>
        </div>

        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2">
            Predicted Price Breakdown
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Predicted Open
              </p>
              <p className="mt-0.5 sm:mt-1 font-mono text-sm sm:text-base font-semibold text-foreground">
                {formatINR(predictedOpen)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Predicted High
              </p>
              <p className="mt-0.5 sm:mt-1 font-mono text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
                {formatINR(predictedHigh)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Predicted Low
              </p>
              <p className="mt-0.5 sm:mt-1 font-mono text-sm sm:text-base font-semibold text-rose-600 dark:text-rose-400">
                {formatINR(predictedLow)}
              </p>
            </div>
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-2.5 sm:p-3">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-primary font-semibold">
                Predicted Close
              </p>
              <p className="mt-0.5 sm:mt-1 font-mono text-sm sm:text-base font-semibold text-primary">
                {formatINR(predictedClose)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-3 sm:p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs">
            <span className="font-semibold text-foreground">
              Linear Regression Model Evaluation
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground">
              80/20 Chronological Split
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
            <div className="rounded-md bg-card border border-border p-2">
              <span className="text-[10px] text-muted-foreground uppercase">MAE</span>
              <p className="font-mono font-bold mt-0.5">₹{linearRegression.metrics.mae}</p>
            </div>
            <div className="rounded-md bg-card border border-border p-2">
              <span className="text-[10px] text-muted-foreground uppercase">RMSE</span>
              <p className="font-mono font-bold mt-0.5">₹{linearRegression.metrics.rmse}</p>
            </div>
            <div className="rounded-md bg-card border border-border p-2">
              <span className="text-[10px] text-muted-foreground uppercase">R² Score</span>
              <p className="font-mono font-bold text-primary mt-0.5">
                {linearRegression.metrics.r2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. KNN Classification Direction Card
 */
export function KnnDirectionCard({ knn }: { knn: RealPredictionData["knn"] }) {
  const isUp = knn.prediction === "UP";

  return (
    <div className="panel overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Compass className="size-4" />
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold tracking-tight">
              KNN Classification — Market Direction
            </h2>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">
              Predicts whether tomorrow closes higher or lower
            </p>
          </div>
        </div>
        <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground">
          K = {knn.k} Neighbors
        </span>
      </div>

      <div className="grid gap-3 sm:gap-5 p-3.5 sm:p-5 md:grid-cols-2">
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border p-4 sm:p-6 text-center transition-all",
            isUp
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
          )}
        >
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            Predicted Market Direction
          </p>
          <div className="mt-1.5 sm:mt-2 flex items-center justify-center gap-2 font-mono text-3xl sm:text-5xl font-extrabold">
            {isUp ? (
              <>
                <span>UP</span>
                <ArrowUpRight className="size-7 sm:size-10" />
              </>
            ) : (
              <>
                <span>DOWN</span>
                <ArrowDownRight className="size-7 sm:size-10" />
              </>
            )}
          </div>
          <p className="mt-2 text-[11px] sm:text-xs font-medium opacity-90">
            {isUp
              ? "Model forecasts tomorrow's close will be HIGHER than today."
              : "Model forecasts tomorrow's close will be LOWER than today."}
          </p>
        </div>

        <div className="flex flex-col justify-between space-y-3 sm:space-y-4">
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              KNN Model Test Accuracy
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
                {knn.accuracyPercentage}%
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                accuracy on test data
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, knn.accuracyPercentage)}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] sm:text-xs text-muted-foreground">
            <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Important Classification Note
            </p>
            <p className="mt-1">
              <strong>KNN predicts market direction, not exact price.</strong> Input features (Open,
              High, Low, Close, Volume) are scaled using{" "}
              <code className="font-mono font-medium">StandardScaler</code> so large volume figures
              do not distort Euclidean distance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Model Evaluation Metrics Card
 */
export function ModelPerformanceSummaryCard({ data }: { data: RealPredictionData }) {
  const { linearRegression, knn } = data;

  return (
    <div className="panel overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <h2 className="text-xs sm:text-sm font-semibold tracking-tight">
            Model Evaluation Metrics
          </h2>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground font-mono">
          80% Train / 20% Test Split
        </span>
      </div>

      <div className="grid gap-3 sm:gap-4 p-3.5 sm:p-5 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4 bg-card">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold text-primary uppercase">1. Linear Regression</span>
            <span className="text-[11px] text-muted-foreground">Price Forecaster</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">MAE</p>
              <p className="mt-0.5 font-mono text-sm font-bold">₹{linearRegression.metrics.mae}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">RMSE</p>
              <p className="mt-0.5 font-mono text-sm font-bold">₹{linearRegression.metrics.rmse}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">R² Score</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-primary">
                {linearRegression.metrics.r2}
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] text-muted-foreground">
            Mean Absolute Error (MAE) measures average prediction deviation in ₹. R² indicates
            goodness of fit.
          </p>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold text-emerald-500 uppercase">
              2. KNN Classification
            </span>
            <span className="text-[11px] text-muted-foreground">Direction Predictor</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Accuracy</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-emerald-500">
                {knn.accuracyPercentage}%
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">K Neighbors</p>
              <p className="mt-0.5 font-mono text-sm font-bold">{knn.k}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Scaling</p>
              <p className="mt-0.5 font-mono text-[11px] font-semibold text-foreground truncate">
                Standard
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] text-muted-foreground">
            Accuracy evaluated on chronological test days. Features normalized with StandardScaler
            to avoid bias.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Real Historical Price Chart with Model Forecast Point
 */
export function HistoricalPredictionChart({ data }: { data: RealPredictionData }) {
  const candles = data.chartData || [];
  const predictedClose = data.linearRegression.predictedClose;

  // Format real chart points
  const points = candles.map((c) => ({
    date: c.date,
    actual: c.close,
    predicted: null as number | null,
  }));

  // Append predicted point next to the last trading day
  const lastPoint = points[points.length - 1];
  const chartSeries = [
    ...points,
    {
      date: "Next Day (Est)",
      actual: lastPoint ? lastPoint.actual : null,
      predicted: predictedClose,
    },
  ];

  return (
    <ChartCard
      title={`Historical Closing Price Trend — ${data.symbol}`}
      description="Actual closing prices from the dataset with Linear Regression predicted next-day closing price."
      exportData={candles as unknown as Record<string, unknown>[]}
      exportName={`${data.symbol}-historical-chart`}
    >
      <ChartFrame height={320}>
        <LineChart data={chartSeries} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            {...AXIS}
            tickFormatter={(v: string) => (v.includes("Next") ? "Next Day" : formatShortDate(v))}
            minTickGap={28}
          />
          <YAxis
            {...AXIS}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => `₹${Math.round(v)}`}
            width={55}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              `₹${Number(value).toFixed(2)}`,
              name === "actual" ? "Actual Close" : "Predicted Close",
            ]}
            labelFormatter={(label: string) =>
              label.includes("Next") ? "Next Trading Day (Prediction)" : label
            }
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Close"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            name="Predicted Close (LR)"
            stroke="#10b981"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ r: 5, fill: "#10b981" }}
            connectNulls
          />
        </LineChart>
      </ChartFrame>
    </ChartCard>
  );
}

/**
 * 5. Prediction History Table (MongoDB)
 */
export function PredictionHistoryTable({
  history,
  loading,
  onRefresh,
}: {
  history: PredictionHistoryRecord[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="panel overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <History className="size-4 text-purple-500" />
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Prediction History</h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Database className="size-3 text-emerald-500" />
              Persisted in MongoDB (<code className="font-mono">stock_ml.predictions</code>)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh History
        </Button>
      </div>

      {!history || history.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No prediction records saved in MongoDB yet. Click <strong>Generate Prediction</strong>{" "}
          above to save a new record.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Symbol</th>
                <th className="px-4 py-2.5">Target Date</th>
                <th className="px-4 py-2.5">Predicted Close</th>
                <th className="px-4 py-2.5">Market Direction</th>
                <th className="px-4 py-2.5">LR MAE</th>
                <th className="px-4 py-2.5">KNN Accuracy</th>
                <th className="px-4 py-2.5">Saved Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((item) => {
                const isUp = item.knnPrediction === "UP";
                const dateDisplay = item.createdAt
                  ? new Date(item.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—";

                return (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-foreground">
                      {item.symbol}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">
                      {item.predictionDate}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-primary">
                      {formatINR(item.predictedClose)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold",
                          isUp
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {item.knnPrediction}
                        {isUp ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownRight className="size-3" />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">
                      {item.linearRegressionMetrics?.mae
                        ? `₹${item.linearRegressionMetrics.mae}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.knnAccuracy !== undefined
                        ? `${(item.knnAccuracy * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{dateDisplay}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
