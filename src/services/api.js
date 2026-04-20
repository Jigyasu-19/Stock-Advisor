import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// ─── Stock Endpoints ──────────────────────────────────────────────────────
export const getStockIndicators = (symbol) => api.get(`/stocks/${symbol}`);

// ─── Recommendation Endpoint ──────────────────────────────────────────────
export const getRecommendation = (symbol, userId = 'guest') =>
  api.post('/recommendation', { symbol, userId });

// ─── User Endpoints ───────────────────────────────────────────────────────
export const saveUserProfile = (profileData) => api.post('/user/profile', profileData);
export const getUserById = (id) => api.get(`/user/${id}`);

// ─── Portfolio Endpoints ──────────────────────────────────────────────────
export const addToPortfolio = (data) => api.post('/user/portfolio/add', data);
export const getPortfolio = (userId) => api.get(`/user/portfolio/${userId}`);

export default api;
