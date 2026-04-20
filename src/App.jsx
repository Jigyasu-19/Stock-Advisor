import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, User, TrendingUp } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import StockDetail from './pages/StockDetail.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Profile from './pages/Profile.jsx';
import './index.css';

import { LogIn, LogOut } from 'lucide-react';
import { useUser } from './context/UserContext.jsx';

const Sidebar = () => {
  const { authUser, loginWithGoogle, logout } = useUser();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <TrendingUp size={22} color="var(--accent-blue)" />
        <h1>AI Stock<br />Advisor</h1>
      </div>
      
      {/* Auth Status Section */}
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
        {authUser ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              {authUser.photoURL ? (
                <img src={authUser.photoURL} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              ) : (
                <User size={28} color="var(--accent-blue)" />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {authUser.displayName || 'Stock Trader'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Logged In</span>
              </div>
            </div>
            <button onClick={logout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle} 
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)',
              background: 'var(--surface-light)', color: 'var(--text)', fontSize: '13px', fontWeight: 500
            }}
          >
            <LogIn size={16} color="var(--accent-blue)" /> Sign in with Google
          </button>
        )}
      </div>

      <nav className="sidebar-nav" style={{ marginTop: '12px' }}>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-dashboard">
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-portfolio">
          <Briefcase size={16} /> Portfolio
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-profile">
          <User size={16} /> Profile Settings
        </NavLink>
      </nav>
      <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: '4px' }}>Scores: base 50 + adjustments</div>
          <div style={{ color: 'var(--accent-green)' }}>≥80 Strong Buy</div>
          <div style={{ color: 'var(--buy)' }}>65–80 Buy</div>
          <div style={{ color: 'var(--hold)' }}>45–65 Hold</div>
          <div style={{ color: 'var(--sell)' }}>&lt;45 Sell</div>
        </div>
      </div>
    </aside>
  );
};

const App = () => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </main>
  </div>
);

export default App;
