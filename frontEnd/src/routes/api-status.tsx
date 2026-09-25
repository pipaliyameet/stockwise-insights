import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/StateViews";
import { ApiStatusCard } from "@/components/cards/ApiStatusCard";
import { API_BASE_URL } from "@/services/api";

export const Route = createFileRoute("/api-status")({
  head: () => ({
    meta: [
      { title: "API Status — StockML Analytics" },
      {
        name: "description",
        content: "Connection state of the Express API, Python ML engine, MongoDB, and datasets.",
      },
      { property: "og:title", content: "API Status — StockML Analytics" },
      {
        property: "og:description",
        content: "Health overview of the prediction backend services.",
      },
    ],
  }),
  component: ApiStatusPage,
});

function ApiStatusPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="API Status"
        breadcrumb={["Home", "API Status"]}
        description="Health and connectivity state of the full-stack Machine Learning architecture."
      />
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <ApiStatusCard />
        <section className="panel p-4 sm:p-5 border border-border space-y-4">
          <h2 className="text-sm font-semibold">Architecture &amp; Endpoints</h2>
          <dl className="space-y-2 text-xs divide-y divide-border">
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">API Mode</dt>
              <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                Live Real Backend
              </dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">Express API Server</dt>
              <dd className="font-mono">{API_BASE_URL}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">Python ML Microservice</dt>
              <dd className="font-mono">http://localhost:5001 (Flask / scikit-learn)</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">Database</dt>
              <dd className="font-mono">mongodb://localhost:27017/stock_ml</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">MongoDB Collection</dt>
              <dd className="font-mono">predictions</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">ML Algorithms</dt>
              <dd className="font-medium">Linear Regression + KNN (K=5)</dd>
            </div>
          </dl>
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            All predictions and data streams are executed live through the Python scikit-learn
            engine and logged into MongoDB.
          </div>
        </section>
      </div>
    </div>
  );
}
