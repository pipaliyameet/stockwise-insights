import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ErrorState, ChartSkeleton } from "@/components/common/StateViews";
import { ChartCard } from "@/components/common/ChartCard";
import { ConfusionMatrix } from "@/components/charts/StatCharts";
import { ComparisonBarChart } from "@/components/charts/ComparisonCharts";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getModelPerformance } from "@/services/api";
import { TrendingUp, Compass, BarChart3, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/model-performance")({
  head: () => ({
    meta: [
      { title: "Model Performance — StockML Analytics" },
      {
        name: "description",
        content:
          "Evaluation metrics for Linear Regression (MAE, RMSE, R²) and KNN (Accuracy, Confusion Matrix).",
      },
      { property: "og:title", content: "Model Performance — StockML Analytics" },
      {
        property: "og:description",
        content: "Real evaluation metrics for Linear Regression and KNN on unseen test data.",
      },
    ],
  }),
  component: ModelPerformancePage,
});

function ModelPerformancePage() {
  const lrQuery = useApiQuery(() => getModelPerformance("linear_regression"), []);
  const knnQuery = useApiQuery(() => getModelPerformance("knn_classifier"), []);

  const loading = lrQuery.loading || knnQuery.loading;
  const error = lrQuery.error || knnQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Model Performance"
        breadcrumb={["Home", "Model Performance"]}
        description="Evaluation metrics for the two machine-learning models evaluated on an 80/20 chronological train-test split without data leakage."
      />

      {error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            void lrQuery.refetch();
            void knnQuery.refetch();
          }}
        />
      ) : loading || !lrQuery.data || !knnQuery.data ? (
        <ChartSkeleton height={320} />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Top Overview KPI Row */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
            <div className="panel p-3 sm:p-4 border border-border flex flex-col justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <TrendingUp className="size-3.5 text-primary shrink-0" /> LR Mean Error
              </p>
              <p className="mt-1 sm:mt-2 font-mono text-lg sm:text-2xl font-bold text-foreground truncate">
                {lrQuery.data.metrics["MAE (Mean Absolute Error)"]}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                Average price error in ₹
              </p>
            </div>

            <div className="panel p-3 sm:p-4 border border-border flex flex-col justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <TrendingUp className="size-3.5 text-primary shrink-0" /> LR R² Score
              </p>
              <p className="mt-1 sm:mt-2 font-mono text-lg sm:text-2xl font-bold text-primary truncate">
                {lrQuery.data.metrics["R² Score"]}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                Variance explained (0 to 1.0)
              </p>
            </div>

            <div className="panel p-3 sm:p-4 border border-border flex flex-col justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <Compass className="size-3.5 text-emerald-500 shrink-0" /> KNN Accuracy
              </p>
              <p className="mt-1 sm:mt-2 font-mono text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {knnQuery.data.metrics["Test Accuracy"]}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                Direction correctness
              </p>
            </div>

            <div className="panel p-3 sm:p-4 border border-border flex flex-col justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <Compass className="size-3.5 text-emerald-500 shrink-0" /> KNN Parameter
              </p>
              <p className="mt-1 sm:mt-2 font-mono text-lg sm:text-2xl font-bold text-foreground truncate">
                {knnQuery.data.metrics["K Parameter"]}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                StandardScaled distance
              </p>
            </div>
          </div>

          {/* Side by side Model Details */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Linear Regression Section */}
            <section className="panel p-5 border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold">{lrQuery.data.modelName}</h2>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Regression
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">Primary Target</dt>
                  <dd className="font-semibold mt-0.5">Tomorrow_Close Price</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">Train / Test Split</dt>
                  <dd className="font-semibold font-mono mt-0.5">80% / 20% (Chronological)</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">Root Mean Sq. Error</dt>
                  <dd className="font-semibold font-mono mt-0.5">{lrQuery.data.metrics["RMSE"]}</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">R² Score</dt>
                  <dd className="font-semibold font-mono text-primary mt-0.5">
                    {lrQuery.data.metrics["R² Score"]}
                  </dd>
                </div>
              </dl>

              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Input Features
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lrQuery.data.features.map((f) => (
                    <span key={f} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <ChartCard
                title="Regression Error Comparison"
                description="Comparison of MAE and RMSE error magnitudes."
              >
                <ComparisonBarChart
                  data={[
                    {
                      symbol: "MAE (₹)",
                      value:
                        Number(
                          String(lrQuery.data.metrics["MAE (Mean Absolute Error)"]).replace(
                            /[^0-9.]/g,
                            "",
                          ),
                        ) || 0,
                    },
                    {
                      symbol: "RMSE (₹)",
                      value:
                        Number(String(lrQuery.data.metrics["RMSE"]).replace(/[^0-9.]/g, "")) || 0,
                    },
                  ]}
                  dataKey="value"
                  label="Value in ₹"
                  formatter={(v) => `₹${v}`}
                />
              </ChartCard>
            </section>

            {/* KNN Classifier Section */}
            <section className="panel p-5 border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="size-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold">{knnQuery.data.modelName}</h2>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                  Binary Classification
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">Target Variable</dt>
                  <dd className="font-semibold mt-0.5">Direction (UP / DOWN)</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">Neighbors (K)</dt>
                  <dd className="font-semibold font-mono mt-0.5">5 Neighbors</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">Test Accuracy</dt>
                  <dd className="font-semibold font-mono text-emerald-500 mt-0.5">
                    {knnQuery.data.metrics["Test Accuracy"]}
                  </dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <dt className="text-muted-foreground">Pre-Scaler</dt>
                  <dd className="font-semibold mt-0.5">StandardScaler</dd>
                </div>
              </dl>

              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Input Features
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {knnQuery.data.features.map((f) => (
                    <span key={f} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {knnQuery.data.confusionMatrix ? (
                <ChartCard
                  title="Confusion Matrix (UP / DOWN)"
                  description="True positive, true negative, false positive, and false negative test predictions."
                >
                  <ConfusionMatrix matrix={knnQuery.data.confusionMatrix} />
                </ChartCard>
              ) : null}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
