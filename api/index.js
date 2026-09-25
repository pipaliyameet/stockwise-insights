const express = require("express");
const cors = require("cors");
const path = require("path");

const { connectDB } = require("../backEnd/config/db");
const predictionRoutes = require("../backEnd/routes/predictionRoutes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Root test endpoint
app.get("/", (req, res) => {
  res.json({
    name: "StockWise Stock Market ML Prediction API",
    status: "online",
    environment: process.env.NODE_ENV || "production",
    endpoints: {
      predict: "POST /api/predict",
      predictions: "GET /api/predictions",
      predictionsBySymbol: "GET /api/predictions/:symbol",
      stocks: "GET /api/stocks",
      stockInfo: "GET /api/stocks/:symbol",
      health: "GET /api/health",
    },
  });
});

// Mount routes at both /api and / to handle different rewrite styles
app.use("/api", predictionRoutes);
app.use("/", predictionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[API Error]", err.message);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    details: err.message,
  });
});

module.exports = app;
