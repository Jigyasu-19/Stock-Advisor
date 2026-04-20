import {
  getPortfolio as getPortfolioFromStore,
  getUserProfile as getUserProfileFromStore,
  savePortfolioHolding,
  saveUserProfile as saveUserProfileToStore,
} from '../services/firebaseService.js';

// POST /api/user/profile
export const saveUserProfile = async (req, res) => {
  const { userId, name, age, riskLevel, investmentAmount, holdingPeriod, sectors } = req.body;
  try {
    const resolvedUserId = userId || `user-${(name || 'guest').toLowerCase().replace(/\s+/g, '-')}`;
    const user = await saveUserProfileToStore(resolvedUserId, {
      name,
      age: age ? Number(age) : null,
      riskLevel,
      investmentAmount: investmentAmount ? Number(investmentAmount) : 0,
      holdingPeriod,
      sectors: sectors || [],
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/user/:id
export const getUserProfile = async (req, res) => {
  try {
    const user = await getUserProfileFromStore(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// POST /api/portfolio/add
export const addToPortfolio = async (req, res) => {
  const { userId, stockSymbol, quantity, buyPrice } = req.body;
  try {
    const holding = await savePortfolioHolding({ userId, stockSymbol, quantity, buyPrice });
    res.json({ success: true, data: holding });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/portfolio/:userId
export const getPortfolio = async (req, res) => {
  try {
    const holdings = await getPortfolioFromStore(req.params.userId);
    res.json({ success: true, data: holdings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
