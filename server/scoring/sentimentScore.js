/**
 * Sentiment Score
 * Base: 50 (neutral). Returns delta to add to base.
 */
export const computeSentimentScore = ({ positiveCount = 0, negativeCount = 0 }) => {
  let delta = 0;
  const breakdown = [];

  if (positiveCount > negativeCount) {
    delta += 15;
    breakdown.push({ factor: 'Positive news sentiment', delta: +15 });
  } else if (negativeCount > positiveCount) {
    delta -= 15;
    breakdown.push({ factor: 'Negative news sentiment', delta: -15 });
  } else {
    breakdown.push({ factor: 'Neutral news sentiment', delta: 0 });
  }

  return { delta, breakdown };
};
