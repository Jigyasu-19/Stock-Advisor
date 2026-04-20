import express from 'express';
import {
  saveUserProfile,
  getUserProfile,
  addToPortfolio,
  getPortfolio,
} from '../controllers/userController.js';

const router = express.Router();

// POST /api/user/profile
router.post('/profile', saveUserProfile);

// GET /api/user/:id
router.get('/:id', getUserProfile);

// POST /api/portfolio/add
router.post('/portfolio/add', addToPortfolio);

// GET /api/portfolio/:userId
router.get('/portfolio/:userId', getPortfolio);

export default router;
