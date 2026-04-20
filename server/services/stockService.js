import axios from 'axios';
import { deriveTechnicalIndicators } from '../scoring/technicalScore.js';

// ─── Key Configuration ──────────────────────────────────────────────────────
const keys = [
  process.env.TWELVE_DATA_KEY_1,
  process.env.TWELVE_DATA_KEY_2,
  process.env.TWELVE_DATA_KEY_3
].filter(Boolean);

/**
 * Detects if an error (from axios or custom) is a rate limit/quota issue.
 */
export const isRateLimitError = (error) => {
  if (error?.response?.status === 429) return true;
  
  // Normalize checking for both the message in the response and the error itself
  const msg = String(
    error?.response?.data?.message || 
    error?.message || 
    error?.code || 
    ''
  ).toLowerCase();

  return (
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('exceeded') ||
    msg.includes('limit') ||
    msg.includes('credits') ||
    msg.includes('429')
  );
};

// Async delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Internal helper to perform the network request.
 */
const requestTimeSeries = async (params, key) => {
  const BASE = 'https://api.twelvedata.com';
  const res = await axios.get(`${BASE}/time_series`, {
    params: { ...params, apikey: key, format: 'JSON' },
    timeout: 10000,
  });
  return res.data;
};

/**
 * Public API: Fetch stock data with multi-key failover logic.
 * Every request strictly starts with Key 1 and progresses only on failure.
 */
export const fetchStockData = async (symbol) => {
  const maxAttempts = keys.length;
  let currentKeyIndex = 0;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const activeKey = keys[currentKeyIndex];
    if (!activeKey) {
      console.error('❌ No API keys available in the configuration.');
      throw new Error('Twelve Data API keys are missing.');
    }

    try {
      attempts++;
      const data = await requestTimeSeries(
        { symbol, interval: '1day', outputsize: 60 },
        activeKey
      );

      // Twelve Data often returns 200 OK with an error payload for quota issues
      if (data.status === 'error') {
        const apiError = new Error(data.message || data.code || 'API Error');
        // Attach data so isRateLimitError can inspect it
        apiError.response = { data }; 
        throw apiError;
      }

      if (!data.values || data.values.length === 0) {
        throw new Error(`Insufficient data returned for symbol: ${symbol}`);
      }

      const indicators = deriveTechnicalIndicators(data.values);
      return { symbol: symbol.toUpperCase(), ...indicators };

    } catch (error) {
      if (isRateLimitError(error)) {
        // If we still have backup keys, switch and retry
        if (currentKeyIndex < keys.length - 1) {
          console.warn(`Key ${currentKeyIndex + 1} exhausted, switching to key ${currentKeyIndex + 2} for ${symbol}`);
          
          currentKeyIndex++;
          await delay(300); // 300ms delay between retries
          continue; // Move to next iteration of the while loop with new key
        } else {
          // No more keys left
          console.error(`❌ fetchStockData(${symbol}): All ${keys.length} keys exhausted.`);
          throw new Error('Twelve Data API quota exhausted across all available keys.');
        }
      } else {
        // For non-quota errors (invalid symbol, network down), throw immediately
        console.error(`❌ fetchStockData(${symbol}) failed:`, error.message);
        throw error;
      }
    }
  }

  // Fallback (should be unreachable given the logic above)
  throw new Error('Maximum retry logic exceeded');
};
