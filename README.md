# 🍃 LeafScan - Lightweight Vegetable Leaf Disease Detector

> An end-to-end, on-device vegetable leaf disease diagnostic system. Powered by a dual-head MobileNetV3-Small deep learning model running in a glassmorphic React PWA, backed by a lightweight Express & MongoDB auth and history service.

---

## 📌 Project Overview & Structure

```
leafscan/
├── dataset/                     # Mendeley Data collection (1,923 images across 17 classes)
│   └── README.md                # Expected folder layout instructions
├── model/                       # Deep learning pipeline, training, and evaluation
│   ├── LeafScan_Training_Colab.ipynb # Google Colab GPU training notebook
│   ├── train.py                 # 2-stage training CLI script
│   ├── evaluate.py              # Test set evaluation & confusion matrix generation
│   ├── gradcam.py               # Grad-CAM attention heatmap generator
│   ├── export_tfjs.py           # TensorFlow.js converter with float16 quantization
│   ├── requirements.txt         # Python dependencies
│   └── results/                 # Evaluation metrics, plots, and labels.json
├── app/                         # Frontend: React 18 + Vite + Tailwind CSS PWA
│   ├── src/                     # React components, screens, 3D leaf hero, TF.js inference
│   ├── public/                  # Static assets, Web App Manifest, icons, TF.js model
│   └── package.json             # Frontend dependencies
├── server/                      # Backend: Node.js + Express + MongoDB (Auth & Scans)
│   ├── src/                     # Mongoose models, auth middleware, and REST routes
│   ├── .env.example             # Backend environment template
│   └── package.json             # Backend dependencies
├── REPORT_SUMMARY.md            # Comprehensive project report & novelties
└── README.md                    # Setup and deployment documentation
```

---

## 🚀 1. Model Training & Export

### Option A: Train via Google Colab (Recommended for GPU)
1. Open [`model/LeafScan_Training_Colab.ipynb`](file:///c:/Users/Acer/Desktop/scanLeaf/model/LeafScan_Training_Colab.ipynb) in **Google Colab**.
2. Set the runtime hardware accelerator to **T4 GPU** (`Runtime > Change runtime type > T4 GPU`).
3. Upload and extract your Mendeley dataset zip file into the Colab environment.
4. Run all cells to perform:
   - Stratified 70/15/15 train/val/test split with class weighting.
   - Stage 1: Frozen MobileNetV3-Small head training.
   - Stage 2: Top layers fine-tuning with low learning rate.
   - Test evaluation (Accuracy, F1-scores, Confusion Matrix plots).
   - Export to TensorFlow.js (`/model.json` and `.bin` shards).

### Option B: Train Locally with Python
1. Navigate to the `model/` folder and install dependencies:
   ```bash
   cd model
   pip install -r requirements.txt
   ```
2. Place the dataset folders inside `dataset/` (see [`dataset/README.md`](file:///c:/Users/Acer/Desktop/scanLeaf/dataset/README.md)).
3. Run the training script:
   ```bash
   python train.py --data_dir ../dataset --output_dir results --batch_size 32
   ```
4. Export the trained model to the frontend:
   ```bash
   python export_tfjs.py --model_path results/best_leafscan_model.keras --output_dir ../app/public/model
   ```

---

## 💻 2. Running Locally

### Step 2.1: Start the Backend Server (`/server`)
1. Open a terminal in `/server`:
   ```bash
   cd server
   npm install
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Update `MONGO_URI` with your MongoDB connection string (or run local MongoDB at `mongodb://127.0.0.1:27017/leafscan`).
4. Start the server:
   ```bash
   npm start
   ```
   > The server will start on `http://localhost:5000` with the health check live at `http://localhost:5000/api/health`.

### Step 2.2: Start the React PWA App (`/app`)
1. Open a second terminal in `/app`:
   ```bash
   cd app
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🌐 3. Deployment Guide

### A. Deploy Frontend (`/app`) to Vercel
1. Push your repository to **GitHub**.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project** and import your repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the Environment Variable:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://leafscan-api.onrender.com/api`)
5. Click **Deploy**.
> **HTTPS Requirement**: Vercel automatically supplies SSL/HTTPS, which is required for browser camera access (`getUserMedia`) and PWA installation.

---

### B. Deploy Backend (`/server`) to Render (Free Tier)
1. In the [Render Dashboard](https://render.com), click **New > Web Service** and connect your GitHub repository.
2. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
3. Configure Environment Variables in Render:
   - `MONGO_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`)
   - `JWT_SECRET`: A long secure random string
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://leafscan.vercel.app`)
   - `PORT`: `5000` (Render binds automatically)
4. Click **Create Web Service**.

> ⚠️ **Note on Render Free Tier**: Free tier instances spin down after 15 minutes of inactivity. When a request arrives, it may take **~30–45 seconds** to wake up. LeafScan includes built-in offline caching and queueing so that scans are **never blocked or lost** while the server is waking up.

---

## ✨ Features & Novelties
- **Dual-Head Architecture**: One backbone outputs both Crop classification (4 classes) and Disease condition (17 classes).
- **Grad-CAM Attention Heatmaps**: Transparent overlay visualizes convolutional feature activations directly on the scanned leaf with an opacity slider.
- **60% Confidence Safety Gate**: Automatically flags ambiguous scans with photography guidance.
- **100% Offline-First Guest Mode**: TF.js runs directly in-browser using WebGL/WASM without requiring user login or cloud APIs.
- **Modern Glassmorphic UI**: Featuring an interactive 3D rotating procedural leaf hero, parallax tilt cards, circular confidence animations, and dark/light themes.
