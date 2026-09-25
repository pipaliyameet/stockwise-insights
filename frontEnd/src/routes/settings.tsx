import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/StateViews";
import { StockSelector, PeriodSelector } from "@/components/common/Selectors";
import { useAppState } from "@/hooks/useAppState";
import { API_BASE_URL, IS_BACKEND_CONNECTED } from "@/services/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StockML Analytics" },
      {
        name: "description",
        content:
          "Default stock, default period and API connection preferences for the analysis workspace.",
      },
      { property: "og:title", content: "Settings — StockML Analytics" },
      {
        property: "og:description",
        content: "Configure workspace defaults and backend connection.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { symbol, setSymbol, period, setPeriod } = useAppState();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        breadcrumb={["Home", "Settings"]}
        description="Workspace defaults applied across every page."
      />
      <section className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Default stock</p>
            <p className="text-xs text-muted-foreground">
              Used when a page loads without an explicit selection.
            </p>
          </div>
          <StockSelector value={symbol} onChange={setSymbol} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium">Default period</p>
            <p className="text-xs text-muted-foreground">
              Time window applied to charts and tables.
            </p>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium">Backend API</p>
            <p className="text-xs text-muted-foreground num">
              {API_BASE_URL || "VITE_API_BASE_URL not configured"}
            </p>
          </div>
          <span className="text-xs font-medium">
            {IS_BACKEND_CONNECTED ? "Connected" : "Demo data mode"}
          </span>
        </div>
      </section>
    </div>
  );
}
