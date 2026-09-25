import { CheckCircle2, XCircle } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getDataQuality } from "@/services/api";
import { ErrorState } from "@/components/common/StateViews";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/utils/format";

export function DataQualityCard() {
  const { symbol, period, refreshKey } = useAppState();
  const { data, loading, error, refetch } = useApiQuery(
    () => getDataQuality(symbol, period),
    [symbol, period, refreshKey],
  );

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold">Data Quality</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Preprocessing checks applied to the {symbol} dataset.
      </p>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-4" message={error} onRetry={refetch} />
      ) : data ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Total Rows", value: formatNumber(data.totalRows, 0) },
              { label: "Total Columns", value: String(data.totalColumns) },
              { label: "Missing Values", value: String(data.missingValues) },
              { label: "Duplicate Rows", value: String(data.duplicateRows) },
              { label: "Numeric Columns", value: String(data.numericColumns) },
              { label: "Date Range", value: data.dateRange },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border p-3">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold num" title={item.value}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="mt-4 space-y-1.5">
            {data.checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-sm">
                {c.passed ? (
                  <CheckCircle2 className="size-4 text-success" aria-hidden />
                ) : (
                  <XCircle className="size-4 text-danger" aria-hidden />
                )}
                {c.label}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
