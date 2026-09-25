/**
 * Prediction and Stock API Routes.
 */

const express = require("express");
const router = express.Router();
const {
  predictStock,
  getPredictions,
  getPredictionsBySymbol,
  getStockInfo,
  getStocksList,
  getHealth,
} = require("../controllers/predictionController");

// Health check endpoint
router.get("/health", getHealth);

// Predict next-day stock price and market direction
router.post("/predict", predictStock);

// Prediction history endpoints
router.get("/predictions", getPredictions);
router.get("/predictions/:symbol", getPredictionsBySymbol);

// Supported stocks list
router.get("/stocks", getStocksList);

// Stock info & chart data endpoint
router.get("/stocks/:symbol", getStockInfo);

module.exports = router;
