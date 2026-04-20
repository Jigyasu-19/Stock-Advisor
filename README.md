# AI Stock Advisor 🚀📈

A premium, full-stack stock intelligence platform delivering personalized **Buy / Hold / Sell** recommendations using live market data, technical indicators, sentiment scoring, and investor risk profiling.

Built with **React + Vite**, **Node.js + Express**, and **Firebase Firestore**.

---

## 📌 Project Overview

AI Stock Advisor combines real-time technical analysis with news sentiment to help investors make informed decisions. It uses a robust scoring engine (Base 50 + dynamic adjustments) to evaluate stocks based on:

- **Technical Momentum**: RSI, MACD, and SMA50 trend analysis.
- **Market Sentiment**: Real-time news analysis using sentiment-weighted scoring.
- **Risk Profiling**: Personalized score adjustments based on user risk tolerance (Conservative, Moderate, Aggressive).
- **Portfolio Intelligence**: Real-time P&L tracking and sector diversification analysis.

---

## ✨ Key Features

- **Google Authentication**: Secure Sign-In/Sign-Up integrated with Firebase.
- **Smart Recommendations**: Deterministic, logic-driven explanations for every trade decision.
- **Multi-Key Failover**: Advanced Twelve Data API management with automatic 3-key retry logic to bypass rate limits.
- **Real-Time Portfolio**: Persistent Firestore-backed portfolio tracking with live market valuation.
- **Dynamic Dashboard**: Interactive charts (Recharts), technical indicators, and real-time news panel.
- **Premium UI**: Glassmorphism aesthetic, dark mode support, and smooth micro-animations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Lucide React, Recharts, Tailwind CSS (optional-ready).
- **Backend**: Node.js, Express, Axios.
- **Database & Auth**: Firebase Firestore, Firebase Authentication (Google SSO).
- **Market APIs**: Twelve Data (Technical Data), NewsAPI (Sentiment).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase Project
- Twelve Data API Key(s)
- NewsAPI Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jigyasu-19/Stock-Advisor.git
   cd Stock-Advisor
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Fill in your API keys in server/.env
   ```

3. **Frontend Setup**:
   ```bash
   # Back in root
   npm install
   cp .env.example .env
   # Fill in your VITE_ prefixed keys in root .env
   ```

4. **Run Locally**:
   ```bash
   # Terminal 1 (Backend)
   cd server
   npm run dev

   # Terminal 2 (Frontend)
   # Back in root
   npm run dev
   ```

---

## 📦 Deployment

### Backend (Render/Railway)
- Root Directory: `server/`
- Build Command: `npm install`
- Start Command: `node app.js`

### Frontend (Netlify/Vercel)
- Build Command: `npm run build`
- Output Directory: `dist/`
- Environment Variables: Ensure `VITE_API_URL` points to your deployed backend URL.

---

## 📄 License
This project is for educational use as part of the Term-3 EndTerm Project.