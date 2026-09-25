/**
 * Prediction Controller.
 * Handles stock prediction requests, calls the Python ML service,
 * persists prediction results in MongoDB, and serves history records.
 */

const axios = require("axios");
const Prediction = require("../models/predictionModel");
const { getDBStatus, connectDB } = require("../config/db");

const getMlUrl = (req) => {
  if (process.env.ML_SERVICE_URL) return process.env.ML_SERVICE_URL.replace(/\/+$/, "");
  if (req && req.headers && req.headers.host) {
    const proto = req.headers["x-forwarded-proto"] || "https";
    return `${proto}://${req.headers.host}/api/py`;
  }
  return "http://localhost:5001";
};

/**
 * Trigger ML prediction for a stock symbol
 * POST /api/predict
 */
const predictStock = async (req, res) => {
  try {
    await connectDB();
    let { symbol } = req.body;

    // Input validation
    if (!symbol || typeof symbol !== "string" || !symbol.trim()) {
      return res.status(400).json({
        success: false,
        error: "Stock symbol cannot be empty. Please enter a valid stock symbol (e.g., TCS, RELIANCE, INFY).",
      });
    }

    const cleanSymbol = symbol.trim().toUpperCase();

    // Call Python ML microservice
    let mlResponse;
    const mlUrl = getMlUrl(req);
    try {
      mlResponse = await axios.post(
        `${mlUrl}/predict`,
        { symbol: cleanSymbol },
        { timeout: 45000 }
      );
    } catch (mlErr) {
      if (mlErr.response && mlErr.response.data && mlErr.response.data.error) {
        return res.status(mlErr.response.status || 400).json({
          success: false,
          error: mlErr.response.data.error,
        });
      }
      if (mlErr.code === "ECONNREFUSED" || mlErr.code === "ENOTFOUND") {
        return res.status(503).json({
          success: false,
          error: `Unable to connect to ML prediction service at ${mlUrl}. Please ensure the Python ML service is running.`,
        });
      }
      return res.status(500).json({
        success: false,
        error: `ML service error: ${mlErr.message}`,
      });
    }

    const mlData = mlResponse.data;

    // Check MongoDB connection status
    let savedDoc = null;
    let dbWarning = null;

    if (getDBStatus()) {
      try {
        const predictionRecord = new Prediction({
          symbol: mlData.symbol,
          predictionDate: mlData.lastTradingDate,
          lastClosePrice: mlData.lastClosePrice,
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

        savedDoc = await predictionRecord.save();
      } catch (saveErr) {
        console.error("[MongoDB] Error saving prediction record:", saveErr.message);
        dbWarning = "Database connection failed to persist record.";
      }
    } else {
      console.warn("[MongoDB] Database connection failed or MongoDB is disconnected. Proceeding without storage.");
      dbWarning = "Database connection failed. Record was not saved to MongoDB.";
    }

    return res.status(200).json({
      success: true,
      data: {
        ...mlData,
        savedId: savedDoc ? savedDoc._id : null,
        dbWarning,
      },
    });
  } catch (error) {
    console.error("[Prediction Controller] Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during prediction. " + error.message,
    });
  }
};

/**
 * Retrieve prediction history
 * GET /api/predictions
 */
const getPredictions = async (req, res) => {
  try {
    await connectDB();
    if (!getDBStatus()) {
      return res.status(503).json({
        success: false,
        error: "Database connection failed. Cannot fetch prediction history from MongoDB.",
      });
    }

    const history = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve prediction history: " + error.message,
    });
  }
};

/**
 * Retrieve prediction history for a specific symbol
 * GET /api/predictions/:symbol
 */
const getPredictionsBySymbol = async (req, res) => {
  try {
    await connectDB();
    const { symbol } = req.params;
    if (!getDBStatus()) {
      return res.status(503).json({
        success: false,
        error: "Database connection failed. Cannot fetch prediction history from MongoDB.",
      });
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const query = {
      $or: [
        { symbol: cleanSymbol },
        { symbol: `${cleanSymbol}.NS` }
      ]
    };

    const history = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      symbol: cleanSymbol,
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve history for ${req.params.symbol}: ${error.message}`,
    });
  }
};

/**
 * Get list of supported stocks
 * GET /api/stocks
 */
const getStocksList = (req, res) => {
  const stocks = [
    { symbol: "TCS.NS", ticker: "TCS", name: "Tata Consultancy Services Ltd.", sector: "Information Technology" },
    { symbol: "INFY.NS", ticker: "INFY", name: "Infosys Ltd.", sector: "Information Technology" },
    { symbol: "RELIANCE.NS", ticker: "RELIANCE", name: "Reliance Industries Ltd.", sector: "Energy & Conglomerate" },
    { symbol: "HDFCBANK.NS", ticker: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Banking & Financials" },
    { symbol: "ITC.NS", ticker: "ITC", name: "ITC Ltd.", sector: "Consumer Goods" },
    { symbol: "SBIN.NS", ticker: "SBIN", name: "State Bank of India", sector: "Banking & Financials" },
  ];
  return res.status(200).json({ success: true, data: stocks });
};

/**
 * Get stock information, quote, and candle data
 * GET /api/stocks/:symbol
 */
const getStockInfo = async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol || !symbol.trim()) {
      return res.status(400).json({ success: false, error: "Symbol is required" });
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const mlUrl = getMlUrl(req);
    const response = await axios.post(`${mlUrl}/predict`, { symbol: cleanSymbol }, { timeout: 45000 });
    const mlData = response.data;

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
        ticker: mlData.inputSymbol || cleanSymbol,
        name: cleanSymbol,
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

    return res.status(200).json({
      success: true,
      data: {
        ...mlData,
        quote,
        candles,
      },
    });
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      return res.status(err.response.status || 400).json({
        success: false,
        error: err.response.data.error,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Unable to retrieve stock data: " + err.message,
    });
  }
};

/**
 * System and DB health check
 * GET /api/health
 */
const getHealth = async (req, res) => {
  await connectDB();
  const dbConnected = getDBStatus();
  let mlHealthy = false;
  let mlDetails = null;
  const mlUrl = getMlUrl(req);

  try {
    const mlRes = await axios.get(`${mlUrl}/health`, { timeout: 5000 });
    if (mlRes.status === 200) {
      mlHealthy = true;
      mlDetails = mlRes.data;
    }
  } catch (err) {
    mlHealthy = false;
    mlDetails = err.message;
  }

  const allHealthy = dbConnected && mlHealthy;

  return res.status(200).json({
    status: allHealthy ? "ok" : "degraded",
    backend: {
      status: "online",
      name: "Express.js API",
      port: process.env.PORT || 5002,
    },
    database: {
      status: dbConnected ? "online" : "offline",
      connected: dbConnected,
      message: dbConnected ? "Connected to MongoDB" : "Database connection failed",
    },
    mlService: {
      status: mlHealthy ? "online" : "offline",
      url: mlUrl,
      details: mlDetails,
    },
  });
};

module.exports = {
  predictStock,
  getPredictions,
  getPredictionsBySymbol,
  getStockInfo,
  getStocksList,
  getHealth,
};
