"""
Data Loader Module for Stock Price Prediction Project.
Fetches historical stock market data using yfinance, with fallback to local CSV files.
"""

import os
import yfinance as yf
import pandas as pd

def format_symbol(symbol: str) -> str:
    """
    Format the stock symbol.
    Indian stocks automatically append .NS if no exchange suffix is provided.
    Examples:
      'TCS' -> 'TCS.NS'
      'RELIANCE' -> 'RELIANCE.NS'
      'AAPL' -> 'AAPL' (keeps US symbols if specified with explicit non-Indian format or already contains '.')
    """
    symbol = symbol.strip().upper()
    if not symbol:
        raise ValueError("Stock symbol cannot be empty.")
    
    # If symbol already has an exchange suffix like .NS, .BO, etc., keep it
    if "." in symbol:
        return symbol
    
    # List of known common US tickers or if user explicitly enters them
    us_tickers = {"AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"}
    if symbol in us_tickers:
        return symbol

    # Default Indian NSE suffix for Indian equities (college project standard)
    return f"{symbol}.NS"


def fetch_stock_data(symbol: str, period: str = "5y") -> tuple[pd.DataFrame, str]:
    """
    Downloads historical daily stock data using yfinance.
    Falls back to existing CSV data files in the 'data/' folder if offline or if download fails.
    
    Returns:
        (df, formatted_symbol)
    """
    formatted_symbol = format_symbol(symbol)
    df = None
    
    # 1. Try downloading from yfinance
    try:
        df_download = yf.download(formatted_symbol, period=period, progress=False)
        if df_download is not None and not df_download.empty and len(df_download) > 30:
            df = df_download
    except Exception as e:
        print(f"[Warning] yfinance download failed for {formatted_symbol}: {e}")

    # 2. If download was empty or failed, attempt local CSV fallback
    if df is None or df.empty:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir_1 = os.path.abspath(os.path.join(base_dir, "..", "..", "data"))
        data_dir_2 = os.path.abspath(os.path.join(base_dir, "..", "data"))
        data_dir_3 = os.path.abspath(os.path.join(base_dir, "data"))

        possible_files = [
            os.path.join("data", f"{formatted_symbol}.csv"),
            os.path.join("..", "data", f"{formatted_symbol}.csv"),
            os.path.join("data", f"{symbol.strip().upper()}.csv"),
            os.path.join("..", "data", f"{symbol.strip().upper()}.csv"),
            os.path.join(data_dir_1, f"{formatted_symbol}.csv"),
            os.path.join(data_dir_1, f"{symbol.strip().upper()}.csv"),
            os.path.join(data_dir_2, f"{formatted_symbol}.csv"),
            os.path.join(data_dir_2, f"{symbol.strip().upper()}.csv"),
            os.path.join(data_dir_3, f"{formatted_symbol}.csv"),
            os.path.join(data_dir_3, f"{symbol.strip().upper()}.csv"),
        ]
        
        for file_path in possible_files:
            if os.path.exists(file_path):
                print(f"[Info] Loading historical data from local fallback file: {file_path}")
                df = pd.read_csv(file_path)
                break
                
    if df is None or df.empty or len(df) < 30:
        raise ValueError(
            f"Stock symbol '{symbol}' not found. Please enter a valid NSE stock symbol (e.g., TCS, INFY, RELIANCE)."
        )

    return df, formatted_symbol
