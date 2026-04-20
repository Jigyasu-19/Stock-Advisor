import express from 'express';
import { getRecommendation } from '../controllers/recommendationController.js';

const router = express.Router();

// POST /api/recommendation
router.post('/recommendation', getRecommendation);

export default router;
