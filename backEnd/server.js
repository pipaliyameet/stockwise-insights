/**
 * Express Server Entry Point.
 * Connects to MongoDB, configures dynamic CORS, mounts API routes, and serves predictions.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const { connectDB } = require("./config/db");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();
const PORT = process.env.PORT || 5002;

// CORS configuration supporting production FRONTEND_URL & local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // If FRONTEND_URL is set to '*', allow all
      if (process.env.FRONTEND_URL === "*") return callback(null, true);
      // If origin is in allowed list, or ends with .onrender.com (for staging/deploy previews)
      if (allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }
      // In development fallback, allow origin
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
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
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      predict: "POST /api/predict",
      predictions: "GET /api/predictions",
      predictionsBySymbol: "GET /api/predictions/:symbol",
      stockInfo: "GET /api/stocks/:symbol",
      health: "GET /api/health",
    },
  });
});

// Mount API routes
app.use("/api", predictionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[API Error]", err.message);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    details: err.message,
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Backend server running at http://0.0.0.0:${PORT}`);
  });
};

startServer();
