import React, { useEffect, useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PortfolioTable from '../components/PortfolioTable.jsx';
import { useUser } from '../context/UserContext.jsx';
import { addToPortfolio, getPortfolio } from '../services/api.js';
import { getStockIndicators } from '../services/api.js';
import { formatCurrency } from '../utils/scoreCalculator.js';

const PIE_COLORS = ['#63b3ed','#4fd1c5','#9f7aea','#fc8181','#f6e05e','#68d391','#fbd38d','#b794f4'];

const SECTOR_MAP = {
  AAPL: 'Technology', MSFT: 'Technology', GOOGL: 'Technology',
  TSLA: 'Consumer', NVDA: 'Technology',
};

const Portfolio = () => {
  const { profile, updateUserPortfolio } = useUser();
  const holdings = profile?.portfolio || [];
  const [currentPrices, setCurrentPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [form, setForm] = useState({ stockSymbol: '', quantity: '', buyPrice: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const userId = profile._id || 'guest';

  const fetchPrices = async (holdingsList) => {
    setLoadingPrices(true);
    const prices = {};
    for (const h of holdingsList) {
      if (!h || !h.stockSymbol) continue;
      try {
        const res = await getStockIndicators(h.stockSymbol);
        prices[h.stockSymbol] = res.data.data;
      } catch {}
    }
    setCurrentPrices(prices);
    setLoadingPrices(false);
  };

  useEffect(() => {
    if (holdings.length) fetchPrices(holdings);
  }, [holdings?.length]); // eslint-disable-line

  const handleAdd = async (e) => {
    e.preventDefault();
    if (userId === 'guest') {
      setAddError('Please sign in with Google to enable portfolio tracking.');
      return;
    }
    
    const symbol = form.stockSymbol.toUpperCase().trim();
    if (!symbol) return;
    
    setAdding(true);
    setAddError(null);
    try {
      // 1. Validate symbol exists by attempting to fetch its indicators
      await getStockIndicators(symbol);

      // 2. Check if already exists in portfolio to merge quantities, or add new
      const existingIndex = holdings.findIndex(h => h.stockSymbol === symbol);
      let updatedPortfolio = [...holdings];
      
      if (existingIndex > -1) {
        updatedPortfolio[existingIndex] = {
           ...updatedPortfolio[existingIndex],
           quantity: Number(updatedPortfolio[existingIndex].quantity) + Number(form.quantity),
           buyPrice: Number(form.buyPrice) // Simplistic overwrite or advanced avg could be done here
        };
      } else {
        updatedPortfolio.push({
           _id: Date.now().toString(),
           stockSymbol: symbol,
           quantity: Number(form.quantity),
           buyPrice: Number(form.buyPrice)
        });
      }

      await updateUserPortfolio(updatedPortfolio);
      
      setForm({ stockSymbol: '', quantity: '', buyPrice: '' });
      setShowForm(false);
    } catch (err) {
      setAddError('Symbol does not exist or is incorrect.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (symbolToRemove) => {
    const updatedPortfolio = holdings.filter(h => h.stockSymbol !== symbolToRemove);
    await updateUserPortfolio(updatedPortfolio);
  };

  // Sector concentration and P&L for pie chart and summary
  const sectorMap = {};
  let totalInvested = 0;
  let totalValue = 0;

  holdings.forEach((h) => {
    const sector = SECTOR_MAP[h.stockSymbol] || 'Other';
    const currentPrice = currentPrices[h.stockSymbol]?.latestClose || h.buyPrice;
    
    const holdingCost = h.buyPrice * h.quantity;
    const holdingValue = currentPrice * h.quantity;
    
    sectorMap[sector] = (sectorMap[sector] || 0) + holdingValue;
    totalInvested += holdingCost;
    totalValue += holdingValue;
  });

  const pieData = Object.entries(sectorMap).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  
  const totalPnL = totalValue - totalInvested;
  const isPositivePnL = totalPnL >= 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="page-title">Portfolio</h2>
          <p className="page-subtitle">Track holdings, P&amp;L, and diversification</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((p) => !p)} id="add-holding-btn">
          <Plus size={14} /> Add Holding
        </button>
      </div>

      {/* Add Holding Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-title"><Plus size={14} /> New Holding</div>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label">Symbol</label>
              <input id="holding-symbol" className="form-input" value={form.stockSymbol} onChange={(e) => setForm((p) => ({ ...p, stockSymbol: e.target.value.toUpperCase() }))} placeholder="AAPL" required style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input id="holding-qty" className="form-input" type="number" min="1" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="10" required />
            </div>
            <div className="form-group">
              <label className="form-label">Buy Price ($)</label>
              <input id="holding-price" className="form-input" type="number" step="0.01" min="0" value={form.buyPrice} onChange={(e) => setForm((p) => ({ ...p, buyPrice: e.target.value }))} placeholder="150.00" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={adding}>{adding ? 'Adding…' : 'Add'}</button>
          </form>
          {addError && <div className="error-box" style={{ marginTop: '12px' }}>{addError}</div>}
        </div>
      )}

      {/* Summary tiles */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-tile">
          <span className="stat-label">Total Value</span>
          <span className="stat-value" style={{ fontSize: '20px' }}>{formatCurrency(totalValue)}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Total P&amp;L</span>
          <span className="stat-value" style={{ fontSize: '20px', color: isPositivePnL ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {isPositivePnL ? '+' : ''}{formatCurrency(totalPnL)}
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Holdings</span>
          <span className="stat-value" style={{ fontSize: '20px' }}>{holdings.length}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Market Data</span>
          <span style={{ fontSize: '13px', marginTop: '6px', color: loadingPrices ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
            {loadingPrices ? 'Updating…' : 'Live'}
          </span>
        </div>
      </div>

      {/* Holdings Table + Pie Chart */}
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="card">
          <div className="section-title"><Briefcase size={14} /> Holdings</div>
          <PortfolioTable holdings={holdings} currentPrices={currentPrices} onRemove={handleRemove} />
        </div>

        <div className="card">
          <div className="section-title">Sector Allocation</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Add holdings to see sector allocation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
