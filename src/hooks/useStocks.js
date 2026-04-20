import { useState, useCallback } from 'react';
import { getRecommendation, getStockIndicators } from '../services/api.js';

export const useStocks = () => {
  const [stockData, setStockData] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const fetchRecommendation = useCallback(async (symbol, userId = 'guest') => {
    setLoading((prev) => ({ ...prev, [symbol]: true }));
    setErrors((prev) => ({ ...prev, [symbol]: null }));

    try {
      const res = await getRecommendation(symbol, userId);
      const data = res.data.data;
      setRecommendations((prev) => ({ ...prev, [symbol]: data }));
      // Also cache stock data from recommendation response
      setStockData((prev) => ({ ...prev, [symbol]: { ...data.indicators, candles: data.candles } }));
      return data;
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to fetch';
      setErrors((prev) => ({ ...prev, [symbol]: msg }));
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, [symbol]: false }));
    }
  }, []);

  const fetchStockOnly = useCallback(async (symbol) => {
    setLoading((prev) => ({ ...prev, [symbol]: true }));
    setErrors((prev) => ({ ...prev, [symbol]: null }));
    try {
      const res = await getStockIndicators(symbol);
      setStockData((prev) => ({ ...prev, [symbol]: res.data.data }));
      return res.data.data;
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to fetch';
      setErrors((prev) => ({ ...prev, [symbol]: msg }));
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, [symbol]: false }));
    }
  }, []);

  return {
    stockData,
    recommendations,
    loading,
    errors,
    fetchRecommendation,
    fetchStockOnly,
  };
};
