import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ErrorState, ChartSkeleton } from "@/components/common/StateViews";
import { PeriodSelector, StockSelector } from "@/components/common/Selectors";
import { ChartCard } from "@/components/common/ChartCard";
import { CloseHistogram, MovingAverageChart, VolumeChart } from "@/components/charts/StockCharts";
import { BoxPlot, CorrelationHeatmap } from "@/components/charts/StatCharts";
import { ComparisonBarChart } from "@/components/charts/ComparisonCharts";
import { useAppState } from "@/hooks/useAppState";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getVisualizationData } from "@/services/api";
import { formatINR } from "@/utils/format";

export const Route = createFileRoute("/visualizations")({
  head: () => ({
    meta: [
      { title: "Visualizations — StockML Analytics" },
      {
        name: "description",
        content:
          "Exploratory data analysis: distributions, box plots, correlation heatmap, moving averages and volume.",
      },
      { property: "og:title", content: "Visualizations — StockML Analytics" },
      { property: "og:description", content: "EDA charts for the stock dataset." },
    ],
  }),
  component: VisualizationsPage,
});

function VisualizationsPage() {
  const { symbol, setSymbol, period, setPeriod, refreshKey } = useAppState();
  const { data, loading, error, refetch } = useApiQuery(
    () => getVisualizationData(symbol, period),
    [symbol, period, refreshKey],
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Visualizations"
        breadcrumb={["Home", "Visualizations"]}
        description="Exploratory data analysis of the dataset used for model training."
        actions={
          <>
            <StockSelector value={symbol} onChange={setSymbol} />
            <PeriodSelector value={period} onChange={setPeriod} />
          </>
        }
      />

      {error ? <ErrorState message={error} onRetry={refetch} /> : null}

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        <ChartCard
          title="Closing Price Distribution"
          description="Histogram of closing prices across the period."
        >
          {loading || !data ? <ChartSkeleton /> : <CloseHistogram data={data.closeHistogram} />}
        </ChartCard>
        <ChartCard
          title="Price Spread (Box Plot)"
          description="Quartiles and outliers for open, high, low and close."
        >
          {loading || !data ? <ChartSkeleton /> : <BoxPlot data={data.box} />}
        </ChartCard>
        <ChartCard title="Average Prices" description="Mean value of each price column.">
          {loading || !data ? (
            <ChartSkeleton />
          ) : (
            <ComparisonBarChart
              data={data.averages.map((a) => ({ symbol: a.label, value: a.value }))}
              dataKey="value"
              label="Average"
              formatter={(v) => formatINR(v)}
            />
          )}
        </ChartCard>
        <ChartCard title="Volume Over Time" description="Traded quantity per session.">
          {loading || !data ? <ChartSkeleton /> : <VolumeChart data={data.candles} />}
        </ChartCard>
      </div>

      <ChartCard
        title="Moving Average Overlay"
        description="Closing price with its 20-day simple moving average."
      >
        {loading || !data ? (
          <ChartSkeleton />
        ) : (
          <MovingAverageChart data={data.movingAverage} window={20} />
        )}
      </ChartCard>

      <ChartCard
        title="Feature Correlation Heatmap"
        description="Pearson correlation between OHLCV columns."
      >
        {loading || !data ? <ChartSkeleton /> : <CorrelationHeatmap data={data.correlation} />}
      </ChartCard>
    </div>
  );
}
