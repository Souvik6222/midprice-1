import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

const s = {
  page: { maxWidth: '960px' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' },
  tabRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: { padding: '0.55rem 1.2rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease' },
  tabActive: { background: '#1D9E75', color: '#fff', border: '1.5px solid #1D9E75' },
  tableWrap: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6', background: '#fafbfc' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', verticalAlign: 'middle' },
  patientName: { fontWeight: 600, color: '#1a1a2e' },
  badgePending: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 600 },
  badgeReady: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 600 },
  badgeCompleted: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600 },
  badgeCancelled: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600 },
  actionRow: { display: 'flex', gap: '0.5rem' },
  btn: { padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1D9E75', color: '#fff', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'background 0.2s ease' },
  btnCancel: { padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '3rem', color: '#1D9E75', fontSize: '1rem', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem' },
};

const getBadge = (status) => {
  if (status === 'pending') return s.badgePending;
  if (status === 'ready') return s.badgeReady;
  if (status === 'completed') return s.badgeCompleted;
  return s.badgeCancelled;
};

const tabs = ['pending', 'ready', 'completed'];

function VendorReservations() {
  const [activeTab, setActiveTab] = useState('pending');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = async (status) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/reservations/vendor?status=${status}`);
      setReservations(data.reservations || []);
    } catch (_) { setError('Something went wrong. Try again.'); setReservations([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(activeTab); }, [activeTab]);

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/api/reservations/vendor/${id}/status`, { status });
      fetchReservations(activeTab);
    } catch (_) { setError('Failed to update status.'); }
  };

  return (
    <div style={s.page}>
      <div style={s.heading}>Reservations 📋</div>

      {error && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#ef4444', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => fetchReservations(activeTab)}>Retry</button>
        </div>
      )}

      <div style={s.tabRow}>
        {tabs.map((tab) => (
          <button key={tab} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr><th style={s.th}>Patient</th><th style={s.th}>Medicine</th><th style={s.th}>Qty</th><th style={s.th}>Code</th><th style={s.th}>Status</th><th style={s.th}>Date</th><th style={s.th}>Action</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={s.loading}>⏳ Loading...</td></tr>
            ) : reservations.length === 0 ? (
              <tr><td colSpan={7} style={s.empty}>No {activeTab} reservations</td></tr>
            ) : (
              reservations.map((r) => (
                <tr key={r._id}>
                  <td style={{ ...s.td, ...s.patientName }}>{r.patientId?.name || r.patientId?.phone || 'Patient'}</td>
                  <td style={s.td}>{r.medicineId?.name || 'Medicine'} {r.medicineId?.dosage || ''}</td>
                  <td style={s.td}>{r.qty}</td>
                  <td style={s.td}>{r.reservationCode}</td>
                  <td style={s.td}><span style={getBadge(r.status)}>{r.status}</span></td>
                  <td style={s.td}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <div style={s.actionRow}>
                      {r.status === 'pending' && <button style={s.btn} onClick={() => handleAction(r._id, 'ready')}>Mark Ready</button>}
                      {r.status === 'ready' && <button style={s.btn} onClick={() => handleAction(r._id, 'completed')}>Complete</button>}
                      {(r.status === 'pending' || r.status === 'ready') && <button style={s.btnCancel} onClick={() => handleAction(r._id, 'cancelled')}>Cancel</button>}
                      {(r.status === 'completed' || r.status === 'cancelled') && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>—</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VendorReservations;
