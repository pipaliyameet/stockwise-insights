import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Compass,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader, ErrorState, ChartSkeleton } from "@/components/common/StateViews";
import { PeriodSelector, StockSelector } from "@/components/common/Selectors";
import { ChartCard } from "@/components/common/ChartCard";
import {
  MovingAverageChart,
  PriceLineChart,
  VolumeChart,
  type PriceSeriesKey,
} from "@/components/charts/StockCharts";
import { DataQualityCard } from "@/components/cards/DataQualityCard";
import { ApiStatusCard } from "@/components/cards/ApiStatusCard";
import { useAppState } from "@/hooks/useAppState";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getStockData, getPrediction } from "@/services/api";
import { movingAverage, findStock } from "@/data/mockData";
import { formatCompact, formatINR, formatPercent, formatSigned } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockWise — Stock Market ML Analytics & Predictions" },
      {
        name: "description",
        content:
          "Real-time stock overview, price trends, Linear Regression next-day price forecast, and KNN market direction classification.",
      },
      { property: "og:title", content: "StockWise — Stock Market ML Analytics" },
      {
        property: "og:description",
        content: "Educational ML stock analytics with Linear Regression and KNN Classification.",
      },
    ],
  }),
  component: DashboardPage,
});

const TOGGLES: PriceSeriesKey[] = ["close", "open", "high", "low"];

