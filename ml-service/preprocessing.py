"""
Preprocessing Module for Stock Price Prediction Project.
Cleans raw data from Yahoo Finance / CSV, constructs time-lagged target variables,
and performs chronological train/test split to prevent data leakage.
"""

import pandas as pd
import numpy as np

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw stock data:
    1. Flattens MultiIndex columns from yfinance if present.
    2. Handles Yahoo Finance CSV structure (removes 'Ticker' & empty header rows).
    3. Converts Date to datetime and sorts chronologically from oldest to newest.
    4. Converts Open, High, Low, Close, Volume to numeric.
    5. Drops missing values and duplicate rows.
    """
    df = df.copy()

    # 1. Flatten MultiIndex columns from yfinance (e.g., Level 0: Metric, Level 1: Ticker)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # 2. Reset index if Date is the index
    if "Date" not in df.columns:
        if isinstance(df.index, pd.DatetimeIndex) or df.index.name == "Date":
            df = df.reset_index()
        elif "Price" in df.columns:
            # In raw Yahoo CSV, 'Price' column represents Date
            df = df.rename(columns={"Price": "Date"})

    # 3. Filter out metadata header rows (e.g. where Date is 'Ticker' or 'Date')
    if "Date" in df.columns:
        df = df[~df["Date"].astype(str).isin(["Ticker", "Date"])].copy()
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

    # 4. Convert numerical columns
    numeric_cols = ["Open", "High", "Low", "Close", "Volume"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        else:
            raise ValueError(f"Required column '{col}' missing from stock data.")

    # 5. Clean missing values and duplicates
    df = df.dropna(subset=["Date"] + numeric_cols)
    df = df.drop_duplicates(subset=["Date"])

    # 6. Sort chronologically (oldest to newest)
    df = df.sort_values("Date").reset_index(drop=True)

    return df


def create_features_and_split(df: pd.DataFrame, train_ratio: float = 0.8):
    """
    Creates next-day regression targets and UP/DOWN classification target.
    Extracts the latest market day for next-day forecasting.
    Performs chronological train/test split (default 80% train / 20% test).

    Why chronological split instead of random shuffle?
    In time series data, randomly shuffling future observations into training
    causes data leakage (lookahead bias), giving misleadingly high accuracy.
    Using older data for training and newer data for testing mirrors real-world prediction.

    Returns:
        train_df: DataFrame with 80% older historical data
        test_df: DataFrame with 20% newer historical data
        latest_row: Single row DataFrame representing the latest available market day
        df: Full cleaned DataFrame
    """
    df = df.copy()

    # Create next-day targets by shifting by -1
    # Tomorrow_Close is the primary price target
    df["Tomorrow_Open"] = df["Open"].shift(-1)
    df["Tomorrow_High"] = df["High"].shift(-1)
    df["Tomorrow_Low"] = df["Low"].shift(-1)
    df["Tomorrow_Close"] = df["Close"].shift(-1)

    # Classification Target for KNN:
    # 1 (UP) if Tomorrow_Close > Today's Close, else 0 (DOWN)
    df["Target_Direction"] = (df["Tomorrow_Close"] > df["Close"]).astype(int)

    # The last row has NaN for Tomorrow_* because tomorrow's market hasn't happened yet.
    # This last row is our input for predicting the upcoming trading day!
    latest_row = df.iloc[[-1]].copy()

    # Historical data where both features and tomorrow's ground truth exist
    model_df = df.iloc[:-1].copy()

    if len(model_df) < 50:
        raise ValueError("Insufficient data points after preprocessing for model training.")

    # Chronological Split (80% training on older data, 20% testing on newer data)
    split_index = int(len(model_df) * train_ratio)
    train_df = model_df.iloc[:split_index].copy()
    test_df = model_df.iloc[split_index:].copy()

    return train_df, test_df, latest_row, df
