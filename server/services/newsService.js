import axios from 'axios';

// MVP keyword-based sentiment scoring
const POSITIVE_KEYWORDS = ['profit', 'growth', 'expansion', 'beat', 'upgrade'];
const NEGATIVE_KEYWORDS = ['loss', 'fraud', 'lawsuit', 'downgrade', 'decline'];

const scoreHeadline = (headline) => {
  const lower = headline.toLowerCase();
  let positive = 0;
  let negative = 0;
  POSITIVE_KEYWORDS.forEach((kw) => { if (lower.includes(kw)) positive++; });
  NEGATIVE_KEYWORDS.forEach((kw) => { if (lower.includes(kw)) negative++; });
  return { positive, negative };
};

export const fetchNewsSentiment = async (symbol, companyName = '') => {
  try {
    const query = companyName ? `${companyName} stock` : `${symbol} stock`;
    const res = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY,
      },
      timeout: 8000,
    });

    const articles = res.data.articles || [];
    let positiveCount = 0;
    let negativeCount = 0;
    const headlines = [];

    articles.forEach((article) => {
      const text = `${article.title || ''} ${article.description || ''}`;
      const { positive, negative } = scoreHeadline(text);
      positiveCount += positive;
      negativeCount += negative;
      if (article.title) {
        headlines.push({
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt,
          sentiment: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral',
        });
      }
    });

    const overallSentiment =
      positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';

    return { positiveCount, negativeCount, overallSentiment, headlines: headlines.slice(0, 10) };
  } catch (error) {
    console.error('❌ NewsAPI error:', error.message);
    // Graceful fallback — neutral sentiment
    return { positiveCount: 0, negativeCount: 0, overallSentiment: 'neutral', headlines: [] };
  }
};
