import { fetchStockData } from '../services/stockService.js';

// GET /api/stocks/:symbol
export const getStockIndicators = async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await fetchStockData(symbol.toUpperCase());
    res.json({ success: true, data });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
};
