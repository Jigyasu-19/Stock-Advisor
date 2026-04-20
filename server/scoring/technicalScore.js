/**
 * Technical Score
 * Base: 50 (neutral). Returns delta to add to base.
 * Indicators are derived from time-series candle data.
 */
export const deriveTechnicalIndicators = (values = []) => {
  if (!Array.isArray(values) || values.length < 26) {
    throw new Error('Insufficient candle data to compute indicators');
  }

  const closes = values.map((v) => parseFloat(v.close)).filter((v) => Number.isFinite(v));
  if (closes.length < 26) {
    throw new Error('Invalid candle close data');
  }

  const latestClose = closes[0];
  const smaWindow = closes.slice(0, Math.min(50, closes.length));
  const sma50 = smaWindow.reduce((sum, c) => sum + c, 0) / smaWindow.length;

  const gains = [];
  const losses = [];
  for (let i = 0; i < 14; i += 1) {
    const diff = closes[i] - closes[i + 1];
    if (diff >= 0) gains.push(diff);
    else losses.push(Math.abs(diff));
  }

  const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  const ema = (data, period) => {
    const k = 2 / (period + 1);
    let emaVal = data[data.length - 1];
    for (let i = data.length - 2; i >= 0; i -= 1) {
      emaVal = data[i] * k + emaVal * (1 - k);
    }
    return emaVal;
  };

  const ema12 = ema(closes.slice(0, 12).reverse(), 12);
  const ema26 = ema(closes.slice(0, 26).reverse(), 26);
  const macdValue = ema12 - ema26;

  return {
    latestClose,
    sma50: parseFloat(sma50.toFixed(4)),
    rsi: parseFloat(rsi.toFixed(2)),
    macd: parseFloat(macdValue.toFixed(4)),
    macdSignal: macdValue > 0 ? 'bullish' : 'bearish',
    priceVsSMA: latestClose > sma50 ? 'above' : 'below',
    candles: values.slice(0, 30).map((v) => ({
      datetime: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseInt(v.volume || 0, 10),
    })),
  };
};

export const computeTechnicalScore = ({ rsi, macdSignal, priceVsSMA }) => {
  let delta = 0;
  const breakdown = [];

  // RSI scoring
  if (rsi < 30) {
    delta += 20;
    breakdown.push({ factor: 'RSI oversold (<30)', delta: +20 });
  } else if (rsi <= 50) {
    delta += 10;
    breakdown.push({ factor: 'RSI neutral-low (30-50)', delta: +10 });
  } else if (rsi > 70) {
    delta -= 20;
    breakdown.push({ factor: 'RSI overbought (>70)', delta: -20 });
  } else {
    breakdown.push({ factor: 'RSI neutral (50-70)', delta: 0 });
  }

  // MACD scoring
  if (macdSignal === 'bullish') {
    delta += 20;
    breakdown.push({ factor: 'MACD bullish crossover', delta: +20 });
  } else if (macdSignal === 'bearish') {
    delta -= 20;
    breakdown.push({ factor: 'MACD bearish crossover', delta: -20 });
  }

  // SMA50 scoring
  if (priceVsSMA === 'above') {
    delta += 15;
    breakdown.push({ factor: 'Price above SMA50', delta: +15 });
  } else {
    delta -= 15;
    breakdown.push({ factor: 'Price below SMA50', delta: -15 });
  }

  return { delta, breakdown };
};
