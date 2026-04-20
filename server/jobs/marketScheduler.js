import cron from 'node-cron';
import { fetchStockData } from '../services/stockService.js';
import { fetchNewsSentiment } from '../services/newsService.js';
import { computeTechnicalScore } from '../scoring/technicalScore.js';
import { computeSentimentScore } from '../scoring/sentimentScore.js';
import { saveRecommendation } from '../services/firebaseService.js';

// Predefined watchlist — only these 2 symbols are refreshed
const WATCHLIST = ['AAPL', 'NVDA'];
const BASE_SCORE = 100;
const MAX_DAILY_CREDITS = 200;
const ESTIMATED_CREDITS_PER_SYMBOL = 1; // single time_series call per symbol

const getDecision = (score) => {
  if (score >= 80) return 'Strong Buy';
  if (score >= 65) return 'Buy';
  if (score >= 45) return 'Hold';
  return 'Sell';
};

const refreshSymbol = async (symbol) => {
  try {
    const stockData = await fetchStockData(symbol);
    const newsData = await fetchNewsSentiment(symbol);

    const techResult = computeTechnicalScore({
      rsi: stockData.rsi,
      macdSignal: stockData.macdSignal,
      priceVsSMA: stockData.priceVsSMA,
    });

    const sentResult = computeSentimentScore({
      positiveCount: newsData.positiveCount,
      negativeCount: newsData.negativeCount,
    });

    const finalScore = Math.max(0, Math.min(100, BASE_SCORE + techResult.delta + sentResult.delta));
    const decision = getDecision(finalScore);

    await saveRecommendation({
      userId: 'scheduler',
      stockSymbol: symbol,
      score: finalScore,
      decision,
      confidence: Math.min(100, Math.round(Math.abs(finalScore - 50) * 2.5)),
      reason: `Scheduled refresh. ${newsData.overallSentiment} sentiment, RSI ${stockData.rsi.toFixed(1)}.`,
    });

    console.log(`✅ Scheduler refreshed ${symbol}: ${decision} (score: ${finalScore})`);
  } catch (error) {
    // Log and continue — never crash the scheduler
    console.error(`❌ Scheduler failed for ${symbol}: ${error.message}`);
  }
};

const runScheduler = async () => {
  console.log(`🕐 Market scheduler running at ${new Date().toISOString()}`);
  const estimatedDailyCredits = WATCHLIST.length * 8 * ESTIMATED_CREDITS_PER_SYMBOL;
  if (estimatedDailyCredits > MAX_DAILY_CREDITS) {
    console.warn(
      `⚠️ Estimated scheduler usage (${estimatedDailyCredits}/day) exceeds ${MAX_DAILY_CREDITS} credit budget.`
    );
  }
  for (const symbol of WATCHLIST) {
    await refreshSymbol(symbol);
    // Small delay to avoid rate-limit bursts
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log('✅ Scheduler run complete.');
};

// Cron: every hour, market hours (9–16), weekdays only
// 0 * 9-16 * * 1-5
cron.schedule('0 * 9-16 * * 1-5', runScheduler, {
  timezone: 'America/New_York', // NYSE timezone
});

console.log('📅 Market scheduler registered (hourly, 9–16 ET, Mon–Fri)');
