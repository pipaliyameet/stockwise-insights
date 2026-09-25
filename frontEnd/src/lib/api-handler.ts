import mongoose from "mongoose";
import { runStockPredictionEngine } from "./ml-engine";

let isDbConnected = false;

// Connect to MongoDB Atlas (Production)
async function connectToMongo() {
  if (mongoose.connection.readyState === 1) {
    isDbConnected = true;
    return true;
  }
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    isDbConnected = false;
    return false;
  }
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    isDbConnected = true;
    console.log("[MongoDB] Connected to Atlas");
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn("[MongoDB Warning]", err?.message || err);
    return false;
  }
}

// Prediction Mongoose Schema & Model
const predictionSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true },
    predictionDate: { type: String, required: true },
    lastClosePrice: { type: Number, required: true },
    lastClose: { type: Number },
    predictedOpen: { type: Number, required: true },
    predictedHigh: { type: Number, required: true },
    predictedLow: { type: Number, required: true },
    predictedClose: { type: Number, required: true },
    knnPrediction: { type: String, enum: ["UP", "DOWN"], required: true },
    linearRegressionMetrics: {
      mae: { type: Number, required: true },
      rmse: { type: Number, required: true },
      r2: { type: Number, required: true },
    },
    knnAccuracy: { type: Number, required: true },
  },
  { timestamps: true }
);

const PredictionModel =
  mongoose.models.Prediction || mongoose.model("Prediction", predictionSchema, "predictions");

