import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { getScoreLabel, getConfidenceLabel } from '../utils/scoreCalculator.js';

const RecommendationCard = ({ data, onDetails }) => {
  const { label, colorClass } = getScoreLabel(data.score ?? 50);

  return (
    <div className="glass-card" id={`rec-card-${data.symbol}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '16px' }}>{data.symbol}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {new Date(data.createdAt || Date.now()).toLocaleTimeString()}
          </div>
        </div>
        <span className={`badge ${colorClass}`} style={{ fontSize: '13px', padding: '6px 14px' }}>{label}</span>
      </div>

      {/* Confidence + Score row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Score</div>
          <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-blue)' }}>
            {data.score ?? '—'}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Confidence</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {getConfidenceLabel(data.confidence)}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>({data.confidence}%)</span>
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      {data.explanation && (
        <div style={{ background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.12)', borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '11px', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            <Sparkles size={11} /> AI Insight
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.explanation}</p>
        </div>
      )}

      {onDetails && (
        <button className="btn btn-ghost" onClick={() => onDetails(data.symbol)} style={{ width: '100%', justifyContent: 'center' }}>
          View Details <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default RecommendationCard;
