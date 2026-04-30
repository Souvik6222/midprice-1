import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { MapPin, Package, Clock, Store, AlertCircle } from 'lucide-react';

export default function VendorDashboard() {
  const user = useAuthStore(s => s.user);
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/vendor/pharmacy').then(r => setPharmacy(r.data)).catch(() => {}),
      api.get('/api/vendor/inventory').then(r => setInventory(r.data.inventory || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const lowStock = inventory.filter(i => i.stockQty <= 5);

  if (loading) return <div className="vd-center"><div className="vd-spinner" /></div>;

  return (
    <div className="vd-container">
      <style>{responsiveCSS}</style>
      
      {/* Header */}
      <div className="vd-header">
        <div>
          <h1 className="vd-title">Dashboard</h1>
          <p className="vd-sub">Welcome back, {user?.name || 'Vendor'}</p>
        </div>
      </div>

      {/* Shop Info Card */}
      {pharmacy ? (
        <div className="vd-shop-card">
          <div className="vd-shop-left">
            <div className="vd-shop-avatar"><Store size={22} color="#1D9E75" /></div>
            <div>
              <div className="vd-shop-name">{pharmacy.name}</div>
              {pharmacy.address && (
                <div className="vd-shop-addr"><MapPin size={13} /> {pharmacy.address}</div>
              )}
              {pharmacy.hours && (
                <div className="vd-shop-addr"><Clock size={13} /> {pharmacy.hours}</div>
              )}
            </div>
          </div>
          {pharmacy.lat && pharmacy.lng ? (
            <div className="vd-coord-badge">
              <MapPin size={12} color="#1D9E75" /> {Number(pharmacy.lat).toFixed(4)}, {Number(pharmacy.lng).toFixed(4)}
            </div>
          ) : (
            <div className="vd-no-coord">Location not set</div>
          )}
        </div>
      ) : (
        <div className="vd-setup-banner">
          <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span>Your shop is not set up yet. Go to <strong>Shop Setup</strong> to add your location and name.</span>
        </div>
      )}

      {/* Stats */}
      <div className="vd-stats-row">
        <div className="vd-stat-card">
          <div className="vd-stat-num">{inventory.length}</div>
          <div className="vd-stat-label">Total Medicines</div>
        </div>
        <div className="vd-stat-card">
          <div className="vd-stat-num" style={{ color: lowStock.length > 0 ? '#ef4444' : '#1D9E75' }}>{lowStock.length}</div>
          <div className="vd-stat-label">Low Stock (&le;5)</div>
        </div>
        <div className="vd-stat-card">
          <div className="vd-stat-num">{inventory.filter(i => i.stockQty > 0).length}</div>
          <div className="vd-stat-label">In Stock</div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="vd-section">
          <div className="vd-section-title"><AlertCircle size={16} color="#ef4444" /> Low Stock Alerts</div>
          <div className="vd-alert-grid">
            {lowStock.map(item => (
              <div key={item._id} className="vd-alert-card">
                <Package size={16} color="#f59e0b" />
                <div style={{ flex: 1 }}>
                  <div className="vd-alert-name">{item.medicineId?.name}</div>
                  <div className="vd-alert-qty">Only {item.stockQty} left</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const responsiveCSS = `
  .vd-container { width: 100%; }
  
  .vd-center { display: flex; align-items: center; justify-content: center; height: 200px; }
  .vd-spinner { width: 28px; height: 28px; border: 3px solid #e5e7eb; border-top: 3px solid #1D9E75; border-radius: 50%; animation: spin 0.8s linear infinite; }
  
  .vd-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
  .vd-title { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.3px; }
  .vd-sub { font-size: 0.85rem; color: #9ca3af; margin: 2px 0 0; font-weight: 400; }

  .vd-shop-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.1rem 1.3rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .vd-shop-left { display: flex; align-items: center; gap: 12px; }
  .vd-shop-avatar { width: 44px; height: 44px; border-radius: 12px; background: #f0fdf7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .vd-shop-name { font-weight: 700; font-size: 1rem; color: #111827; }
  .vd-shop-addr { font-size: 0.78rem; color: #6b7280; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
  
  .vd-coord-badge { font-size: 0.75rem; font-weight: 600; color: #1D9E75; background: #f0fdf7; padding: 0.3rem 0.7rem; border-radius: 20px; white-space: nowrap; }
  .vd-no-coord { font-size: 0.75rem; color: #9ca3af; font-style: italic; }

  .vd-setup-banner { display: flex; align-items: center; gap: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 0.9rem 1.1rem; margin-bottom: 1.25rem; color: #78350f; font-size: 0.88rem; }

  .vd-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
  .vd-stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.1rem; text-align: center; }
  .vd-stat-num { font-size: 2rem; font-weight: 800; color: #111827; line-height: 1.1; }
  .vd-stat-label { font-size: 0.72rem; color: #9ca3af; margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

  .vd-section { margin-top: 0.5rem; }
  .vd-section-title { font-size: 0.9rem; font-weight: 700; color: #374151; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 6px; }
  .vd-alert-grid { display: flex; flex-direction: column; gap: 6px; }
  .vd-alert-card { display: flex; align-items: center; gap: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 0.7rem 1rem; }
  .vd-alert-name { font-weight: 600; font-size: 0.88rem; color: #111827; }
  .vd-alert-qty { font-size: 0.75rem; color: #f59e0b; font-weight: 600; }

  /* ═══ RESPONSIVE: Mobile (<768px) ═══ */
  @media (max-width: 768px) {
    .vd-shop-card { flex-direction: column; align-items: flex-start; }
    .vd-stats-row { grid-template-columns: 1fr; }
  }
`;