function DashboardPage() {
  const { symbol, setSymbol, period, setPeriod, refreshKey } = useAppState();
  const [series, setSeries] = useState<PriceSeriesKey[]>(["close"]);

  const { data, loading, error, refetch } = useApiQuery(
    () => getStockData(symbol, period),
    [symbol, period, refreshKey],
  );

  const prediction = useApiQuery(() => getPrediction({ symbol }), [symbol, refreshKey]);

  const maSeries = useMemo(() => {
    if (!data?.candles?.length) return [];
    const ma = movingAverage(data.candles, 20);
    return data.candles.map((c, i) => ({ date: c.date, close: c.close, ma: ma[i]?.value ?? null }));
  }, [data]);

  const quote = data?.quote;
  const meta = findStock(symbol);
  const isUpToday = (quote?.change ?? 0) >= 0;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header Controls */}
      <PageHeader
        title="Dashboard"
        breadcrumb={["StockWise", "Dashboard"]}
        description={`Market overview and machine learning predictions for ${meta?.name || symbol}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StockSelector value={symbol} onChange={setSymbol} />
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
        }
      />

      {/* 1. Primary Stock Summary Hero Card */}
      {loading ? (
        <div className="panel p-5 space-y-4">
          <ChartSkeleton height={110} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : quote ? (
        <div className="panel p-4 sm:p-6 border border-border shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Ticker, Name, Sector */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {meta?.ticker || `${symbol}.NS`}
                </span>
                <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  NSE Equity
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {meta?.name || quote.name || symbol}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Sector: {meta?.sector || quote.sector}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" /> Last session: {quote.updatedAt}
                </span>
              </p>
            </div>

            {/* Right: Big Price, Change & Secondary metrics */}
            <div className="flex flex-wrap items-baseline gap-4 sm:gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Latest Close Price
                </p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    {formatINR(quote.price)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs sm:text-sm font-semibold",
                      isUpToday
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {isUpToday ? (
                      <ArrowUpRight className="size-3.5 sm:size-4" />
                    ) : (
                      <ArrowDownRight className="size-3.5 sm:size-4" />
                    )}
                    {formatSigned(quote.change)} ({formatPercent(quote.changePercent)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Quick Metrics Row */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 border-t border-border/60 pt-4">
            <div className="rounded-lg bg-muted/30 p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Day High
              </p>
              <p className="mt-1 font-mono text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(quote.dayHigh)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Day Low
              </p>
              <p className="mt-1 font-mono text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
                {formatINR(quote.dayLow)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Previous Close
              </p>
              <p className="mt-1 font-mono text-sm sm:text-base font-bold text-foreground">
                {formatINR(quote.previousClose)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Traded Volume
              </p>
              <p className="mt-1 font-mono text-sm sm:text-base font-bold text-foreground">
                {formatCompact(quote.volume)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Main Hero Stock Price Chart */}
      <ChartCard
        title={`${symbol} Historical Price Trend`}
        description={`Real chronological dataset (${period}) · default close price with optional open/high/low series`}
        exportData={data?.candles as unknown as Record<string, unknown>[] | undefined}
        exportName={`${symbol}-${period}-price-trend`}
        actions={
          <div className="flex flex-wrap gap-1">
            {TOGGLES.map((key) => {
              const active = series.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setSeries((prev) =>
                      prev.includes(key) ? prev.filter((k) => k !== key) || [] : [...prev, key],
                    )
                  }
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] font-mono font-medium capitalize transition-colors cursor-pointer",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {key}
                </button>
              );
            })}
          </div>
        }
      >
        {loading ? (
          <ChartSkeleton height={320} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data ? (
          <PriceLineChart
            data={data.candles}
            series={series.length ? series : ["close"]}
            height={320}
          />
        ) : null}
      </ChartCard>

      {/* 3. Core Machine Learning Predictions Section (Dual Models: Linear Regression & KNN) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Machine Learning Prediction (Next Trading Day)
            </h2>
          </div>
          <Link
            to="/prediction"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Prediction Workspace <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card A: Linear Regression Price Forecast */}
          <div className="panel p-4 sm:p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">Linear Regression</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Price Forecaster (Continuous Target)
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-mono font-bold text-primary">
                  Next-Day Close
                </span>
              </div>

              {prediction.loading ? (
                <div className="py-8">
                  <ChartSkeleton height={140} />
                </div>
              ) : prediction.error ? (
                <div className="py-4">
                  <ErrorState message={prediction.error} onRetry={prediction.refetch} />
                </div>
              ) : prediction.data ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Predicted Next-Day Close
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-3xl sm:text-4xl font-extrabold text-foreground">
                        {formatINR(prediction.data.linearRegression.predictedClose)}
                      </span>
                      {(() => {
                        const cur = prediction.data.lastClose ?? prediction.data.lastClosePrice;
                        const diff = prediction.data.linearRegression.predictedClose - cur;
                        const diffPct = cur ? (diff / cur) * 100 : 0;
                        const isUp = diff >= 0;
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 rounded px-2 py-0.5 font-mono text-xs font-bold",
                              isUp
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {isUp ? (
                              <ArrowUpRight className="size-3.5" />
                            ) : (
                              <ArrowDownRight className="size-3.5" />
                            )}
                            {formatSigned(diff)} ({formatPercent(diffPct)})
                          </span>
                        );
                      })()}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Base reference:{" "}
                      {formatINR(prediction.data.lastClose ?? prediction.data.lastClosePrice)} (
                      {prediction.data.lastTradingDate})
                    </p>
                  </div>

                  {/* Predicted OHLC Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Pred Open</p>
                      <p className="mt-0.5 font-mono font-semibold">
                        {formatINR(prediction.data.linearRegression.predictedOpen)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Pred High</p>
                      <p className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatINR(prediction.data.linearRegression.predictedHigh)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Pred Low</p>
                      <p className="mt-0.5 font-mono font-semibold text-rose-600 dark:text-rose-400">
                        {formatINR(prediction.data.linearRegression.predictedLow)}
                      </p>
                    </div>
                  </div>

                  {/* Evaluation Metrics */}
                  <div className="rounded-lg border border-border/80 bg-card/60 p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">MAE Error: </span>
                      <span className="font-mono font-bold">
                        ₹{prediction.data.linearRegression.metrics.mae}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RMSE: </span>
                      <span className="font-mono font-bold">
                        ₹{prediction.data.linearRegression.metrics.rmse}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">R² Score: </span>
                      <span className="font-mono font-bold text-primary">
                        {prediction.data.linearRegression.metrics.r2}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Model: Scikit-Learn LinearRegression</span>
              <span>80/20 Chronological Split</span>
            </div>
          </div>

          {/* Card B: KNN Market Direction Classification */}
          <div className="panel p-4 sm:p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Compass className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">KNN Classification</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Direction Predictor (K=5 Neighbors)
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-mono font-semibold text-muted-foreground">
                  UP / DOWN
                </span>
              </div>

              {prediction.loading ? (
                <div className="py-8">
                  <ChartSkeleton height={140} />
                </div>
              ) : prediction.error ? (
                <div className="py-4">
                  <ErrorState message={prediction.error} onRetry={prediction.refetch} />
                </div>
              ) : prediction.data ? (
                <div className="mt-4 space-y-4">
                  {/* Big Direction Badge */}
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4 transition-all",
                      prediction.data.knn.prediction === "UP"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold">
                        Predicted Market Direction
                      </p>
                      <p className="mt-0.5 text-xs opacity-90">
                        {prediction.data.knn.prediction === "UP"
                          ? "Model forecasts next close HIGHER than today."
                          : "Model forecasts next close LOWER than today."}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-3xl font-extrabold">
                      <span>{prediction.data.knn.prediction}</span>
                      {prediction.data.knn.prediction === "UP" ? (
                        <ArrowUpRight className="size-7" />
                      ) : (
                        <ArrowDownRight className="size-7" />
                      )}
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">KNN Test Set Accuracy</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {prediction.data.knn.accuracyPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, prediction.data.knn.accuracyPercentage)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Features (OHLCV) are normalized with{" "}
                      <code className="font-mono font-medium">StandardScaler</code> before Euclidean
                      distance calculation.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>K = 5 Neighbors</span>
              <span>Direction classification</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Secondary Analytical Charts (Moving Average & Trading Volume) */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="20-Day Simple Moving Average (SMA)"
          description="Closing price against its 20-day trendline for technical smoothing."
          exportData={maSeries as unknown as Record<string, unknown>[]}
          exportName={`${symbol}-ma20`}
        >
          {loading ? (
            <ChartSkeleton height={260} />
          ) : maSeries.length ? (
            <MovingAverageChart data={maSeries} window={20} height={260} />
          ) : null}
        </ChartCard>

        <ChartCard
          title="Daily Trading Volume"
          description="Traded shares per session coloured by session price movement."
          exportData={data?.candles as unknown as Record<string, unknown>[] | undefined}
          exportName={`${symbol}-volume`}
        >
          {loading ? (
            <ChartSkeleton height={260} />
          ) : data ? (
            <VolumeChart data={data.candles} height={260} />
          ) : null}
        </ChartCard>
      </div>

      {/* 5. System Health and Data Quality Overview */}
      <div className="grid gap-4 xl:grid-cols-2">
        <DataQualityCard />
        <ApiStatusCard />
      </div>
    </div>
  );
}
