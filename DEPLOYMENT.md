# StockWise — Render Production Deployment Guide

This guide provides step-by-step instructions to deploy the complete **StockWise** Stock Market Machine Learning application to **Render** with **MongoDB Atlas**.

---

## 1. System Architecture

```text
               User Browser
                     │
                     ▼
          ┌─────────────────────┐
          │      frontend/      │  (Render Web Service / Static)
          │  React + Vite + SSR │
          └──────────┬──────────┘
                     │ HTTPS (VITE_API_BASE_URL)
                     ▼
          ┌─────────────────────┐
          │      backend/       │  (Render Node Web Service)
          │    Express.js API   │
          └──────────┬──────────┘
                     │ Inter-service HTTP (ML_SERVICE_URL)
                     ▼
          ┌─────────────────────┐
          │     ml-service/     │  (Render Python Web Service)
          │  Flask + Scikit-ML  │
          └──────────┬──────────┘
                     │
             ┌───────┴────────┐
             ▼                ▼
     Linear Regression    KNN Classifier
     Next-Day Price       UP/DOWN Direction
             │
             ▼
     MongoDB Atlas (stock_ml.predictions)
```

---

## 2. Directory Structure

```text
.
├── render.yaml          # Render Blueprint for all 3 services
├── DEPLOYMENT.md        # This deployment guide
├── README.md            # System documentation
│
├── frontend/            # React 19 + Vite + TypeScript Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── backend/             # Node.js + Express API Server
│   ├── server.js
│   ├── config/ (db.js)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── .env.example
│
├── ml-service/          # Python ML Microservice (Flask + Gunicorn)
│   ├── ml_server.py
│   ├── prediction_service.py
│   ├── data_loader.py
│   ├── preprocessing.py
│   ├── linear_regression.py
│   ├── knn_classifier.py
│   └── requirements.txt
│
└── data/                # Reference CSV historical datasets
```

---

## 3. Step 1: MongoDB Atlas Configuration & Password Rotation

> [!IMPORTANT]
> **Rotate your database password** in MongoDB Atlas before deploying.

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Navigate to **Security $\rightarrow$ Database Access** $\rightarrow$ Edit database user $\rightarrow$ Generate a **new password**.
3. Navigate to **Security $\rightarrow$ Network Access** $\rightarrow$ Click **Add IP Address** $\rightarrow$ Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
4. Copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stock_ml?retryWrites=true&w=majority
   ```

---

## 4. Step 2: Deploy via Render Blueprint (Recommended)

1. Open **[dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)** (or click **New + $\rightarrow$ Blueprint**).
2. Connect your GitHub repository: `pipaliyameet/stockwise-insights`.
3. Render automatically discovers all 3 independent services from [`render.yaml`](render.yaml):
   - **`stockwise-ml`** (from `ml-service`)
   - **`stockwise-api`** (from `backend`)
   - **`stockwise-frontend`** (from `frontend`)
4. When prompted for **`MONGO_URI`**, paste your MongoDB Atlas connection string.
5. Click **Apply**.

---

## 5. Step 3: Manual Deployment Steps (Alternative)

If you prefer creating services manually in the Render dashboard:

### 1. Deploy `stockwise-ml` (Python Service)
- **Service Type:** Web Service
- **Root Directory:** `ml-service`
- **Environment:** Python
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn --bind 0.0.0.0:$PORT ml_server:app`
- **Health Check Path:** `/health`

### 2. Deploy `stockwise-api` (Node Backend)
- **Service Type:** Web Service
- **Root Directory:** `backend`
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Environment Variables:**
  - `MONGO_URI`: `<Your MongoDB Atlas URI>`
  - `ML_SERVICE_URL`: `https://stockwise-ml.onrender.com`
  - `FRONTEND_URL`: `https://stockwise-frontend.onrender.com`

### 3. Deploy `stockwise-frontend` (Frontend)
- **Service Type:** Web Service
- **Root Directory:** `frontend`
- **Environment:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/`
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://stockwise-api.onrender.com/api`

---

## 6. Health Checks & Verification

After deployment, test the live URLs:

1. **Python ML Service:**
   `https://<stockwise-ml>.onrender.com/health` $\rightarrow$ `{"status":"healthy"}`

2. **Node Backend API:**
   `https://<stockwise-api>.onrender.com/api/health` $\rightarrow$ `{"status":"ok"}`

3. **Frontend Application:**
   Open `https://<stockwise-frontend>.onrender.com` in your browser.
