/**
 * MongoDB Database Connection Configuration.
 * Connects to MongoDB Atlas (Production) or local MongoDB (Development).
 */

const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/stock_ml";

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} / database: ${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.error(`[MongoDB] Database connection error: ${error.message}`);
    console.warn("[MongoDB] Operating in degraded mode (predictions will still work, but history won't be saved to MongoDB).");
  }
};

// Monitor connection state changes
mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("[MongoDB] Connection lost. Retrying when new queries arrive...");
});

mongoose.connection.on("reconnected", () => {
  isConnected = true;
  console.log("[MongoDB] Connection restored.");
});

const getDBStatus = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, getDBStatus };
