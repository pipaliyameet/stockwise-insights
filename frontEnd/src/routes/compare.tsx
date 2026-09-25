import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ErrorState, ChartSkeleton } from "@/components/common/StateViews";
import { ChartCard } from "@/components/common/ChartCard";
import {
  NormalizedComparisonChart,
  ComparisonBarChart,
} from "@/components/charts/ComparisonCharts";
import { STOCKS, PERIODS } from "@/data/mockData";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getStockComparison } from "@/services/api";
import { formatCompact, formatINR, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Check, Plus, X, AlertCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Stocks — StockML Analytics" },
      {
        name: "description",
        content:
          "Compare up to five stocks by normalized return, price, volume and period performance.",
      },
      { property: "og:title", content: "Compare Stocks — StockML Analytics" },
      { property: "og:description", content: "Side-by-side comparison of Indian equities." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const [selected, setSelected] = useState<string[]>(["INFY", "TCS", "RELIANCE"]);
  const [period, setPeriod] = useState<string>("6M");
  const [customInput, setCustomInput] = useState<string>("");
  const [warning, setWarning] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApiQuery(
    () => getStockComparison(selected, period),
    [selected.join(","), period],
    { enabled: selected.length > 0 },
  );

  const toggle = (sym: string) => {
    setWarning(null);
    const cleanSym = sym.trim().toUpperCase();
    if (selected.includes(cleanSym)) {
      if (selected.length <= 1) {
        setWarning("Please keep at least one stock selected for comparison.");
        return;
      }
      setSelected((prev) => prev.filter((s) => s !== cleanSym));
    } else {
      if (selected.length >= 5) {
        setWarning("You can compare a maximum of 5 stocks at once. Please remove a stock first.");
        return;
      }
      setSelected((prev) => [...prev, cleanSym]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim().toUpperCase();
    if (!clean) return;
    if (selected.includes(clean)) {
      setWarning(`${clean} is already added to comparison.`);
      setCustomInput("");
      return;
    }
    if (selected.length >= 5) {
      setWarning("You can compare a maximum of 5 stocks at once. Please remove a stock first.");
      return;
    }
    setSelected((prev) => [...prev, clean]);
    setCustomInput("");
    setWarning(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Compare Stocks"
        breadcrumb={["Home", "Compare Stocks"]}
        description="Select up to five stocks to compare their normalized returns, latest market quotes, and trading volumes."
      />

      {/* Stock Selection & Controls */}
      <div className="panel space-y-3 sm:space-y-4 p-3.5 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Select Stocks to Compare
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] sm:text-xs font-mono font-medium text-primary">
              {selected.length} / 5 selected
            </span>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  period === p.value
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Warning banner */}
        {warning && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        {/* Preset Chips */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Equities (Click to Toggle)
          </p>
          <div className="flex flex-wrap gap-2">
            {STOCKS.map((s) => {
              const isSelected = selected.includes(s.symbol);
              return (
                <button
                  key={s.symbol}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(s.symbol)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold font-mono transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                      : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted",
                  )}
                >
                  {isSelected ? <Check className="size-3 stroke-[2.5]" /> : null}
                  {s.symbol}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add custom symbol input */}
        <form
          onSubmit={handleAddCustom}
          className="flex flex-wrap items-center gap-2 pt-1 border-t border-border"
        >
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
              placeholder="Add symbol (e.g. SBIN, WIPRO)..."
              className="font-mono text-xs uppercase h-9"
              disabled={selected.length >= 5}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            disabled={!customInput.trim() || selected.length >= 5}
            className="h-9 gap-1 text-xs"
          >
            <Plus className="size-3.5" /> Add Stock
          </Button>

          {/* Currently selected tags */}
          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            <span className="text-xs text-muted-foreground">Active:</span>
            {selected.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground border border-border"
              >
                {sym}
                <button
                  type="button"
                  onClick={() => toggle(sym)}
                  className="rounded-full hover:bg-foreground/10 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={`Remove ${sym}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </form>
      </div>

      {error ? <ErrorState message={error} onRetry={refetch} /> : null}

      <ChartCard
        title="Normalized Performance"
        description={`Percentage change from the start of the ${period} period.`}
      >
        {loading || !data ? (
          <ChartSkeleton />
        ) : (
          <NormalizedComparisonChart data={data.normalized} symbols={selected} />
        )}
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Latest Price" description="Most recent close for each selected stock.">
          {loading || !data ? (
            <ChartSkeleton />
          ) : (
            <ComparisonBarChart
              data={data.rows.map((r) => ({ symbol: r.symbol, price: r.price }))}
              dataKey="price"
              label="Price"
              formatter={(v) => formatINR(v)}
            />
          )}
        </ChartCard>
        <ChartCard title="Trading Volume" description="Latest session volume.">
          {loading || !data ? (
            <ChartSkeleton />
          ) : (
            <ComparisonBarChart data={data.volume} dataKey="volume" label="Volume" />
          )}
        </ChartCard>
      </div>

      <section className="panel overflow-x-auto p-4">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Change %</th>
              <th className="px-3 py-2 text-right">Period Return</th>
              <th className="px-3 py-2 text-right">High</th>
              <th className="px-3 py-2 text-right">Low</th>
              <th className="px-3 py-2 text-right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rows ?? []).map((r) => (
              <tr key={r.symbol} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-semibold font-mono text-primary">{r.symbol}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.name}</td>
                <td className="px-3 py-2 text-right num font-semibold">{formatINR(r.price)}</td>
                <td
                  className={cn(
                    "px-3 py-2 text-right num font-medium",
                    r.changePercent >= 0 ? "text-emerald-500" : "text-rose-500",
                  )}
                >
                  {formatPercent(r.changePercent)}
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right num font-medium",
                    r.periodReturn >= 0 ? "text-emerald-500" : "text-rose-500",
                  )}
                >
                  {formatPercent(r.periodReturn)}
                </td>
                <td className="px-3 py-2 text-right num">{formatINR(r.high)}</td>
                <td className="px-3 py-2 text-right num">{formatINR(r.low)}</td>
                <td className="px-3 py-2 text-right num">{formatCompact(r.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
