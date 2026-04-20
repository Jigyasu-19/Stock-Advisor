import React from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';

const SentimentDot = ({ sentiment }) => {
  const colors = { positive: 'var(--accent-green)', negative: 'var(--accent-red)', neutral: 'var(--accent-yellow)' };
  return (
    <span
      style={{
        display: 'inline-block', width: '7px', height: '7px',
        borderRadius: '50%', background: colors[sentiment] || colors.neutral,
        flexShrink: 0, marginTop: '5px',
      }}
    />
  );
};

const NewsPanel = ({ headlines = [] }) => {
  if (!headlines.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
        <Newspaper size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
        <div>No recent headlines available.</div>
      </div>
    );
  }

  return (
    <div id="news-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {headlines.map((h, i) => (
        <div
          key={i}
          style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            padding: '14px 0',
            borderBottom: i < headlines.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <SentimentDot sentiment={h.sentiment} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '4px' }}>
              {h.title}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: `var(--${h.sentiment === 'positive' ? 'accent-green' : h.sentiment === 'negative' ? 'accent-red' : 'accent-yellow'})`, textTransform: 'capitalize' }}>
                {h.sentiment}
              </span>
              {h.publishedAt && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(h.publishedAt).toLocaleDateString()}
                </span>
              )}
              {h.url && (
                <a href={h.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}>
                  Read <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsPanel;
