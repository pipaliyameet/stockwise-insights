import { Play, Loader2, Sparkles, TrendingUp, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StockSelector } from "@/components/common/Selectors";

export const POPULAR_STOCKS = ["TCS", "INFY", "RELIANCE", "HDFCBANK", "ITC", "SBIN"] as const;

export function PredictionForm({
  symbol,
  onSymbolChange,
  loading,
  onSubmit,
  onReset,
}: {
  symbol: string;
  onSymbolChange: (s: string) => void;
  loading: boolean;
  onSubmit: (symbol: string) => void;
  onReset: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSubmit(symbol.trim().toUpperCase());
    }
  };

  const handleSelectPopular = (s: string) => {
    onSymbolChange(s);
  };

  return (
    <form className="panel space-y-5 p-5 shadow-sm" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Stock Price &amp; Direction Prediction
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Target: <span className="font-semibold text-foreground">Next Trading Day</span> ·
            Automatically runs <span className="font-semibold text-primary">Linear Regression</span>{" "}
            (Price Forecast) +{" "}
            <span className="font-semibold text-emerald-500">KNN Classifier</span> (UP/DOWN
            Direction).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <TrendingUp className="size-3" /> Linear Regression
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
            <Compass className="size-3" /> KNN (K=5)
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="symbol-input"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Enter Stock Symbol
          </Label>
          <Input
            id="symbol-input"
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
            placeholder="e.g. TCS, INFY, RELIANCE"
            className="font-mono uppercase font-semibold text-base h-11"
            disabled={loading}
          />
          <p className="text-[11px] text-muted-foreground">
            Indian NSE symbols automatically append{" "}
            <code className="font-mono text-primary font-semibold">.NS</code> (e.g. TCS → TCS.NS).
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Or Choose from Preset Stocks
          </Label>
          <StockSelector value={symbol} onChange={onSymbolChange} className="w-full h-11" />
          <p className="text-[11px] text-muted-foreground">
            Select a verified company from our historical dataset repository.
          </p>
        </div>
      </div>

      {/* Popular stock chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-muted-foreground">Popular:</span>
        {POPULAR_STOCKS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleSelectPopular(item)}
            className={`rounded-lg border px-3 py-1 text-xs font-mono font-semibold transition-all ${
              symbol.toUpperCase() === item
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={loading || !symbol.trim()}
          className="h-11 px-6 font-semibold"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          {loading ? "Training & Predicting..." : "Generate Prediction"}
        </Button>
        <Button type="button" variant="ghost" onClick={onReset} disabled={loading} className="h-11">
          Clear
        </Button>
      </div>
    </form>
  );
}
