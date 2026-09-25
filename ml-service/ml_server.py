"""
Python ML Microservice (Flask & Gunicorn).
Exposes the Stock Prediction ML pipeline (Linear Regression & KNN Classification).
"""

import os
import sys

# Ensure current directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from flask import Flask, request, jsonify
from flask_cors import CORS
from prediction_service import run_stock_prediction

app = Flask(__name__)
# Enable CORS for internal and dev access
CORS(app)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Stock ML Engine",
        "algorithms": ["Linear Regression", "K-Nearest Neighbors (KNN)"]
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json() or {}
        symbol = data.get("symbol", "").strip()

        if not symbol:
            return jsonify({
                "error": "Stock symbol cannot be empty. Please enter a symbol like TCS, RELIANCE, or INFY."
            }), 400

        print(f"[ML] Running prediction pipeline for: {symbol}")
        result = run_stock_prediction(symbol)
        print(f"[ML] Completed prediction for {symbol}: Next-Day Close Rs.{result['linearRegression']['predictedClose']}, Direction: {result['knn']['prediction']}")
        return jsonify(result), 200

    except ValueError as ve:
        print(f"[ML Warning] {str(ve)}")
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        print(f"[ML Error] {str(e)}")
        return jsonify({"error": f"ML prediction error: {str(e)}"}), 500

@app.route("/stock/<symbol>", methods=["GET"])
def get_stock(symbol):
    try:
        if not symbol or not symbol.strip():
            return jsonify({"error": "Symbol is required"}), 400
        result = run_stock_prediction(symbol.strip())
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", os.environ.get("ML_PORT", 5001)))
    print(f"[ML] Starting Python ML Service on 0.0.0.0:{port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
