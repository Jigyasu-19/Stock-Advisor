import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, RefreshCw } from 'lucide-react';
import StockCard from '../components/StockCard.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import NewsPanel from '../components/NewsPanel.jsx';
import { useStocks } from '../hooks/useStocks.js';
import { useUser } from '../context/UserContext.jsx';

const WATCHLIST = ['AAPL', 'NVDA'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useUser();
  const { recommendations, loading, errors, fetchRecommendation } = useStocks();
  const [activeRec, setActiveRec] = useState(null);
  const [fetching, setFetching] = useState(false);

  const loadAll = async () => {
    setFetching(true);
    for (const sym of WATCHLIST) {
      try { await fetchRecommendation(sym, profile._id || 'guest'); } catch {}
    }
    setFetching(false);
  };

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCardClick = (symbol) => {
    setActiveRec(recommendations[symbol]);
  };

  // Collect all headlines from all fetched recs
  const allHeadlines = WATCHLIST.flatMap((s) => recommendations[s]?.headlines || []).slice(0, 10);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Live market recommendations at a glance</p>
        </div>
        <button className="btn btn-ghost" onClick={loadAll} disabled={fetching} id="refresh-btn">
          <RefreshCw size={14} className={fetching ? 'spin' : ''} />
          {fetching ? 'Refreshing…' : 'Refresh All'}
        </button>
      </div>

      {/* Watchlist Cards */}
      <div className="section-title"><BarChart2 size={16} /> Watchlist</div>
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        {WATCHLIST.map((sym) => {
          const rec = recommendations[sym];
          const isLoading = loading[sym];
          const err = errors[sym];

          if (isLoading) {
            return (
              <div key={sym} className="card" style={{ minHeight: '140px' }}>
                <div className="loading-container" style={{ minHeight: '100px' }}>
                  <div className="spinner" />
                  <span style={{ fontSize: '13px' }}>Analyzing {sym}…</span>
                </div>
              </div>
            );
          }
          if (err && !rec) {
            return (
              <div key={sym} className="card">
                <div style={{ fontWeight: 700, marginBottom: '8px', fontFamily: 'JetBrains Mono' }}>{sym}</div>
                <div className="error-box" style={{ fontSize: '12px' }}>{err}</div>
              </div>
            );
          }
          if (!rec) return (
            <div key={sym} className="card" style={{ minHeight: '140px' }}>
              <div className="loading-container" style={{ minHeight: '100px' }}>
                <div className="spinner" />
              </div>
            </div>
          );

          return (
            <StockCard
              key={sym}
              symbol={sym}
              data={{ ...rec.indicators, score: rec.score, decision: rec.decision }}
              onClick={() => { handleCardClick(sym); navigate(`/stock/${sym}`); }}
            />
          );
        })}
      </div>

      {/* Recommendation + News split */}
      <div className="grid-2">
        <div>
          <div className="section-title">Latest Recommendation</div>
          {activeRec ? (
            <RecommendationCard data={activeRec} onDetails={(sym) => navigate(`/stock/${sym}`)} />
          ) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '14px' }}>
              Click a stock card to view its recommendation
            </div>
          )}
        </div>
        <div>
          <div className="section-title">Market News</div>
          <div className="card" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <NewsPanel headlines={allHeadlines} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
