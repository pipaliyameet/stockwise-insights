# StockWise — Stock Market Machine Learning Application

A modern full-stack Stock Market Machine Learning web application designed for academic evaluation, research, and predictive stock analytics.

StockWise predicts the **Next Trading Day's Closing Price** and classifies the **Market Direction (UP / DOWN)** using two machine learning algorithms evaluated on real historical equity data.

---

## 🚀 Machine Learning Architecture

1. **Multiple Linear Regression (Price Forecasting):**
   - **Target:** `Tomorrow_Close` (Continuous numerical price in ₹).
   - **Features:** `Open`, `High`, `Low`, `Close`, `Volume`.
   - **Metrics:** $MAE$ (Mean Absolute Error), $RMSE$ (Root Mean Squared Error), $R^2$ Score.
   - **Split:** 80/20 chronological time-series train/test split without data leakage.

2. **K-Nearest Neighbors (KNN Direction Classification):**
   - **Target:** Market Direction (`1` for UP, `0` for DOWN).
   - **Features:** StandardScaled `[Open, High, Low, Close, Volume]`.
   - **Parameter:** $K = 5$ Nearest Neighbors.
   - **Metrics:** Test Accuracy Percentage and Confusion Matrix.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, TanStack Router & Start, Tailwind CSS, Recharts, Lucide React.
- **Backend:** Node.js, Express, Mongoose, Axios, CORS.
- **ML Engine:** Python 3.11, Flask, Scikit-learn, Pandas, NumPy, yfinance, Gunicorn.
- **Database:** MongoDB Atlas (Persistent Prediction History).
- **Deployment Platform:** Render ([render.yaml](render.yaml) Blueprint).

---

## 📁 Repository Structure

```text
.
├── render.yaml                  # Render Blueprint configuration
├── DEPLOYMENT.md                # Step-by-step production deployment guide
├── stockwise-insights/          # Frontend Web Application (React + Vite)
│   ├── src/                     # UI components, charts, and TanStack routes
│   ├── package.json
│   └── .env.example
├── backend/                     # Node.js Express API Server
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/                  # MongoDB Mongoose connection
│   ├── controllers/             # Prediction & stock data controllers
│   ├── routes/                  # API endpoints
│   └── ml/                      # Python ML Microservice
│       ├── ml_server.py         # Flask / Gunicorn REST API server
│       ├── prediction_service.py # Core ML training & inference pipeline
│       ├── data_loader.py       # yfinance live market downloader
│       ├── preprocessing.py     # Feature engineering & chronological splitter
│       ├── linear_regression.py # Linear regression model & metrics
│       ├── knn_classifier.py    # KNN direction classifier
│       └── requirements.txt     # Python dependencies
└── data/                        # Local CSV reference datasets
```

---

## 💻 Local Development Setup

### 1. Start Python ML Microservice
```bash
cd backend/ml
pip install -r requirements.txt
python ml_server.py
# Runs on http://localhost:5001
```

### 2. Start Express API Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5002
```

### 3. Start Frontend UI
```bash
cd stockwise-insights
npm install
npm run dev
# Open http://localhost:8080
```

---

## ☁️ Production Deployment on Render

To deploy this project to Render:
1. Push this repository to your GitHub account.
2. Follow the detailed steps in [DEPLOYMENT.md](DEPLOYMENT.md).
3. In Render Dashboard, click **New + $\rightarrow$ Blueprint** and select your repository.
4. Provide your rotated **`MONGO_URI`** Atlas secret when prompted.
