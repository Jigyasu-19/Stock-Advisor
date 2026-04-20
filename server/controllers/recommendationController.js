import { fetchStockData } from '../services/stockService.js';
import { fetchNewsSentiment } from '../services/newsService.js';
import { generateExplanation } from '../services/aiService.js';
import { computeTechnicalScore } from '../scoring/technicalScore.js';
import { computeSentimentScore } from '../scoring/sentimentScore.js';
import { computeRiskAdjustment } from '../scoring/riskAdjustment.js';
import {
  getUserProfile as getUserProfileFromStore,
  saveRecommendation,
} from '../services/firebaseService.js';

const BASE_SCORE = 100;

const getDecision = (score) => {
  if (score >= 80) return 'Strong Buy';
  if (score >= 65) return 'Buy';
  if (score >= 45) return 'Hold';
  return 'Sell';
};

const getConfidence = (score) => {
  // Map 0-100 score to 0-100 confidence. Distance from 50 = conviction.
  return Math.min(100, Math.round(Math.abs(score - 50) * 2.5));
};

// POST /api/recommendation
export const getRecommendation = async (req, res) => {
  const { symbol, userId } = req.body;

  if (!symbol) {
    return res.status(400).json({ success: false, error: 'symbol is required' });
  }

  try {
    // ── Step 1: Fetch stock indicators ─────────────────────────────────────
    const stockData = await fetchStockData(symbol.toUpperCase());

    // ── Step 2: Fetch news sentiment ───────────────────────────────────────
    const newsData = await fetchNewsSentiment(symbol);

    // ── Step 3: Compute technical score ────────────────────────────────────
    const techResult = computeTechnicalScore({
      rsi: stockData.rsi,
      macdSignal: stockData.macdSignal,
      priceVsSMA: stockData.priceVsSMA,
    });

    // ── Step 4: Compute sentiment score ────────────────────────────────────
    const sentResult = computeSentimentScore({
      positiveCount: newsData.positiveCount,
      negativeCount: newsData.negativeCount,
    });

    // ── Step 5: Fetch user risk profile ────────────────────────────────────
    let riskLevel = 'moderate';
    if (userId && userId !== 'test') {
      const user = await getUserProfileFromStore(userId).catch(() => null);
      if (user) riskLevel = user.riskLevel;
    }

    // ── Step 6: Apply risk adjustment ──────────────────────────────────────
    const riskResult = computeRiskAdjustment({
      riskLevel,
      indicators: { rsi: stockData.rsi, macdSignal: stockData.macdSignal, priceVsSMA: stockData.priceVsSMA },
    });

    // ── Step 7: Final score ────────────────────────────────────────────────
    const totalDelta = techResult.delta + sentResult.delta + riskResult.delta;
    const finalScore = Math.max(0, Math.min(100, BASE_SCORE + totalDelta));

    // ── Step 8: Decision ──────────────────────────────────────────────────
    const decision = getDecision(finalScore);
    const confidence = getConfidence(finalScore);

    // ── Step 9: Explanation (generated locally from templates) ───────────
    const explanation = generateExplanation({
      score: finalScore,
      technicalScore: techResult.delta,
      sentimentScore: sentResult.delta,
      riskAdjustment: riskResult.delta,
      decision,
    });

    // ── Step 10: Save recommendation ──────────────────────────────────────
    let rec = null;
    try {
      rec = await saveRecommendation({
        userId: userId || 'guest',
        stockSymbol: symbol.toUpperCase(),
        score: finalScore,
        decision,
        confidence,
        reason: explanation,
      });
    } catch (dbError) {
      console.warn('⚠️ Recommendation persistence skipped:', dbError.message);
    }

    // ── Return response ───────────────────────────────────────────────────
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        decision,
        score: finalScore,
        confidence,
        technicalScore: techResult.delta,
        sentimentScore: sentResult.delta,
        riskAdjustment: riskResult.delta,
        explanation,
        indicators: {
          rsi: stockData.rsi,
          macd: stockData.macdSignal,
          sma: stockData.priceVsSMA,
          latestClose: stockData.latestClose,
          sma50: stockData.sma50,
          sentiment: newsData.overallSentiment,
        },
        candles: stockData.candles,
        breakdown: [
          ...techResult.breakdown,
          ...sentResult.breakdown,
          ...riskResult.breakdown,
        ],
        headlines: newsData.headlines,
        recommendationId: rec?._id ?? null,
        createdAt:
          rec?.createdAt?.toDate?.()?.toISOString?.() ||
          rec?.createdAt ||
          new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Recommendation error:', error.message);
    res.status(502).json({ success: false, error: error.message });
  }
};
