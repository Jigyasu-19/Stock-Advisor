import express from 'express';
import { getStockIndicators } from '../controllers/stockController.js';

const router = express.Router();

// GET /api/stocks/:symbol
router.get('/:symbol', getStockIndicators);

export default router;
