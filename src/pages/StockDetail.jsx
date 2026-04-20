import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import RecommendationCard from '../components/RecommendationCard.jsx';
import NewsPanel from '../components/NewsPanel.jsx';
import { useStocks } from '../hooks/useStocks.js';
import { useUser } from '../context/UserContext.jsx';
import { formatCurrency } from '../utils/scoreCalculator.js';

const IndicatorTile = ({ label, value, sub, colorClass }) => (
  <div className="stat-tile">
    <span className="stat-label">{label}</span>
    <span className={`stat-value ${colorClass || ''}`} style={{ fontSize: '20px' }}>{value}</span>
    {sub && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</span>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{formatCurrency(payload[0].value)}</div>
    </div>
  );
};

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  const { recommendations, loading, errors, fetchRecommendation } = useStocks();
  const [localLoading, setLocalLoading] = useState(false);

  const load = async () => {
    setLocalLoading(true);
    try { await fetchRecommendation(symbol, profile._id || 'guest'); } catch {}
    setLocalLoading(false);
  };

  useEffect(() => {
    if (!recommendations[symbol]) load();
  }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  const rec = recommendations[symbol];
  const isLoading = loading[symbol] || localLoading;
  const err = errors[symbol];

  // Build chart data from candles (newest → oldest from API, reverse for chart)
  const chartData = rec?.candles
    ? [...rec.candles].reverse().map((c) => ({ date: c.datetime?.slice(0, 10), close: c.close }))
    : [];

  if (isLoading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Analyzing {symbol}…</span>
      </div>
    );
  }

  if (err && !rec) {
    return (
      <div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}><ArrowLeft size={14} /> Back</button>
        <div className="error-box">{err}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}><ArrowLeft size={14} /></button>
        <div>
          <h2 className="page-title" style={{ fontSize: '22px' }}>{symbol}</h2>
          {rec && <p className="page-subtitle">Last updated {new Date(rec.createdAt || Date.now()).toLocaleString()}</p>}
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={load} id={`refresh-${symbol}`}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {rec && (
        <>
          {/* Indicator tiles */}
          <div className="grid-4" style={{ marginBottom: '24px' }}>
            <IndicatorTile label="Price" value={formatCurrency(rec.indicators?.latestClose)} />
            <IndicatorTile
              label="RSI (14)"
              value={rec.indicators?.rsi?.toFixed(1)}
              sub={rec.indicators?.rsi < 30 ? 'Oversold' : rec.indicators?.rsi > 70 ? 'Overbought' : 'Neutral'}
              colorClass={rec.indicators?.rsi < 30 ? 'positive' : rec.indicators?.rsi > 70 ? 'negative' : ''}
            />
            <IndicatorTile
              label="MACD"
              value={rec.indicators?.macd === 'bullish' ? '▲ Bullish' : '▼ Bearish'}
              colorClass={rec.indicators?.macd === 'bullish' ? 'positive' : 'negative'}
            />
            <IndicatorTile
              label="Price vs SMA50"
              value={rec.indicators?.sma === 'above' ? '↑ Above' : '↓ Below'}
              sub={`SMA50: ${formatCurrency(rec.indicators?.sma50)}`}
              colorClass={rec.indicators?.sma === 'above' ? 'positive' : 'negative'}
            />
          </div>

          {/* Line Chart */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="section-title">Price History (30 Days)</div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(d) => d?.slice(5)} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(0)}`} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="close" stroke="var(--accent-blue)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--accent-cyan)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No chart data available</div>
            )}
          </div>

          {/* Recommendation + Score Breakdown + News */}
          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <RecommendationCard data={rec} />

              {/* Score Breakdown */}
              {rec.breakdown && (
                <div className="card">
                  <div className="section-title"><Sparkles size={14} /> Score Breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rec.breakdown.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.factor}</span>
                        <span className={item.delta > 0 ? 'positive' : item.delta < 0 ? 'negative' : 'neutral'} style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                          {item.delta > 0 ? '+' : ''}{item.delta}
                        </span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Final Score</span>
                      <span style={{ color: 'var(--accent-blue)', fontFamily: 'JetBrains Mono' }}>{rec.score}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <div className="section-title">Related News</div>
              <NewsPanel headlines={rec.headlines || []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockDetail;
