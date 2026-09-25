"""
Prediction Service Module.
Orchestrates the entire ML pipeline:
Data Fetching -> Cleaning -> Feature Engineering & Splitting ->
Linear Regression Training & Prediction -> KNN Classification & Evaluation ->
Historical Trend Extraction.
"""

from datetime import datetime
import pandas as pd
from data_loader import fetch_stock_data
from preprocessing import clean_data, create_features_and_split
from linear_regression import train_and_predict_linear_regression
from knn_classifier import train_and_predict_knn

def run_stock_prediction(symbol: str) -> dict:
    """
    Executes the full stock prediction pipeline for the given ticker symbol.
    """
    # 1. Fetch raw historical data (with local CSV fallback)
    raw_df, formatted_symbol = fetch_stock_data(symbol)

    # 2. Clean and preprocess data
    cleaned_df = clean_data(raw_df)

    # 3. Create shifted target variables and chronological train/test split
    train_df, test_df, latest_row, full_df = create_features_and_split(cleaned_df)

    # 4. Train Linear Regression & generate continuous price predictions + metrics
    lr_results = train_and_predict_linear_regression(train_df, test_df, latest_row)

    # 5. Train KNN Classifier & generate UP/DOWN direction prediction + accuracy
    knn_results = train_and_predict_knn(train_df, test_df, latest_row, k=5)

    # 6. Extract recent historical data for the chart (last 60 trading days)
    recent_history = []
    recent_subset = full_df.tail(60)
    for _, row in recent_subset.iterrows():
        date_str = row["Date"].strftime("%Y-%m-%d") if isinstance(row["Date"], (pd.Timestamp, datetime)) else str(row["Date"])[:10]
        recent_history.append({
            "date": date_str,
            "close": round(float(row["Close"]), 2),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0
        })

    # Full cleaned historical series for table and analytical views
    all_history = []
    for _, row in full_df.iterrows():
        date_str = row["Date"].strftime("%Y-%m-%d") if isinstance(row["Date"], (pd.Timestamp, datetime)) else str(row["Date"])[:10]
        all_history.append({
            "date": date_str,
            "close": round(float(row["Close"]), 2),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0
        })

    # Latest recorded trading day information
    last_date_val = latest_row["Date"].values[0]
    if isinstance(last_date_val, (pd.Timestamp, datetime)):
        last_date_str = pd.to_datetime(last_date_val).strftime("%Y-%m-%d")
    else:
        last_date_str = str(last_date_val)[:10]

    last_close = round(float(latest_row["Close"].values[0]), 2)

    return {
        "symbol": formatted_symbol,
        "inputSymbol": symbol.strip().upper(),
        "lastTradingDate": last_date_str,
        "lastClose": last_close,
        "lastClosePrice": last_close,
        "linearRegression": {
            "predictedOpen": lr_results["predictedOpen"],
            "predictedHigh": lr_results["predictedHigh"],
            "predictedLow": lr_results["predictedLow"],
            "predictedClose": lr_results["predictedClose"],
            "metrics": lr_results["metrics"]
        },
        "knn": {
            "prediction": knn_results["prediction"],
            "accuracy": knn_results["accuracy"],
            "accuracyPercentage": knn_results["accuracyPercentage"],
            "k": knn_results["k"],
            "confusionMatrix": knn_results.get("confusionMatrix")
        },
        "chartData": recent_history,
        "historicalData": all_history
    }

if __name__ == "__main__":
    import sys
    import json
    args = [arg for arg in sys.argv[1:] if arg != "--json"]
    test_symbol = args[0] if args else "TCS"
    
    if "--json" in sys.argv:
        try:
            res = run_stock_prediction(test_symbol)
            print(json.dumps(res))
        except Exception as err:
            print(json.dumps({"error": str(err)}))
            sys.exit(1)
    else:
        print(f"Running prediction pipeline for {test_symbol}...")
        res = run_stock_prediction(test_symbol)
        print("Result summary:")
        print(f"Symbol: {res['symbol']}")
        print(f"Last Close: ₹{res['lastClosePrice']}")
        print(f"Predicted Tomorrow Close: ₹{res['linearRegression']['predictedClose']}")
        print(f"KNN Direction: {res['knn']['prediction']} (Accuracy: {res['knn']['accuracyPercentage']}%)")
        print(f"LR Metrics: {res['linearRegression']['metrics']}")
