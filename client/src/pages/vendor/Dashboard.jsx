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

  if (loading) return <div style={s.center}><div style={s.spinner} /></div>;

  return (
    <div>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.sub}>Welcome back, {user?.name || 'Vendor'}</p>
        </div>
      </div>

      {/* Shop Info Card */}
      {pharmacy ? (
        <div style={s.shopCard}>
          <div style={s.shopLeft}>
            <div style={s.shopAvatar}><Store size={22} color="#1D9E75" /></div>
            <div>
              <div style={s.shopName}>{pharmacy.name}</div>
              {pharmacy.address && (
                <div style={s.shopAddr}><MapPin size={13} /> {pharmacy.address}</div>
              )}
              {pharmacy.hours && (
                <div style={s.shopAddr}><Clock size={13} /> {pharmacy.hours}</div>
              )}
            </div>
          </div>
          {pharmacy.lat && pharmacy.lng ? (
            <div style={s.coordBadge}>
              <MapPin size={12} color="#1D9E75" /> {Number(pharmacy.lat).toFixed(4)}, {Number(pharmacy.lng).toFixed(4)}
            </div>
          ) : (
            <div style={s.noCoord}>Location not set</div>
          )}
        </div>
      ) : (
        <div style={s.setupBanner}>
          <AlertCircle size={18} color="#f59e0b" />
          <span>Your shop is not set up yet. Go to <strong>Shop Setup</strong> to add your location and name.</span>
        </div>
      )}

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={s.statNum}>{inventory.length}</div>
          <div style={s.statLabel}>Total Medicines</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: lowStock.length > 0 ? '#ef4444' : '#1D9E75' }}>{lowStock.length}</div>
          <div style={s.statLabel}>Low Stock (&le;5)</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{inventory.filter(i => i.stockQty > 0).length}</div>
          <div style={s.statLabel}>In Stock</div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}><AlertCircle size={16} color="#ef4444" /> Low Stock Alerts</div>
          <div style={s.alertGrid}>
            {lowStock.map(item => (
              <div key={item._id} style={s.alertCard}>
                <Package size={16} color="#f59e0b" />
                <div style={{ flex: 1 }}>
                  <div style={s.alertName}>{item.medicineId?.name}</div>
                  <div style={s.alertQty}>Only {item.stockQty} left</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' },
  spinner: { width: '28px', height: '28px', border: '3px solid #e5e7eb', borderTop: '3px solid #1D9E75', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' },
  sub: { fontSize: '0.85rem', color: '#9ca3af', margin: '2px 0 0', fontWeight: 400 },

  shopCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.1rem 1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' },
  shopLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  shopAvatar: { width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  shopName: { fontWeight: 700, fontSize: '1rem', color: '#111827' },
  shopAddr: { fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' },
  coordBadge: { fontSize: '0.75rem', fontWeight: 600, color: '#1D9E75', background: '#f0fdf7', padding: '0.3rem 0.7rem', borderRadius: '20px', whiteSpace: 'nowrap' },
  noCoord: { fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' },

  setupBanner: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.9rem 1.1rem', marginBottom: '1.25rem', color: '#78350f', fontSize: '0.88rem' },

  statsRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  statCard: { flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem 1.1rem', textAlign: 'center' },
  statNum: { fontSize: '2rem', fontWeight: 800, color: '#111827', lineHeight: 1.1 },
  statLabel: { fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' },

  section: { marginTop: '0.5rem' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: '0.6rem' },
  alertGrid: { display: 'flex', flexDirection: 'column', gap: '6px' },
  alertCard: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.7rem 1rem' },
  alertName: { fontWeight: 600, fontSize: '0.88rem', color: '#111827' },
  alertQty: { fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 },
};
