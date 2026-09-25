# StockWise — Render Production Deployment Guide

This guide provides step-by-step instructions to deploy the complete **StockWise** Stock Market Machine Learning application to **Render** with **MongoDB Atlas**.

---

## 1. System Architecture

```text
               User Browser
                     │
                     ▼
          ┌─────────────────────┐
          │ stockwise-frontend  │  (Render Web Service / Static)
          │  React + Vite + SSR │
          └──────────┬──────────┘
                     │ HTTPS (VITE_API_BASE_URL)
                     ▼
          ┌─────────────────────┐
          │    stockwise-api    │  (Render Node Web Service)
          │    Express.js API   │
          └──────────┬──────────┘
                     │ Inter-service HTTP (ML_SERVICE_URL)
                     ▼
          ┌─────────────────────┐
          │    stockwise-ml     │  (Render Python Web Service)
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

## 2. Prerequisites

1. **GitHub Account** (with this repository pushed to your account).
2. **Render Account** ([render.com](https://render.com)).
3. **MongoDB Atlas Account** ([mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)).

---

## 3. Step 1: MongoDB Atlas Configuration & Password Rotation

> [!IMPORTANT]
> Because development credentials may have been exposed, **rotate your database password** in MongoDB Atlas before deploying.

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Navigate to **Security $\rightarrow$ Database Access**.
3. Edit your database user (or add a new user, e.g. `stockwise_user`) and click **Edit $\rightarrow$ Auto-generate/Change Password**. Copy the new password.
4. Navigate to **Security $\rightarrow$ Network Access**.
5. Click **Add IP Address** $\rightarrow$ select **Allow Access from Anywhere (`0.0.0.0/0`)** $\rightarrow$ click **Confirm**. (This allows Render's cloud servers to connect to Atlas).
6. Navigate to **Database $\rightarrow$ Cluster $\rightarrow$ Connect $\rightarrow$ Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stock_ml?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your actual credentials).*

---

## 4. Step 2: Push Repository to GitHub

Ensure your local changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Configure production deployment for Render and MongoDB Atlas"
git push origin main
```

---

## 5. Step 3: Deploy via Render Blueprint (Recommended)

The repository includes a ready-to-use [`render.yaml`](file:///Users/meet/allprograms/PROJECT/ML%20project/25%20:%209/ML-Work%202/render.yaml) blueprint.

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right corner and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will parse `render.yaml` and discover the three services:
   - `stockwise-ml` (Python Web Service)
   - `stockwise-api` (Node.js Web Service)
   - `stockwise-frontend` (Frontend Web Service)
5. Under `stockwise-api` configuration, Render will prompt you for the **`MONGO_URI`** environment variable:
   - Paste your rotated MongoDB Atlas connection string.
6. Click **Apply**. Render will automatically build and deploy all three services in the correct sequence.

---

## 6. Step 4: Environment Variables Reference

| Service | Variable Name | Required Value | Example / Description |
| :--- | :--- | :--- | :--- |
| **`stockwise-ml`** | `PORT` | Auto-assigned | Provided automatically by Render |
| | `PYTHON_VERSION` | `3.11.9` | Set in `render.yaml` |
| **`stockwise-api`** | `PORT` | Auto-assigned | Provided automatically by Render |
| | `NODE_ENV` | `production` | Set in `render.yaml` |
| | `MONGO_URI` | *Secret* | `mongodb+srv://user:pass@cluster0.../stock_ml` |
| | `ML_SERVICE_URL` | Render ML URL | `https://stockwise-ml.onrender.com` (or internal URL) |
| | `FRONTEND_URL` | Render Frontend URL | `https://stockwise-frontend.onrender.com` |
| **`stockwise-frontend`**| `VITE_API_BASE_URL` | Render API URL | `https://stockwise-api.onrender.com/api` |

> [!TIP]
> After `stockwise-api` is deployed, verify that `VITE_API_BASE_URL` on `stockwise-frontend` points to `https://<your-stockwise-api-subdomain>.onrender.com/api`.

---

## 7. Step 5: Manual Deployment Steps (Alternative without Blueprint)

If you prefer creating services manually in the Render dashboard:

### 1. Deploy `stockwise-ml` (Python Service)
- **Service Type:** Web Service
- **Root Directory:** `backend/ml`
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
- **Root Directory:** `stockwise-insights`
- **Environment:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/`
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://stockwise-api.onrender.com/api`

---

## 8. Health Checks & Verification

After deployment, test the live URLs:

1. **Python ML Service:**
   ```bash
   curl https://<stockwise-ml>.onrender.com/health
   # Expected response: {"status":"healthy","service":"Stock ML Engine",...}
   ```

2. **Node Backend API:**
   ```bash
   curl https://<stockwise-api>.onrender.com/api/health
   # Expected response: {"status":"ok","backend":{"status":"online"},"database":{"connected":true},"mlService":{"status":"online"}}
   ```

3. **Frontend Application:**
   Open `https://<stockwise-frontend>.onrender.com` in your browser.

---

## 9. End-to-End Verification Test

1. Open the deployed **StockWise** frontend.
2. Select or search for stock: **`TCS`** (or `INFY`, `RELIANCE`).
3. Click **Generate Prediction** on the `/prediction` page.
4. Verify:
   - Predicted Next-Trading-Day Close Price is calculated (Linear Regression).
   - Expected Direction **UP ↑** / **DOWN ↓** is classified (KNN).
   - Evaluation metrics ($MAE$, $RMSE$, $R^2$, Accuracy) are displayed.
   - Historical prediction record appears in the MongoDB prediction table.

---

## 10. Troubleshooting & Cold Starts

- **Render Free Tier Cold Starts:** Free Render instances spin down when idle. The first request after inactivity may take 30–50 seconds to boot up. Subsequent requests respond instantly.
- **`yfinance` Download Latency:** Historical price fetching runs in 1–3 seconds. The backend has a 35-second timeout buffer to handle peak market query latency.
- **MongoDB Connection Failed:** Check that `0.0.0.0/0` is active in MongoDB Atlas **Network Access** and verify that your username/password are correctly escaped in `MONGO_URI`.