const STOCKS_LIST = [
  { symbol: "TCS.NS", ticker: "TCS", name: "Tata Consultancy Services Ltd.", sector: "Information Technology" },
  { symbol: "INFY.NS", ticker: "INFY", name: "Infosys Ltd.", sector: "Information Technology" },
  { symbol: "RELIANCE.NS", ticker: "RELIANCE", name: "Reliance Industries Ltd.", sector: "Energy & Conglomerate" },
  { symbol: "HDFCBANK.NS", ticker: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Banking & Financials" },
  { symbol: "ITC.NS", ticker: "ITC", name: "ITC Ltd.", sector: "Consumer Goods" },
  { symbol: "SBIN.NS", ticker: "SBIN", name: "State Bank of India", sector: "Banking & Financials" },
];

/**
 * Execute Machine Learning Pipeline (Linear Regression + KNN Classification)
 */
async function executeMlPipeline(symbol: string): Promise<any> {
  // If remote ML_SERVICE_URL is set, use HTTP microservice
  if (process.env.ML_SERVICE_URL) {
    const mlUrl = process.env.ML_SERVICE_URL.replace(/\/+$/, "");
    try {
      const res = await fetch(`${mlUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (err) {
      console.warn("[ML Microservice Fetch Warning]", err);
    }
  }

  // Run Real Mathematical ML Engine (OLS Linear Regression + KNN Classifier on Real Market Series)
  return await runStockPredictionEngine(symbol);
}

/**
 * Main API Request Dispatcher for /api/*
 */
export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "");

  if (!pathname.startsWith("/api")) {
    return null;
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. Health Check: GET /api/health
    if (pathname === "/api/health" && request.method === "GET") {
      const dbOk = await connectToMongo();
      return new Response(
        JSON.stringify({
          status: "ok",
          backend: {
            status: "online",
            name: "StockWise Unified Serverless API",
            environment: process.env.NODE_ENV || "production",
          },
          database: {
            status: dbOk ? "online" : "offline",
            connected: dbOk,
            message: dbOk ? "Connected to MongoDB Atlas" : "MongoDB Atlas not connected",
          },
          mlService: {
            status: "online",
            algorithms: ["Linear Regression", "K-Nearest Neighbors (KNN)"],
          },
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 2. Stock List: GET /api/stocks
    if (pathname === "/api/stocks" && request.method === "GET") {
      return new Response(
        JSON.stringify({ success: true, data: STOCKS_LIST }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 3. Stock Info: GET /api/stocks/:symbol
    if (pathname.startsWith("/api/stocks/") && request.method === "GET") {
      const symbol = decodeURIComponent(pathname.replace("/api/stocks/", "")).trim().toUpperCase();
      if (!symbol) {
        return new Response(
          JSON.stringify({ success: false, error: "Symbol is required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const mlData = await executeMlPipeline(symbol);
      const candles = mlData.historicalData || mlData.chartData || [];
      const last = candles[candles.length - 1];
      const prev = candles[candles.length - 2] || last;

      let quote = null;
      if (last) {
        const price = last.close;
        const prevClose = prev ? prev.close : price;
        const change = Number((price - prevClose).toFixed(2));
        const changePercent = prevClose ? Number(((change / prevClose) * 100).toFixed(2)) : 0;

        quote = {
          symbol: mlData.symbol,
          ticker: mlData.inputSymbol || symbol,
          name: symbol,
          sector: "NSE Equity",
          price,
          previousClose: prevClose,
          change,
          changePercent,
          dayHigh: last.high,
          dayLow: last.low,
          volume: last.volume,
          updatedAt: last.date,
        };
      }

      return new Response(
        JSON.stringify({ success: true, data: { ...mlData, quote, candles } }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 4. ML Prediction: POST /api/predict
    if (pathname === "/api/predict" && request.method === "POST") {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }

      const rawSymbol = body.symbol || "";
      if (!rawSymbol || typeof rawSymbol !== "string" || !rawSymbol.trim()) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Stock symbol cannot be empty. Please enter a valid stock symbol (e.g., TCS, RELIANCE, INFY).",
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      const cleanSymbol = rawSymbol.trim().toUpperCase();
      const mlData = await executeMlPipeline(cleanSymbol);

      // Save to MongoDB if connected
      let savedDoc: any = null;
      let dbWarning: string | null = null;
      const dbOk = await connectToMongo();

      if (dbOk) {
        try {
          const record = new PredictionModel({
            symbol: mlData.symbol,
            predictionDate: mlData.lastTradingDate,
            lastClosePrice: mlData.lastClosePrice,
            lastClose: mlData.lastClosePrice,
            predictedOpen: mlData.linearRegression.predictedOpen,
            predictedHigh: mlData.linearRegression.predictedHigh,
            predictedLow: mlData.linearRegression.predictedLow,
            predictedClose: mlData.linearRegression.predictedClose,
            knnPrediction: mlData.knn.prediction,
            linearRegressionMetrics: {
              mae: mlData.linearRegression.metrics.mae,
              rmse: mlData.linearRegression.metrics.rmse,
              r2: mlData.linearRegression.metrics.r2,
            },
            knnAccuracy: mlData.knn.accuracy,
          });
          savedDoc = await record.save();
        } catch (saveErr: any) {
          console.error("[MongoDB Save Error]", saveErr.message);
          dbWarning = "Failed to persist prediction record to MongoDB.";
        }
      } else {
        dbWarning = "MongoDB is disconnected. Prediction generated in degraded mode.";
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            ...mlData,
            savedId: savedDoc ? savedDoc._id : null,
            dbWarning,
          },
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 5. Prediction History: GET /api/predictions or GET /api/predictions/:symbol
    if (pathname.startsWith("/api/predictions") && request.method === "GET") {
      const dbOk = await connectToMongo();
      if (!dbOk) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Database connection failed. Cannot fetch prediction history from MongoDB.",
          }),
          { status: 503, headers: corsHeaders }
        );
      }

      const subPath = pathname.replace("/api/predictions", "").replace(/^\/+/, "");
      let query: any = {};
      if (subPath) {
        const cleanSymbol = decodeURIComponent(subPath).trim().toUpperCase();
        query = {
          $or: [{ symbol: cleanSymbol }, { symbol: `${cleanSymbol}.NS` }],
        };
      }

      const records = await PredictionModel.find(query).sort({ createdAt: -1 }).limit(50).lean();

      return new Response(
        JSON.stringify({
          success: true,
          count: records.length,
          data: records,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Endpoint ${pathname} not found` }),
      { status: 404, headers: corsHeaders }
    );
  } catch (err: any) {
    const isNotFound = err.message && (err.message.includes("not found") || err.message.includes("404") || err.message.includes("valid"));
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Internal server error in prediction pipeline",
      }),
      { status: isNotFound ? 404 : 500, headers: corsHeaders }
    );
  }
}
