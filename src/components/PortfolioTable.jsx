import React from 'react';
import { formatCurrency, formatPercent, calcPnL } from '../utils/scoreCalculator.js';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

const PortfolioTable = ({ holdings = [], currentPrices = {}, onRemove }) => {
  if (!holdings.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        No holdings yet. Add stocks from the Portfolio page.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" id="portfolio-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Buy Price</th>
            <th>Current Price</th>
            <th>Value</th>
            <th>P&amp;L</th>
            <th>Return %</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const currentPrice = currentPrices[h.stockSymbol]?.latestClose;
            const { pnl, pnlPct } = calcPnL(h.buyPrice, currentPrice, h.quantity);
            const isPositive = pnl >= 0;

            return (
              <tr key={h._id || h.stockSymbol}>
                <td className="symbol-cell">{h.stockSymbol}</td>
                <td>{h.quantity}</td>
                <td>{formatCurrency(h.buyPrice)}</td>
                <td>{currentPrice ? formatCurrency(currentPrice) : <span style={{ color: 'var(--text-muted)' }}>Loading…</span>}</td>
                <td>{currentPrice ? formatCurrency(currentPrice * h.quantity) : '—'}</td>
                <td>
                  <span className={isPositive ? 'positive' : 'negative'} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {currentPrice ? formatCurrency(pnl) : '—'}
                  </span>
                </td>
                <td className={isPositive ? 'positive' : 'negative'}>
                  {currentPrice ? formatPercent(pnlPct) : '—'}
                </td>
                <td>
                  <button 
                    onClick={() => onRemove(h.stockSymbol)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '4px' }}
                    title="Remove stock"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;
