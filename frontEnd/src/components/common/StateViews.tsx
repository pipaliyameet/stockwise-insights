import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string | undefined;
  breadcrumb?: string[] | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb?.length ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-0.5 flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground"
          >
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                <span
                  className={
                    i === breadcrumb.length - 1 ? "text-foreground font-medium" : undefined
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-0.5 max-w-2xl text-xs sm:text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 sm:pt-0">{actions}</div>
      ) : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-danger/40 bg-danger-soft/50 px-4 py-8 sm:px-6 sm:py-10 text-center",
        className,
      )}
    >
      <AlertTriangle className="size-5 sm:size-6 text-danger" aria-hidden />
      <div>
        <p className="text-xs sm:text-sm font-medium text-foreground">{message}</p>
        <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">
          If this keeps happening, check the ML API status page.
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="h-8 text-xs">
          <RotateCw className="size-3.5" /> Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 sm:px-6 sm:py-12 text-center",
        className,
      )}
    >
      <Inbox className="size-5 sm:size-6 text-muted-foreground" aria-hidden />
      <p className="text-xs sm:text-sm font-medium">{title}</p>
      {description ? (
        <p className="max-w-sm text-[11px] sm:text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="space-y-3" style={{ minHeight: height }}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="w-full rounded-lg" style={{ height: height - 40 }} />
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel p-3 sm:p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-5 sm:h-6 w-24" />
          <Skeleton className="mt-2 h-2.5 w-14" />
        </div>
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DemoBadge({ label = "Demo data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
      <span className="size-1.5 rounded-full bg-warning" aria-hidden />
      {label}
    </span>
  );
}
