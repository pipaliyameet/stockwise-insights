"""
Linear Regression Module for Stock Price Prediction.
Trains a multiple linear regression model to predict the next trading day's:
- Tomorrow_Open
- Tomorrow_High
- Tomorrow_Low
- Tomorrow_Close (Primary metric)

Calculates standard regression evaluation metrics on the test dataset:
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- R² Score (Coefficient of Determination)
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

FEATURE_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]
TARGET_COLUMNS = ["Tomorrow_Open", "Tomorrow_High", "Tomorrow_Low", "Tomorrow_Close"]

def train_and_predict_linear_regression(train_df: pd.DataFrame, test_df: pd.DataFrame, latest_row: pd.DataFrame):
    """
    Trains LinearRegression on train_df, evaluates on test_df,
    and predicts next-day prices for latest_row.

    Returns:
        dict containing predicted prices and performance metrics.
    """
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMNS]

    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMNS]

    # Initialize and train the scikit-learn Linear Regression model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Evaluate on the chronologically separated test set
    y_pred_test = model.predict(X_test)

    # Calculate metrics for the primary target: Tomorrow_Close (index 3)
    actual_close_test = y_test["Tomorrow_Close"]
    pred_close_test = y_pred_test[:, 3]

    mae = float(mean_absolute_error(actual_close_test, pred_close_test))
    # root_mean_squared_error or sqrt(mean_squared_error) for compatibility
    rmse = float(np.sqrt(mean_squared_error(actual_close_test, pred_close_test)))
    r2 = float(r2_score(actual_close_test, pred_close_test))

    # Predict next trading day's values from the latest market data point
    next_day_pred = model.predict(latest_row[FEATURE_COLUMNS])[0]

    return {
        "predictedOpen": round(float(next_day_pred[0]), 2),
        "predictedHigh": round(float(next_day_pred[1]), 2),
        "predictedLow": round(float(next_day_pred[2]), 2),
        "predictedClose": round(float(next_day_pred[3]), 2),
        "metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 4)
        }
    }
