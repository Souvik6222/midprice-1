import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { ClipboardList, Loader2 } from 'lucide-react';

const s = {
  page: { maxWidth: '960px' },
  heading: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' },
  tableWrap: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6', background: '#fafbfc' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', verticalAlign: 'middle' },
  medName: { fontWeight: 600, color: '#1a1a2e' },
  code: { fontFamily: "'Courier New', monospace", fontWeight: 700, color: '#1D9E75', letterSpacing: '1px' },
  badgePending: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 600 },
  badgeReady: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 600 },
  badgeCompleted: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600 },
  badgeCancelled: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600 },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '3rem', color: '#1D9E75', fontSize: '1rem', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem' },
};

const getBadge = (status) => {
  if (status === 'pending') return s.badgePending;
  if (status === 'ready') return s.badgeReady;
  if (status === 'completed') return s.badgeCompleted;
  return s.badgeCancelled;
};

function PatientReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/reservations');
      setReservations(data.reservations || []);
    } catch (_) { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); }, []);

  if (loading) return <div style={s.loading}><Loader2 size={24} className="animate-spin" /> Loading reservations...</div>;

  return (
    <div style={s.page}>
      <div style={s.heading}><ClipboardList size={24} /> My Reservations</div>

      {error && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#ef4444', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={fetchReservations}>Retry</button>
        </div>
      )}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr><th style={s.th}>Medicine</th><th style={s.th}>Pharmacy</th><th style={s.th}>Qty</th><th style={s.th}>Code</th><th style={s.th}>Status</th><th style={s.th}>Date</th></tr></thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan={6} style={s.empty}>No reservations yet. Search for medicines and make your first booking!</td></tr>
            ) : (
              reservations.map((r) => (
                <tr key={r._id}>
                  <td style={{ ...s.td, ...s.medName }}>{r.medicineId?.name || 'Medicine'} {r.medicineId?.dosage || ''}</td>
                  <td style={s.td}>{r.pharmacyId?.name || 'Pharmacy'}</td>
                  <td style={s.td}>{r.qty}</td>
                  <td style={{ ...s.td, ...s.code }}>{r.reservationCode}</td>
                  <td style={s.td}><span style={getBadge(r.status)}>{r.status}</span></td>
                  <td style={s.td}>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientReservations;
