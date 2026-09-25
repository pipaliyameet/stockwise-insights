# StockWise — Stock Market Machine Learning Application

A full-stack Stock Market Machine Learning web application featuring **Multiple Linear Regression** for next-day price prediction and **K-Nearest Neighbors (KNN)** for market direction classification.

---

## 📁 Monorepo Structure

```text
.
├── render.yaml          # Render Blueprint (Frontend + Backend + ML Service)
├── DEPLOYMENT.md        # Step-by-step Render & MongoDB Atlas deployment guide
├── README.md            # System architecture documentation
│
├── frontend/            # React 19 + TypeScript + Vite + Tailwind CSS UI
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── backend/             # Node.js + Express API Server + MongoDB Mongoose
│   ├── server.js
│   ├── config/ (db.js)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── .env.example
│
├── ml-service/          # Python 3.11 ML Microservice (Flask + Gunicorn)
│   ├── ml_server.py
│   ├── prediction_service.py
│   ├── data_loader.py
│   ├── preprocessing.py
│   ├── linear_regression.py
│   ├── knn_classifier.py
│   └── requirements.txt
│
└── data/                # Historical CSV datasets (TCS, INFY, RELIANCE)
```

---

## 💻 Local Development

### 1. Start Python ML Microservice
```bash
cd ml-service
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
cd frontend
npm install
npm run dev
# Open http://localhost:8080
```

---

## ☁️ Production Deployment on Render

1. Follow the instructions in [DEPLOYMENT.md](DEPLOYMENT.md).
2. In Render Dashboard, click **New + $\rightarrow$ Blueprint** and select this repository.
3. Enter your **`MONGO_URI`** Atlas secret when prompted to automatically deploy all 3 services!
