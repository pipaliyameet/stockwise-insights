import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/StateViews";
import {
  BrainCircuit,
  Database,
  Server,
  Code2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Compass,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project — StockWise ML" },
      {
        name: "description",
        content:
          "Project overview, machine-learning workflow, technology stack and academic disclaimer for the StockWise ML prediction system.",
      },
      { property: "og:title", content: "About the Project — StockWise ML" },
      {
        property: "og:description",
        content: "Architecture and models of the StockWise Machine Learning system.",
      },
    ],
  }),
  component: AboutPage,
});

const WORKFLOW = [
  {
    step: "1. Historical Data Ingestion",
    detail:
      "Daily OHLCV market candles for NSE equities (TCS, INFY, RELIANCE, HDFCBANK, ITC, SBIN) loaded from CSV and market streams.",
  },
  {
    step: "2. Data Preprocessing & Cleaning",
    detail:
      "Null-value handling, date sorting, type parsing, and target variable alignment (Tomorrow_Close & Tomorrow_Direction).",
  },
  {
    step: "3. Chronological 80/20 Train/Test Split",
    detail: "Splits historical series sequentially in time without lookahead bias or data leakage.",
  },
  {
    step: "4. Multiple Linear Regression Training",
    detail:
      "Trains continuous price regressor using Open, High, Low, Close, and Volume features to forecast next trading day close.",
  },
  {
    step: "5. KNN Classification (K=5) Training",
    detail:
      "Normalizes features using StandardScaler and classifies binary next-day market direction (UP if Tomorrow_Close > Close, else DOWN).",
  },
  {
    step: "6. Model Evaluation & MongoDB Persistence",
    detail:
      "Calculates MAE, RMSE, R² for regression and test accuracy / confusion matrix for KNN. Results logged to MongoDB.",
  },
];

const STACK = [
  {
    group: "Frontend Web Application",
    icon: Code2,
    items: [
      "React 19 + TypeScript",
      "Vite Bundler",
      "TanStack Router & Query",
      "Tailwind CSS v4",
      "Recharts Visualizations",
      "Lucide Icons",
    ],
  },
  {
    group: "Backend REST Gateway",
    icon: Server,
    items: [
      "Node.js + Express.js",
      "CORS Middleware",
      "Dotenv Config",
      "Axios Microservice Bridge",
    ],
  },
  {
    group: "Machine Learning Microservice",
    icon: BrainCircuit,
    items: [
      "Python 3 (Flask)",
      "Scikit-Learn (LinearRegression, KNeighborsClassifier)",
      "Pandas & NumPy",
      "StandardScaler Feature Normalization",
    ],
  },
  {
    group: "Database & Storage",
    icon: Database,
    items: [
      "MongoDB Atlas / Local MongoDB",
      "Mongoose ODM",
      "Prediction History Schema",
      "Persistent Logging",
    ],
  },
];

function AboutPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="About the Project"
        breadcrumb={["StockWise", "About"]}
        description="Stock Market Price Prediction & Market Direction Analysis — Full-Stack ML Academic Project."
      />

      {/* Project Overview */}
      <section className="panel p-5 sm:p-6 border border-border shadow-xs space-y-3">
        <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
          <CheckCircle2 className="size-4 text-primary" />
          Project Overview
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>StockWise</strong> is an educational Machine Learning web application designed to
          demonstrate the practical application of classical machine learning algorithms on
          financial equity datasets. It bridges real historical market data with a live Python{" "}
          <code className="font-mono text-primary">scikit-learn</code> microservice and Node/Express
          backend to predict next-trading-day outcomes.
        </p>
      </section>

      {/* Dual Model Architecture Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5 border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="size-5" />
            <h3 className="text-sm font-bold text-foreground">
              1. Multiple Linear Regression (Price Forecaster)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Role:</strong> Continuous numerical regression. Fits an optimal hyperplane
            through multidimensional input features (Open, High, Low, Close, Volume) to estimate
            tomorrow's exact closing price.
          </p>
          <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
            <p>
              <strong>Target Variable:</strong>{" "}
              <code className="font-mono text-primary">Tomorrow_Close</code> (₹)
            </p>
            <p>
              <strong>Evaluation Metrics:</strong> Mean Absolute Error (MAE), Root Mean Squared
              Error (RMSE), R² Determination Score.
            </p>
          </div>
        </div>

        <div className="panel p-5 border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-500">
            <Compass className="size-5" />
            <h3 className="text-sm font-bold text-foreground">
              2. K-Nearest Neighbors Classifier (Direction Predictor)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Role:</strong> Binary classification. Uses the{" "}
            <code className="font-mono">K=5</code> nearest Euclidean neighbors in feature space to
            classify whether tomorrow's session will close higher (UP) or lower (DOWN).
          </p>
          <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
            <p>
              <strong>Target Variable:</strong>{" "}
              <code className="font-mono text-emerald-600 dark:text-emerald-400">
                Direction (UP / DOWN)
              </code>
            </p>
            <p>
              <strong>Evaluation Metrics:</strong> Test Classification Accuracy, Confusion Matrix,
              StandardScaler feature scaling.
            </p>
          </div>
        </div>
      </div>

      {/* Machine Learning Pipeline */}
      <section className="panel p-5 sm:p-6 border border-border shadow-xs space-y-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          <BrainCircuit className="size-4 text-primary" />
          End-to-End Machine Learning Workflow
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW.map((w) => (
            <li key={w.step} className="rounded-lg border border-border bg-card p-3.5 space-y-1">
              <p className="text-xs font-bold text-foreground">{w.step}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{w.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Tech Stack */}
      <section className="panel p-5 sm:p-6 border border-border shadow-xs space-y-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          <Server className="size-4 text-primary" />
          Full-Stack Technology Architecture
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.group} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="size-4" />
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground">
                    {s.group}
                  </p>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {s.items.map((i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-primary/60" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Academic Disclaimer */}
      <section className="panel border border-warning/40 bg-warning-soft/40 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Academic ML Project Disclaimer
            </h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              This application is developed exclusively for academic coursework, machine learning
              demonstration, and viva evaluation. All price forecasts and direction classifications
              are algorithmic approximations produced by mathematical models and must never be
              considered financial, investment, or trading advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
