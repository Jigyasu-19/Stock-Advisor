/**
 * Risk Adjustment Score
 * Adjusts final score based on user risk profile.
 */

// Volatility is estimated as a high RSI spread (RSI > 65 = high momentum/volatility)
const isHighVolatility = ({ rsi }) => rsi > 65;
const hasMomentum = ({ macdSignal, priceVsSMA }) =>
  macdSignal === 'bullish' && priceVsSMA === 'above';

export const computeRiskAdjustment = ({ riskLevel, indicators }) => {
  let delta = 0;
  const breakdown = [];

  if (!riskLevel) return { delta: 0, breakdown: [] };

  switch (riskLevel.toLowerCase()) {
    case 'conservative':
      if (isHighVolatility(indicators)) {
        delta -= 20;
        breakdown.push({ factor: 'Conservative user + high volatility', delta: -20 });
      }
      break;

    case 'aggressive':
      if (hasMomentum(indicators)) {
        delta += 15;
        breakdown.push({ factor: 'Aggressive user + strong momentum', delta: +15 });
      }
      break;

    case 'moderate':
    default:
      // No adjustment for moderate risk
      breakdown.push({ factor: 'Moderate risk — no adjustment', delta: 0 });
      break;
  }

  return { delta, breakdown };
};
