import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  change,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: string | undefined;
  change?: number | null | undefined;
  icon?: ReactNode | undefined;
  tone?: "neutral" | "up" | "down";
}) {
  const resolvedTone =
    change === undefined || change === null
      ? tone
      : change > 0
        ? "up"
        : change < 0
          ? "down"
          : "neutral";
  const Icon =
    resolvedTone === "up" ? ArrowUpRight : resolvedTone === "down" ? ArrowDownRight : Minus;

  return (
    <div className="panel p-3 sm:p-4 transition-all hover:border-primary/40 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </p>
        {icon ? (
          <span className="text-muted-foreground shrink-0 [&>svg]:size-3.5 sm:[&>svg]:size-4">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-1 sm:mt-1.5 text-lg sm:text-xl md:text-2xl font-bold num tracking-tight text-foreground truncate">
        {value}
      </p>
      <div className="mt-1 sm:mt-1.5 flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
        {change !== undefined && change !== null ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold num text-[10px] sm:text-xs shrink-0",
              resolvedTone === "up" && "bg-success-soft text-success",
              resolvedTone === "down" && "bg-danger-soft text-danger",
              resolvedTone === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-2.5 sm:size-3" aria-hidden />
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        ) : null}
        {hint ? (
          <span className="truncate text-[10px] sm:text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
