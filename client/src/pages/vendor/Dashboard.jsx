import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const s = {
  page: { maxWidth: '960px' },
  greeting: { fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '2.5rem' },
  statCard: { flex: 1, background: '#fff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' },
  statIcon: { fontSize: '1.5rem', marginBottom: '0.4rem' },
  statLabel: { fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' },
  statValue: { fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e' },
  sectionHeading: { fontSize: '1.15rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' },
  tableWrap: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', marginBottom: '2.5rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6', background: '#fafbfc' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', verticalAlign: 'middle' },
  patientName: { fontWeight: 600, color: '#1a1a2e' },
  badgePending: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 600 },
  badgeReady: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600 },
  actionRow: { display: 'flex', gap: '0.5rem' },
  markReadyBtn: { padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1D9E75', color: '#fff', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'background 0.2s ease' },
  cancelBtn: { padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s ease' },
  loading: { textAlign: 'center', padding: '2rem', color: '#1D9E75', fontSize: '0.95rem', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem' },
  lowStockRow: { display: 'flex', gap: '1rem' },
  lowStockCard: { flex: 1, background: '#fff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', borderLeft: '3px solid #f59e0b', transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
  lowStockName: { fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.25rem' },
  lowStockQty: { fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.75rem' },
  updateBtn: { padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1.5px solid #1D9E75', background: '#fff', color: '#1D9E75', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s ease' },
};

function VendorDashboard() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/api/reservations/vendor?status=pending');
      setReservations(data.reservations || []);
      setError('');
    } catch (_) { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/api/vendor/inventory');
      setInventory(data.inventory || []);
    } catch (_) { /* silent */ }
  };

  useEffect(() => { fetchReservations(); fetchInventory(); }, []);

  const handleMarkReady = async (id) => {
    try {
      await api.patch(`/api/reservations/vendor/${id}/status`, { status: 'ready' });
      fetchReservations();
    } catch (_) { setError('Failed to update status.'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/api/reservations/vendor/${id}/status`, { status: 'cancelled' });
      fetchReservations();
    } catch (_) { setError('Failed to cancel reservation.'); }
  };

  const lowStockItems = inventory.filter((i) => i.isListed && i.stockQty > 0 && i.stockQty <= 5);
  const listedCount = inventory.filter((i) => i.isListed).length;

  const statsData = [
    { icon: '📋', label: "Pending Reservations", value: String(reservations.length) },
    { icon: '💊', label: 'Medicines Listed', value: String(listedCount) },
    { icon: '⚠️', label: 'Low Stock Items', value: String(lowStockItems.length) },
    { icon: '📦', label: 'Total Inventory', value: String(inventory.length) },
  ];

  return (
    <div style={s.page}>
      <div style={s.greeting}>Pharmacy Dashboard 🏪</div>

      {error && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#ef4444', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setError(''); fetchReservations(); }}>Retry</button>
        </div>
      )}

      <div style={s.statsRow}>
        {statsData.map((stat, i) => (
          <div key={i} style={s.statCard}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
            <div style={s.statIcon}>{stat.icon}</div>
            <div style={s.statLabel}>{stat.label}</div>
            <div style={s.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={s.sectionHeading}>Pending Reservations 📋</div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr><th style={s.th}>Patient</th><th style={s.th}>Medicine</th><th style={s.th}>Qty</th><th style={s.th}>Code</th><th style={s.th}>Status</th><th style={s.th}>Action</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={s.loading}>⏳ Loading...</td></tr>
            ) : reservations.length === 0 ? (
              <tr><td colSpan={6} style={s.empty}>No pending reservations 🎉</td></tr>
            ) : (
              reservations.map((r) => (
                <tr key={r._id}>
                  <td style={{ ...s.td, ...s.patientName }}>{r.patientId?.name || r.patientId?.phone || 'Patient'}</td>
                  <td style={s.td}>{r.medicineId?.name || 'Medicine'} {r.medicineId?.dosage || ''}</td>
                  <td style={s.td}>{r.qty}</td>
                  <td style={s.td}>{r.reservationCode}</td>
                  <td style={s.td}><span style={s.badgePending}>{r.status}</span></td>
                  <td style={s.td}>
                    <div style={s.actionRow}>
                      <button style={s.markReadyBtn} onClick={() => handleMarkReady(r._id)} onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')} onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}>Mark Ready</button>
                      <button style={s.cancelBtn} onClick={() => handleCancel(r._id)} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {lowStockItems.length > 0 && (
        <>
          <div style={s.sectionHeading}>Low Stock Alerts ⚠️</div>
          <div style={s.lowStockRow}>
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item._id} style={s.lowStockCard}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
                <div style={s.lowStockName}>{item.medicineId?.name || 'Medicine'}</div>
                <div style={s.lowStockQty}>⚠️ {item.stockQty} left</div>
                <button style={s.updateBtn} onClick={() => navigate('/vendor/inventory')}>Update Stock</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default VendorDashboard;
