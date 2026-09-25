/**
 * Mongoose Prediction Model.
 * Stores stock prediction records in MongoDB 'predictions' collection.
 */

const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    predictionDate: {
      type: String,
      required: true,
    },
    lastClosePrice: {
      type: Number,
      required: true,
    },
    lastClose: {
      type: Number,
      required: false,
    },
    lastTradingDate: {
      type: String,
      required: false,
    },
    predictedOpen: {
      type: Number,
      required: true,
    },
    predictedHigh: {
      type: Number,
      required: true,
    },
    predictedLow: {
      type: Number,
      required: true,
    },
    predictedClose: {
      type: Number,
      required: true,
    },
    knnPrediction: {
      type: String,
      enum: ["UP", "DOWN"],
      required: true,
    },
    linearRegressionMetrics: {
      mae: { type: Number, required: true },
      rmse: { type: Number, required: true },
      r2: { type: Number, required: true },
    },
    knnAccuracy: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index symbol and createdAt for faster queries
predictionSchema.index({ symbol: 1, createdAt: -1 });

module.exports = mongoose.model("Prediction", predictionSchema, "predictions");
