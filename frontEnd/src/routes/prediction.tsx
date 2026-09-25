import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, ErrorState, EmptyState, ChartSkeleton } from "@/components/common/StateViews";
import { PredictionForm } from "@/components/prediction/PredictionForm";
import {
  PredictionDisclaimer,
  LinearRegressionCard,
  KnnDirectionCard,
  ModelPerformanceSummaryCard,
  HistoricalPredictionChart,
  PredictionHistoryTable,
} from "@/components/prediction/PredictionResult";
import { useAppState } from "@/hooks/useAppState";
import { useApiAction, useApiQuery } from "@/hooks/useApiQuery";
import { getPrediction, getPredictionHistory, type RealPredictionData } from "@/services/api";
import { BrainCircuit, Database, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "Stock Price Prediction — StockWise" },
      {
        name: "description",
        content:
          "Predict next trading day stock price with Linear Regression and market direction with KNN Classification.",
      },
      { property: "og:title", content: "Stock Price Prediction — StockWise" },
      {
        property: "og:description",
        content:
          "Machine-learning prediction workspace for Indian equities using Linear Regression and KNN.",
      },
    ],
  }),
  component: PredictionPage,
});

function PredictionPage() {
  const { symbol, setSymbol, refreshKey } = useAppState();
  const [currentResult, setCurrentResult] = useState<RealPredictionData | null>(null);

  // Prediction action
  const predictionAction = useApiAction(async (targetSymbol: string) => {
    return await getPrediction({ symbol: targetSymbol });
  });

  // Prediction history from MongoDB
  const historyQuery = useApiQuery(() => getPredictionHistory(), [refreshKey]);

  const handleGenerate = async (targetSymbol: string) => {
    const sym = targetSymbol || symbol;
    const res = await predictionAction.execute(sym);
    if (res) {
      setCurrentResult(res);
      toast.success(`Prediction generated for ${res.symbol}`, {
        description: `Predicted Close: ₹${res.linearRegression.predictedClose} · Direction: ${res.knn.prediction}`,
      });
      // Refresh MongoDB history list
      void historyQuery.refetch();
    }
  };

  const handleReset = () => {
    setCurrentResult(null);
    predictionAction.reset();
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Stock Price & Direction Prediction"
        breadcrumb={["StockWise", "Prediction"]}
        description="Forecast next trading day continuous price (Linear Regression) and UP/DOWN market direction (KNN Classification)."
      />

      <PredictionDisclaimer />

      <PredictionForm
        symbol={symbol}
        onSymbolChange={setSymbol}
        loading={predictionAction.loading}
        onSubmit={(sym) => void handleGenerate(sym)}
        onReset={handleReset}
      />

      {predictionAction.loading ? (
        <div className="panel p-5 sm:p-6 space-y-4 border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 text-primary animate-spin" />
            <div>
              <p className="text-sm font-bold text-foreground">
                Analyzing {symbol.toUpperCase()} with Scikit-Learn Pipeline...
              </p>
              <p className="text-xs text-muted-foreground">
                Running real dual-model evaluation (Multiple Linear Regression + K-Nearest
                Neighbors).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                1
              </span>
              <span className="text-muted-foreground">Load CSV / NSE Data</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                2
              </span>
              <span className="text-muted-foreground">80/20 Time Split</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                3
              </span>
              <span className="text-muted-foreground">Linear Regression</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                4
              </span>
              <span className="text-muted-foreground">KNN Classifier (K=5)</span>
            </div>
          </div>

          <div className="pt-2">
            <ChartSkeleton height={200} />
          </div>
        </div>
      ) : predictionAction.error ? (
        <ErrorState message={predictionAction.error} onRetry={() => void handleGenerate(symbol)} />
      ) : currentResult ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <LinearRegressionCard data={currentResult} />
            <KnnDirectionCard knn={currentResult.knn} />
          </div>

          <ModelPerformanceSummaryCard data={currentResult} />

          <HistoricalPredictionChart data={currentResult} />

          <PredictionHistoryTable
            history={historyQuery.data ?? []}
            loading={historyQuery.loading}
            onRefresh={() => void historyQuery.refetch()}
          />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <EmptyState
            title="No prediction run in this session"
            description="Select or type a stock symbol above (e.g. TCS, INFY, RELIANCE) and click Generate Prediction to execute the ML models."
          />

          <PredictionHistoryTable
            history={historyQuery.data ?? []}
            loading={historyQuery.loading}
            onRefresh={() => void historyQuery.refetch()}
          />
        </div>
      )}
    </div>
  );
}
