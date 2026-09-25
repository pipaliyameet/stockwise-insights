import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Download, RefreshCw } from "lucide-react";
import { PageHeader, ErrorState, EmptyState, TableSkeleton } from "@/components/common/StateViews";
import { StockSelector } from "@/components/common/Selectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/hooks/useAppState";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getHistoricalData } from "@/services/api";
import type { Candle } from "@/data/mockData";
import {
  downloadFile,
  formatCompact,
  formatDate,
  formatINR,
  formatNumber,
  toCsv,
} from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/historical-data")({
  head: () => ({
    meta: [
      { title: "Historical Data — StockML Analytics" },
      {
        name: "description",
        content:
          "Searchable, sortable and paginated OHLCV dataset with CSV export and summary statistics.",
      },
      { property: "og:title", content: "Historical Data — StockML Analytics" },
      {
        property: "og:description",
        content: "Inspect the raw OHLCV dataset used for model training.",
      },
    ],
  }),
  component: HistoricalDataPage,
});

const COLUMNS: { key: keyof Candle; label: string; numeric: boolean }[] = [
  { key: "date", label: "Date", numeric: false },
  { key: "open", label: "Open", numeric: true },
  { key: "high", label: "High", numeric: true },
  { key: "low", label: "Low", numeric: true },
  { key: "close", label: "Close", numeric: true },
  { key: "volume", label: "Volume", numeric: true },
];

function HistoricalDataPage() {
  const { symbol, setSymbol, refreshKey } = useAppState();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<keyof Candle>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, loading, error, refetch } = useApiQuery(
    () =>
      getHistoricalData({
        symbol,
        period: "1Y",
        page,
        pageSize,
        sortBy,
        sortDir,
        search,
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }),
    [symbol, page, pageSize, sortBy, sortDir, search, from, to, refreshKey],
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const toggleSort = (key: keyof Candle) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const exportCsv = () => {
    if (!data?.rows.length) {
      toast.error("Nothing to export", { description: "The current filter returned no rows." });
      return;
    }
    downloadFile(
      toCsv(data.rows as unknown as Record<string, unknown>[]),
      `${symbol}-historical.csv`,
    );
    toast.success("CSV export started");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Data"
        breadcrumb={["Home", "Historical Data"]}
        description="The cleaned OHLCV dataset. Pagination is API-shaped so backend paging can be enabled without UI changes."
        actions={
          <>
            <StockSelector value={symbol} onChange={setSymbol} />
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="size-4" /> Refresh
            </Button>
            <Button onClick={exportCsv}>
              <Download className="size-4" /> Export CSV
            </Button>
          </>
        }
      />

      {data ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Total Records", value: formatNumber(data.summary.totalRecords, 0) },
            { label: "Date Range", value: data.summary.dateRange },
            { label: "Highest Close", value: formatINR(data.summary.highestClose) },
            { label: "Lowest Close", value: formatINR(data.summary.lowestClose) },
            { label: "Average Close", value: formatINR(data.summary.averageClose) },
            { label: "Average Volume", value: formatCompact(data.summary.averageVolume) },
          ].map((s) => (
            <div key={s.label} className="panel p-3 sm:p-4 flex flex-col justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {s.label}
              </p>
              <p
                className="mt-1 truncate text-xs sm:text-sm font-semibold num text-foreground"
                title={s.value}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <section className="panel">
        <div className="grid gap-2.5 sm:gap-3 border-b border-border p-3 sm:p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search any value…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from">From date</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To date</Label>
            <Input
              id="to"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rows per page</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : !data?.rows.length ? (
            <EmptyState
              title="No records found"
              description="Try clearing the search box or widening the date range."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {COLUMNS.map((c) => (
                      <th
                        key={c.key}
                        scope="col"
                        className={c.numeric ? "px-3 py-2 text-right" : "px-3 py-2"}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                        >
                          {c.label}
                          {sortBy === c.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : null}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr
                      key={r.date}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-3 py-2 num">{formatDate(r.date)}</td>
                      <td className="px-3 py-2 text-right num">{formatINR(r.open)}</td>
                      <td className="px-3 py-2 text-right num">{formatINR(r.high)}</td>
                      <td className="px-3 py-2 text-right num">{formatINR(r.low)}</td>
                      <td className="px-3 py-2 text-right num font-medium">{formatINR(r.close)}</td>
                      <td className="px-3 py-2 text-right num">{formatCompact(r.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data?.rows.length ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span className="num">
              Page {data.page} of {totalPages} · {formatNumber(data.total, 0)} records
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
