import React from 'react';
import { Shield } from 'lucide-react';

const LEVELS = ['conservative', 'moderate', 'aggressive'];
const COLORS = {
  conservative: '#63b3ed',
  moderate: '#f6e05e',
  aggressive: '#fc8181',
};
const DESCRIPTIONS = {
  conservative: 'Low risk, steady growth preferred',
  moderate: 'Balanced risk and reward',
  aggressive: 'High risk, high reward potential',
};

const RiskMeter = ({ riskLevel = 'moderate' }) => {
  const idx = LEVELS.indexOf(riskLevel);
  const fillPct = ((idx + 1) / 3) * 100;
  const color = COLORS[riskLevel] || COLORS.moderate;

  return (
    <div id="risk-meter" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={16} color={color} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          {riskLevel} Risk
        </span>
      </div>

      {/* Track */}
      <div style={{ position: 'relative', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${fillPct}%`,
            background: `linear-gradient(90deg, #63b3ed, ${color})`,
            borderRadius: '4px',
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {LEVELS.map((lvl) => (
          <span
            key={lvl}
            style={{
              fontSize: '11px',
              fontWeight: lvl === riskLevel ? 600 : 400,
              color: lvl === riskLevel ? color : 'var(--text-muted)',
              textTransform: 'capitalize',
              transition: 'color 0.3s',
            }}
          >
            {lvl}
          </span>
        ))}
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{DESCRIPTIONS[riskLevel]}</p>
    </div>
  );
};

export default RiskMeter;
