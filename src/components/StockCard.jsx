import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getScoreLabel, formatCurrency } from '../utils/scoreCalculator.js';

const ScoreBar = ({ score }) => (
  <div className="score-bar-wrap">
    <div className="score-bar-track">
      <div className="score-bar-fill" style={{ width: `${score}%` }} />
    </div>
    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{score}/100</span>
  </div>
);

const StockCard = ({ symbol, data, onClick }) => {
  const { label, colorClass, textClass } = getScoreLabel(data.score ?? 50);

  const Icon =
    data.decision === 'Strong Buy' || data.decision === 'Buy'
      ? TrendingUp
      : data.decision === 'Sell'
      ? TrendingDown
      : Minus;

  return (
    <div
      className="card"
      onClick={() => onClick && onClick(symbol)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      id={`stock-card-${symbol}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
            {symbol}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>
            {data.latestClose ? formatCurrency(data.latestClose) : '—'}
          </div>
        </div>
        <span className={`badge ${colorClass}`}>
          <Icon size={12} />
          {label}
        </span>
      </div>

      <ScoreBar score={data.score ?? 50} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span>RSI <strong style={{ color: 'var(--text-primary)' }}>{data.rsi?.toFixed(1) ?? '—'}</strong></span>
        <span>MACD <strong className={data.macd === 'bullish' ? 'positive' : 'negative'}>{data.macd ?? '—'}</strong></span>
        <span>SMA <strong className={data.sma === 'above' ? 'positive' : 'negative'}>{data.sma ?? '—'}</strong></span>
      </div>
    </div>
  );
};

export default StockCard;
