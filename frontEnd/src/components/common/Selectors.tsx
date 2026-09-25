import { STOCKS, PERIODS } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function StockSelector({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string | undefined;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[220px]", className)} aria-label="Select stock">
        <SelectValue placeholder="Select stock" />
      </SelectTrigger>
      <SelectContent>
        {STOCKS.map((s) => (
          <SelectItem key={s.symbol} value={s.symbol}>
            <span className="font-medium">{s.symbol}</span>
            <span className="ml-2 text-xs text-muted-foreground">{s.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PeriodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1"
      role="group"
      aria-label="Select time period"
    >
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          aria-pressed={value === p.value}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            value === p.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {p.value}
        </button>
      ))}
    </div>
  );
}
