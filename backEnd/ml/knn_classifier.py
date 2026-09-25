"""
KNN Classification Module for Stock Price Prediction.
Classifies next trading day's market direction as either UP or DOWN.

Target definition:
  If Tomorrow_Close > Today_Close -> 1 (UP)
  Else -> 0 (DOWN)

Why StandardScaler?
KNN relies on Euclidean distance metrics. Features with large numerical ranges
(e.g., Volume in millions vs Price in thousands) would dominate the distance calculation
without feature scaling. StandardScaler standardizes each feature to mean 0 and variance 1.
"""

import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix

FEATURE_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]
TARGET_COLUMN = "Target_Direction"

def train_and_predict_knn(train_df: pd.DataFrame, test_df: pd.DataFrame, latest_row: pd.DataFrame, k: int = 5):
    """
    Trains KNeighborsClassifier on scaled train_df, evaluates test accuracy,
    and classifies next day direction as UP or DOWN.

    Returns:
        dict containing 'prediction' ('UP' or 'DOWN'), 'accuracy' (float between 0 and 1),
        and confusion matrix summary.
    """
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN]

    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN]

    # Feature Scaling: Fit scaler strictly on training set to avoid data leakage
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    latest_scaled = scaler.transform(latest_row[FEATURE_COLUMNS])

    # Initialize and fit KNN Classifier with K=5
    knn = KNeighborsClassifier(n_neighbors=k)
    knn.fit(X_train_scaled, y_train)

    # Evaluate accuracy on test set
    y_pred_test = knn.predict(X_test_scaled)
    accuracy = float(accuracy_score(y_test, y_pred_test))
    
    # Calculate confusion matrix: [[TN, FP], [FN, TP]]
    cm = confusion_matrix(y_test, y_pred_test).tolist()

    # Predict market direction for the next trading day
    direction_code = int(knn.predict(latest_scaled)[0])
    prediction_label = "UP" if direction_code == 1 else "DOWN"

    return {
        "prediction": prediction_label,
        "accuracy": round(accuracy, 4),
        "accuracyPercentage": round(accuracy * 100, 2),
        "k": k,
        "confusionMatrix": cm
    }
