import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

/* ── Hardcoded pharmacy data ── */
const pharmacyData = [
  {
    id: 1,
    pharmacyName: 'Wellness Forever',
    distance: '2.5 km',
    sellingPrice: 85,
    mrp: 145,
    stock: true,
    address: '23, Salt Lake City, Sector V',
    timing: '8:00 AM – 10:00 PM',
  },
  {
    id: 2,
    pharmacyName: 'HealthKart Pharmacy',
    distance: '0.5 km',
    sellingPrice: 92,
    mrp: 145,
    stock: true,
    address: '15, Park Street, Kolkata',
    timing: '9:00 AM – 9:00 PM',
  },
  {
    id: 3,
    pharmacyName: 'Apollo Pharmacy',
    distance: '0.8 km',
    sellingPrice: 98,
    mrp: 145,
    stock: true,
    address: '7A, Camac Street, Kolkata',
    timing: '24 Hours',
  },
  {
    id: 4,
    pharmacyName: 'NetMeds Store',
    distance: '1.8 km',
    sellingPrice: 105,
    mrp: 145,
    stock: false,
    address: '42, New Town, Action Area 1',
    timing: '10:00 AM – 8:00 PM',
  },
  {
    id: 5,
    pharmacyName: 'MedPlus',
    distance: '1.2 km',
    sellingPrice: 112,
    mrp: 145,
    stock: true,
    address: '9, Gariahat Road, Kolkata',
    timing: '8:30 AM – 9:30 PM',
  },
  {
    id: 6,
    pharmacyName: 'Frank Ross Pharmacy',
    distance: '3.1 km',
    sellingPrice: 120,
    mrp: 145,
    stock: false,
    address: '55, College Street, Kolkata',
    timing: '9:00 AM – 8:00 PM',
  },
];

/* ── Styles ── */
const s = {
  page: {
    display: 'flex',
    gap: '1.5rem',
    maxWidth: '1100px',
    alignItems: 'flex-start',
  },
  mainCol: {
    flex: 1,
    minWidth: 0,
  },
  stickyCard: {
    width: '280px',
    flexShrink: 0,
    position: 'sticky',
    top: '84px',
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  },

  /* Header */
  medTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  genericName: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    marginBottom: '0.15rem',
  },
  manufacturer: {
    fontSize: '0.8rem',
    color: '#d1d5db',
    marginBottom: '1.5rem',
  },

  /* Tabs */
  tabBar: {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '1.5rem',
  },
  tab: {
    padding: '0.75rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#9ca3af',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s ease',
    background: 'none',
    border: 'none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
  },
  tabActive: {
    color: '#1D9E75',
    borderBottomColor: '#1D9E75',
  },

  /* Table */
  tableWrap: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
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
  bestRow: {
    background: '#f0fdf7',
  },
  bestBadge: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    background: '#1D9E75',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 700,
    marginLeft: '0.5rem',
    verticalAlign: 'middle',
  },
  pharmacyCell: {
    fontWeight: 600,
    color: '#1a1a2e',
  },
  priceCell: {
    fontWeight: 800,
    color: '#1D9E75',
    fontSize: '1rem',
  },
  mrpCell: {
    color: '#d1d5db',
    textDecoration: 'line-through',
    fontSize: '0.85rem',
  },
  saveCell: {
    fontWeight: 600,
    color: '#b45309',
  },
  stockIn: {
    color: '#22c55e',
    fontWeight: 600,
    fontSize: '0.8rem',
  },
  stockOut: {
    color: '#ef4444',
    fontWeight: 600,
    fontSize: '0.8rem',
  },
  reserveBtn: {
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  disabledBtn: {
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#e5e7eb',
    color: '#9ca3af',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'not-allowed',
  },

  /* Sticky card */
  scLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.75rem',
  },
  scName: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  scAddress: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginBottom: '0.15rem',
  },
  scTiming: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  scPriceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  scPrice: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1D9E75',
  },
  scMrp: {
    fontSize: '0.85rem',
    color: '#d1d5db',
    textDecoration: 'line-through',
  },
  scSavings: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    background: '#fef3c7',
    color: '#b45309',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
  },
  scReserveBtn: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '12px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    boxShadow: '0 4px 14px rgba(29,158,117,0.3)',
  },
  scDivider: {
    borderTop: '1px solid #f3f4f6',
    margin: '1rem 0',
  },

  /* Placeholder tab */
  placeholder: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#9ca3af',
    fontSize: '0.95rem',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
  },
};

