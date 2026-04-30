import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { MapPin, Clock, Save, Navigation } from 'lucide-react';

export default function VendorSettings() {
  const [form, setForm] = useState({ name: '', address: '', hours: '', lat: '', lng: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/api/vendor/pharmacy')
      .then(r => setForm({
        name:    r.data.name    || '',
        address: r.data.address || '',
        hours:   r.data.hours   || '',
        lat:     r.data.lat     || '',
        lng:     r.data.lng     || '',
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return setErr('Geolocation not supported by your browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(p => ({ ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
        setLocating(false);
        setMsg('Location fetched! Save to apply.');
      },
      () => { setErr('Could not get location. Please allow location access.'); setLocating(false); }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!form.name.trim()) return setErr('Shop name is required.');
    setSaving(true);
    try {
      await api.put('/api/vendor/pharmacy', {
        name:    form.name.trim(),
        address: form.address.trim(),
        hours:   form.hours.trim(),
        lat:     form.lat !== '' ? Number(form.lat) : undefined,
        lng:     form.lng !== '' ? Number(form.lng) : undefined,
      });
      setMsg('Shop profile saved successfully!');
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="vs-center"><div className="vs-spinner" /></div>;

  return (
    <div className="vs-container">
      <style>{responsiveCSS}</style>
      
      <div className="vs-page-header">
        <h1 className="vs-title">Shop Setup</h1>
        <p className="vs-sub">Configure your pharmacy location and details</p>
      </div>

      <form onSubmit={handleSave} className="vs-card">
        {/* Shop Name */}
        <div className="vs-field">
          <label className="vs-label">Shop Name *</label>
          <input className="vs-input" placeholder="e.g. Sharma Medical Store"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>

        {/* Address */}
        <div className="vs-field">
          <label className="vs-label"><MapPin size={13} /> Address</label>
          <input className="vs-input" placeholder="Full shop address"
            value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
        </div>

        {/* Hours */}
        <div className="vs-field">
          <label className="vs-label"><Clock size={13} /> Operating Hours</label>
          <input className="vs-input" placeholder="e.g. 9:00 AM – 9:00 PM"
            value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} />
        </div>

        {/* Location */}
        <div className="vs-field">
          <label className="vs-label"><Navigation size={13} /> Location (GPS coordinates)</label>
          <div className="vs-loc-row">
            <input className="vs-input vs-loc-input" placeholder="Latitude" type="number" step="any"
              value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} />
            <input className="vs-input vs-loc-input" placeholder="Longitude" type="number" step="any"
              value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} />
            <button type="button" className="vs-loc-btn" onClick={useCurrentLocation} disabled={locating}>
              <Navigation size={15} />
              {locating ? 'Detecting...' : 'Use My Location'}
            </button>
          </div>
          <div className="vs-hint">This lets patients find your shop nearby. Click "Use My Location" for automatic detection.</div>
        </div>

        {msg && <div className="vs-success-banner">{msg}</div>}
        {err && <div className="vs-err-banner">{err}</div>}

        <button type="submit" className="vs-save-btn" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Shop Profile'}
        </button>
      </form>
    </div>
  );
}

const responsiveCSS = `
  .vs-container { width: 100%; }
  .vs-center { display: flex; align-items: center; justify-content: center; height: 200px; }
  .vs-spinner { width: 26px; height: 26px; border: 3px solid #e5e7eb; border-top: 3px solid #1D9E75; border-radius: 50%; animation: spin 0.8s linear infinite; }
  
  .vs-page-header { margin-bottom: 1.25rem; }
  .vs-title { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.3px; }
  .vs-sub { font-size: 0.82rem; color: #9ca3af; margin: 2px 0 0; }

  .vs-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; }
  .vs-field { display: flex; flex-direction: column; gap: 6px; }
  .vs-label { font-size: 0.8rem; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 4px; }
  .vs-input { padding: 0.65rem 0.9rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; font-family: inherit; color: #111827; transition: border-color 0.15s; }
  .vs-input:focus { border-color: #1D9E75; }
  
  .vs-loc-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .vs-loc-input { flex: 1; min-width: 120px; }
  .vs-loc-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0.65rem 1rem; background: #f0fdf7; color: #1D9E75; border: 1.5px solid #bbf7d0; border-radius: 10px; font-weight: 600; font-size: 0.82rem; cursor: pointer; white-space: nowrap; }
  .vs-hint { font-size: 0.73rem; color: #9ca3af; }

  .vs-success-banner { background: #f0fdf7; border: 1px solid #bbf7d0; border-radius: 10px; padding: 0.7rem 1rem; color: #166534; font-size: 0.875rem; font-weight: 500; }
  .vs-err-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 0.7rem 1rem; color: #ef4444; font-size: 0.875rem; }

  .vs-save-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0.75rem 1.5rem; background: #1D9E75; color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; width: fit-content; }

  /* ═══ RESPONSIVE: Mobile (<768px) ═══ */
  @media (max-width: 768px) {
    .vs-card { padding: 1.2rem; }
    .vs-loc-row { flex-direction: column; }
    .vs-loc-input { width: 100%; flex: unset; }
    .vs-loc-btn { width: 100%; }
    .vs-save-btn { width: 100%; }
  }
`;
