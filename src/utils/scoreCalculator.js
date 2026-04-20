// Maps numeric score to label, colour class, and description
export const getScoreLabel = (score) => {
  if (score >= 80) return { label: 'Strong Buy', colorClass: 'badge-strong-buy', textClass: 'positive', description: 'Very strong conviction' };
  if (score >= 65) return { label: 'Buy',        colorClass: 'badge-buy',        textClass: 'positive', description: 'Positive outlook' };
  if (score >= 45) return { label: 'Hold',       colorClass: 'badge-hold',       textClass: 'neutral',  description: 'Mixed signals' };
  return               { label: 'Sell',          colorClass: 'badge-sell',       textClass: 'negative', description: 'Weak indicators' };
};

// Confidence label from 0-100 number
export const getConfidenceLabel = (confidence) => {
  if (confidence >= 80) return 'Very High';
  if (confidence >= 60) return 'High';
  if (confidence >= 40) return 'Moderate';
  if (confidence >= 20) return 'Low';
  return 'Very Low';
};

// Format currency
export const formatCurrency = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Format percent
export const formatPercent = (value) => {
  if (value == null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// P&L calculation
export const calcPnL = (buyPrice, currentPrice, quantity) => {
  if (!buyPrice || !currentPrice || !quantity) return { pnl: 0, pnlPct: 0 };
  const pnl = (currentPrice - buyPrice) * quantity;
  const pnlPct = ((currentPrice - buyPrice) / buyPrice) * 100;
  return { pnl, pnlPct };
};