const tabs = ['Price Comparison', 'About Medicine', 'Alternatives'];

function MedicineDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Price Comparison');

  /* Sort pharmacies by selling price */
  const sorted = useMemo(
    () => [...pharmacyData].sort((a, b) => a.sellingPrice - b.sellingPrice),
    []
  );

  const cheapest = sorted[0];

  return (
    <div style={s.page}>
      {/* ── Main Column ── */}
      <div style={s.mainCol}>
        {/* Medicine header */}
        <div style={s.medTitle}>Metformin 500mg</div>
        <div style={s.genericName}>Metformin Hydrochloride</div>
        <div style={s.manufacturer}>Sun Pharmaceutical Industries Ltd.</div>

        {/* Tab bar */}
        <div style={s.tabBar}>
          {tabs.map((tab) => (
            <button
              key={tab}
              style={{
                ...s.tab,
                ...(activeTab === tab ? s.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Price Comparison' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Pharmacy Name</th>
                  <th style={s.th}>Distance</th>
                  <th style={s.th}>Price</th>
                  <th style={s.th}>MRP</th>
                  <th style={s.th}>You Save</th>
                  <th style={s.th}>Stock</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => {
                  const isBest = i === 0;
                  const savings = p.mrp - p.sellingPrice;

                  return (
                    <tr
                      key={p.id}
                      style={isBest ? s.bestRow : {}}
                    >
                      <td style={{ ...s.td, ...s.pharmacyCell }}>
                        {p.pharmacyName}
                        {isBest && <span style={s.bestBadge}>Best Price</span>}
                      </td>
                      <td style={s.td}>📍 {p.distance}</td>
                      <td style={{ ...s.td, ...s.priceCell }}>₹{p.sellingPrice}</td>
                      <td style={{ ...s.td, ...s.mrpCell }}>₹{p.mrp}</td>
                      <td style={{ ...s.td, ...s.saveCell }}>₹{savings}</td>
                      <td style={s.td}>
                        <span style={p.stock ? s.stockIn : s.stockOut}>
                          {p.stock ? '● In Stock' : '● Out of Stock'}
                        </span>
                      </td>
                      <td style={s.td}>
                        {p.stock ? (
                          <button
                            style={s.reserveBtn}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = '#178c65')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = '#1D9E75')
                            }
                          >
                            Reserve
                          </button>
                        ) : (
                          <button style={s.disabledBtn} disabled>
                            Out of Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'About Medicine' && (
          <div style={s.placeholder}>
            💊 About Medicine — Coming soon
          </div>
        )}

        {activeTab === 'Alternatives' && (
          <div style={s.placeholder}>
            🔄 Alternatives — Coming soon
          </div>
        )}
      </div>

      {/* ── Sticky Side Card ── */}
      <div style={s.stickyCard}>
        <div style={s.scLabel}>🏆 Best Deal</div>
        <div style={s.scName}>{cheapest.pharmacyName}</div>
        <div style={s.scAddress}>📍 {cheapest.address}</div>
        <div style={s.scTiming}>🕐 {cheapest.timing}</div>

        <div style={s.scDivider} />

        <div style={s.scPriceRow}>
          <span style={s.scPrice}>₹{cheapest.sellingPrice}</span>
          <span style={s.scMrp}>₹{cheapest.mrp}</span>
        </div>
        <div style={s.scSavings}>
          Save ₹{cheapest.mrp - cheapest.sellingPrice}
        </div>

        <button
          style={s.scReserveBtn}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
        >
          Reserve Now
        </button>
      </div>
    </div>
  );
}

export default MedicineDetail;
