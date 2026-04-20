import React, { useState } from 'react';
import { User, Save, CheckCircle } from 'lucide-react';
import RiskMeter from '../components/RiskMeter.jsx';
import { useUser } from '../context/UserContext.jsx';
import { saveUserProfile } from '../services/api.js';

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrials', 'Real Estate', 'Utilities'];

const Profile = () => {
  const { profile, updateProfile } = useUser();
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSector = (sector) => {
    setForm((prev) => {
      const sectors = prev.sectors || [];
      return {
        ...prev,
        sectors: sectors.includes(sector) ? sectors.filter((s) => s !== sector) : [...sectors, sector],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await saveUserProfile(form);
      const saved = res.data.data;
      updateProfile({ ...form, _id: saved._id });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Profile</h2>
        <p className="page-subtitle">Set your risk appetite and investment preferences</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="section-title"><User size={16} /> Personal Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input id="profile-name" className="form-input" name="name" value={form.name || ''} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input id="profile-age" className="form-input" name="age" type="number" min="18" max="100" value={form.age || ''} onChange={handleChange} placeholder="e.g. 28" />
                </div>
                <div className="form-group">
                  <label className="form-label">Investment Amount ($)</label>
                  <input id="profile-investment" className="form-input" name="investmentAmount" type="number" min="0" value={form.investmentAmount || ''} onChange={handleChange} placeholder="e.g. 10000" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">Investment Preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Risk Level</label>
                <select id="profile-risk" className="form-select" name="riskLevel" value={form.riskLevel || 'moderate'} onChange={handleChange}>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Holding Period</label>
                <select id="profile-holding" className="form-select" name="holdingPeriod" value={form.holdingPeriod || 'medium'} onChange={handleChange}>
                  <option value="short">Short-term (&lt; 3 months)</option>
                  <option value="medium">Medium-term (3–12 months)</option>
                  <option value="long">Long-term (&gt; 1 year)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Sectors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {SECTORS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSector(s)}
                      style={{
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                        border: (form.sectors || []).includes(s) ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                        background: (form.sectors || []).includes(s) ? 'rgba(99,179,237,0.15)' : 'var(--bg-secondary)',
                        color: (form.sectors || []).includes(s) ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        transition: 'var(--transition)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button id="save-profile-btn" className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? 'Saving…' : <><Save size={16} /> Save Profile</>}
          </button>
        </form>

        {/* Risk Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="section-title">Risk Profile Preview</div>
            <RiskMeter riskLevel={form.riskLevel || 'moderate'} />
          </div>
          <div className="card">
            <div className="section-title">Scoring Impact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Conservative + high volatility</span>
                <span className="negative">−20 pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Moderate</span>
                <span className="neutral">No adjustment</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Aggressive + momentum</span>
                <span className="positive">+15 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
