import { useApiQuery } from "@/hooks/useApiQuery";
import { getApiStatus } from "@/services/api";
import { ErrorState } from "@/components/common/StateViews";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ApiStatusCard({ compact = false }: { compact?: boolean }) {
  const { data, loading, error, refetch } = useApiQuery(() => getApiStatus(), []);

  return (
    <section className="panel p-5 border border-border">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Service Health</h2>
        {data && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-md",
              data.connected
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            )}
          >
            {data.connected ? "All Services Active" : "Service Degraded"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-4" message={error} onRetry={refetch} />
      ) : data ? (
        <ul className="mt-3 divide-y divide-border text-xs">
          {data.services.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium text-foreground">{s.name}</span>
              <span className="flex items-center gap-2 font-medium">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    s.status === "online"
                      ? "bg-emerald-500"
                      : s.status === "degraded"
                        ? "bg-amber-500"
                        : "bg-rose-500",
                  )}
                  aria-hidden
                />
                <span className="text-muted-foreground">
                  {compact ? (s.status === "online" ? "Online" : "Offline") : s.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
