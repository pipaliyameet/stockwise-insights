"""
Python ML Microservice on Vercel Serverless (Flask & Scikit-Learn).
"""
import os
import sys

# Ensure ml-service and api/py directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
ml_service_dir = os.path.join(root_dir, "ml-service")

for path in [current_dir, ml_service_dir, root_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from flask import Flask, request, jsonify
from flask_cors import CORS

# Import existing ML prediction logic from ml-service
try:
    from prediction_service import run_stock_prediction
except ImportError:
    from ml_service.prediction_service import run_stock_prediction

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
@app.route("/api/py", methods=["GET"])
@app.route("/health", methods=["GET"])
@app.route("/api/py/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Stock ML Engine",
        "algorithms": ["Linear Regression", "K-Nearest Neighbors (KNN)"]
    }), 200

@app.route("/predict", methods=["POST"])
@app.route("/api/py/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True) or {}
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
@app.route("/api/py/stock/<symbol>", methods=["GET"])
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
    app.run(host="0.0.0.0", port=port, debug=False)
