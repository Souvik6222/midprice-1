import React, { useState } from 'react';

/* ── Styles ── */
const s = {
  page: {
    maxWidth: '960px',
  },
  greeting: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '1.5rem',
  },

  /* Stat Cards */
  statsRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    flex: 1,
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  statIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.4rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem',
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1a1a2e',
  },

  /* Section heading */
  sectionHeading: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '1rem',
  },

  /* Table */
  tableWrap: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
    marginBottom: '2.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.88rem',
  },
  th: {
    padding: '0.85rem 1rem',
    textAlign: 'left',
    fontWeight: 700,
    color: '#374151',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #f3f4f6',
    background: '#fafbfc',
  },
  td: {
    padding: '0.85rem 1rem',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
    verticalAlign: 'middle',
  },
  patientName: {
    fontWeight: 600,
    color: '#1a1a2e',
  },

  /* Status badges */
  badgePending: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '8px',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  badgeReady: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '8px',
    background: '#d1fae5',
    color: '#065f46',
    fontSize: '0.75rem',
    fontWeight: 600,
  },

  /* Action buttons */
  actionRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  markReadyBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  cancelBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    background: '#fff',
    color: '#6b7280',
    fontWeight: 600,
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  /* Low Stock Cards */
  lowStockRow: {
    display: 'flex',
    gap: '1rem',
  },
  lowStockCard: {
    flex: 1,
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
    borderLeft: '3px solid #f59e0b',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  lowStockName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  lowStockQty: {
    fontSize: '0.8rem',
    color: '#f59e0b',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  updateBtn: {
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    border: '1.5px solid #1D9E75',
    background: '#fff',
    color: '#1D9E75',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

const statsData = [
  { icon: '📋', label: "Today's Reservations", value: '5' },
  { icon: '💊', label: 'Medicines Listed', value: '48' },
  { icon: '👁️', label: 'Profile Views', value: '120' },
  { icon: '🏆', label: 'Price Rank', value: '3rd' },
];

const initialReservations = [
  {
    id: 1,
    patient: 'Rahul Sharma',
    medicine: 'Metformin 500mg',
    qty: 2,
    reservedAt: '10:30 AM',
    status: 'Pending',
  },
  {
    id: 2,
    patient: 'Priya Das',
    medicine: 'Amlodipine 5mg',
    qty: 1,
    reservedAt: '11:15 AM',
    status: 'Pending',
  },
  {
    id: 3,
    patient: 'Amit Roy',
    medicine: 'Cetirizine 10mg',
    qty: 3,
    reservedAt: '12:00 PM',
    status: 'Ready',
  },
];

const lowStockItems = [
  { id: 1, name: 'Paracetamol 500mg', remaining: '3 strips left' },
  { id: 2, name: 'Omeprazole 20mg', remaining: '2 strips left' },
  { id: 3, name: 'Azithromycin 250mg', remaining: '1 strip left' },
];

function VendorDashboard() {
  const [reservations, setReservations] = useState(initialReservations);

  const handleMarkReady = (id) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Ready' } : r))
    );
  };

  return (
    <div style={s.page}>
      {/* Greeting */}
      <div style={s.greeting}>Pharmacy Dashboard 🏪</div>

      {/* Stat Cards */}
      <div style={s.statsRow}>
        {statsData.map((stat, i) => (
          <div
            key={i}
            style={s.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
            }}
          >
            <div style={s.statIcon}>{stat.icon}</div>
            <div style={s.statLabel}>{stat.label}</div>
            <div style={s.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Pending Reservations */}
      <div style={s.sectionHeading}>Pending Reservations 📋</div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Patient</th>
              <th style={s.th}>Medicine</th>
              <th style={s.th}>Qty</th>
              <th style={s.th}>Reserved At</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td style={{ ...s.td, ...s.patientName }}>{r.patient}</td>
                <td style={s.td}>{r.medicine}</td>
                <td style={s.td}>{r.qty}</td>
                <td style={s.td}>{r.reservedAt}</td>
                <td style={s.td}>
                  <span
                    style={
                      r.status === 'Pending' ? s.badgePending : s.badgeReady
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={s.actionRow}>
                    {r.status === 'Pending' ? (
                      <>
                        <button
                          style={s.markReadyBtn}
                          onClick={() => handleMarkReady(r.id)}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = '#178c65')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = '#1D9E75')
                          }
                        >
                          Mark Ready
                        </button>
                        <button
                          style={s.cancelBtn}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low Stock Alerts */}
      <div style={s.sectionHeading}>Low Stock Alerts ⚠️</div>
      <div style={s.lowStockRow}>
        {lowStockItems.map((item) => (
          <div
            key={item.id}
            style={s.lowStockCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
            }}
          >
            <div style={s.lowStockName}>{item.name}</div>
            <div style={s.lowStockQty}>⚠️ {item.remaining}</div>
            <button
              style={s.updateBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0fdf7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
              }}
            >
              Update Stock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendorDashboard;
