import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, ErrorState, ChartSkeleton, KpiSkeleton } from "@/components/common/StateViews";
import { PeriodSelector, StockSelector } from "@/components/common/Selectors";
import { KpiCard } from "@/components/cards/KpiCard";
import { ChartCard } from "@/components/common/ChartCard";
import {
  MovingAverageChart,
  OhlcChart,
  PriceLineChart,
  VolumeChart,
} from "@/components/charts/StockCharts";
import { useAppState } from "@/hooks/useAppState";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getStockData } from "@/services/api";
import { movingAverage } from "@/data/mockData";
import { formatCompact, formatINR, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stock-analysis")({
  head: () => ({
    meta: [
      { title: "Stock Analysis — StockML Analytics" },
      {
        name: "description",
        content:
          "Closing and opening price trends, OHLC comparison, volume and moving averages for the selected stock.",
      },
      { property: "og:title", content: "Stock Analysis — StockML Analytics" },
      {
        property: "og:description",
        content: "Detailed exploratory analysis charts for Indian equities.",
      },
    ],
  }),
  component: StockAnalysisPage,
});

const MA_WINDOWS = [7, 20, 50, 100, 200];

function StockAnalysisPage() {
  const { symbol, setSymbol, period, setPeriod, refreshKey } = useAppState();
  const [maWindow, setMaWindow] = useState(20);
  const { data, loading, error, refetch } = useApiQuery(
    () => getStockData(symbol, period),
    [symbol, period, refreshKey],
  );

  const maSeries = useMemo(() => {
    if (!data) return [];
    const ma = movingAverage(data.candles, maWindow);
    return data.candles.map((c, i) => ({ date: c.date, close: c.close, ma: ma[i]?.value ?? null }));
  }, [data, maWindow]);

  const quote = data?.quote;
  const rows = data?.candles as unknown as Record<string, unknown>[] | undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={quote ? `${quote.ticker}` : symbol}
        breadcrumb={["Home", "Stock Analysis"]}
        description={quote ? `${quote.name} · ${quote.sector}` : "Loading stock details…"}
        actions={
          <>
            <StockSelector value={symbol} onChange={setSymbol} />
            <PeriodSelector value={period} onChange={setPeriod} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-5">
        {loading ? (
          <KpiSkeleton count={5} />
        ) : error ? (
          <ErrorState
            className="col-span-2 sm:col-span-2 xl:col-span-5"
            message={error}
            onRetry={refetch}
          />
        ) : quote ? (
          <>
            <KpiCard
              label="Current Price"
              value={formatINR(quote.price)}
              change={quote.changePercent}
            />
            <KpiCard label="Change" value={formatINR(quote.change)} change={quote.changePercent} />
            <KpiCard
              label="Change %"
              value={formatPercent(quote.changePercent)}
              change={quote.changePercent}
            />
            <KpiCard label="Volume" value={formatCompact(quote.volume)} hint="latest session" />
            <KpiCard
              label="Period"
              value={period}
              hint={`${data?.candles.length ?? 0} trading days`}
            />
          </>
        ) : null}
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        <ChartCard
          title="A. Closing Price Over Time"
          description="Daily close for the selected period."
          exportData={rows}
          exportName={`${symbol}-close`}
        >
          {loading ? (
            <ChartSkeleton />
          ) : data ? (
            <PriceLineChart data={data.candles} series={["close"]} />
          ) : null}
        </ChartCard>
        <ChartCard
          title="B. Opening Price Over Time"
          description="Daily open for the selected period."
          exportData={rows}
          exportName={`${symbol}-open`}
        >
          {loading ? (
            <ChartSkeleton />
          ) : data ? (
            <PriceLineChart data={data.candles} series={["open"]} />
          ) : null}
        </ChartCard>
        <ChartCard
          title="C. Open / High / Low / Close"
          description="All four price columns on one axis."
          exportData={rows}
          exportName={`${symbol}-ohlc`}
        >
          {loading ? <ChartSkeleton /> : data ? <OhlcChart data={data.candles} /> : null}
        </ChartCard>
        <ChartCard
          title="D. Volume Over Time"
          description="Traded quantity per session."
          exportData={rows}
          exportName={`${symbol}-volume`}
        >
          {loading ? <ChartSkeleton /> : data ? <VolumeChart data={data.candles} /> : null}
        </ChartCard>
      </div>

      <ChartCard
        title="E. Moving Average"
        description="Simple moving average overlaid on the closing price. Window values will come from the backend indicator endpoint."
        exportData={maSeries as unknown as Record<string, unknown>[]}
        exportName={`${symbol}-ma${maWindow}`}
        actions={
          <div className="flex flex-wrap gap-1">
            {MA_WINDOWS.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={maWindow === w}
                onClick={() => setMaWindow(w)}
                className={cn(
                  "rounded-md border px-2 py-1 text-[11px] font-medium num transition-colors",
                  maWindow === w
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {w}D
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <ChartSkeleton />
        ) : maSeries.length ? (
          <MovingAverageChart data={maSeries} window={maWindow} />
        ) : null}
      </ChartCard>
    </div>
  );
}
