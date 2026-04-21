import React, { useState } from 'react';

const styles = {
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
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    flex: 1,
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  statLabel: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#1a1a2e',
  },
  statIcon: {
    fontSize: '1.6rem',
    marginBottom: '0.5rem',
  },

  /* Section */
  sectionHeading: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '1rem',
  },

  /* Price Drop Cards */
  scrollRow: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    paddingBottom: '0.75rem',
  },
  medCard: {
    minWidth: '260px',
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
    flex: '0 0 auto',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  medName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  medPharmacy: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginBottom: '0.75rem',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  mrp: {
    fontSize: '0.9rem',
    color: '#d1d5db',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#1D9E75',
  },
  savingsBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
    background: '#fef3c7',
    color: '#b45309',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
};

const statsData = [
  { icon: '💊', label: 'Medicines Tracked', value: '12' },
  { icon: '💰', label: 'Avg Savings', value: '₹340' },
  { icon: '🏪', label: 'Nearby Pharmacies', value: '8' },
];

function Home() {
  const [priceDrops] = useState([
    {
      id: 1,
      name: 'Paracetamol 500mg',
      pharmacy: 'Apollo Pharmacy, Sector 5',
      mrp: 85,
      price: 42,
      savings: 43,
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      pharmacy: 'MedPlus, Park Street',
      mrp: 220,
      price: 165,
      savings: 55,
    },
    {
      id: 3,
      name: 'Cetirizine 10mg',
      pharmacy: 'Wellness Forever, Salt Lake',
      mrp: 60,
      price: 32,
      savings: 28,
    },
  ]);

  return (
    <div style={styles.page}>
      {/* Greeting */}
      <div style={styles.greeting}>Good morning 👋</div>

      {/* Stat Cards */}
      <div style={styles.statsRow}>
        {statsData.map((stat, i) => (
          <div
            key={i}
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
            }}
          >
            <div style={styles.statIcon}>{stat.icon}</div>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Today's Price Drops */}
      <div style={styles.sectionHeading}>Today's Price Drops 🔥</div>
      <div style={styles.scrollRow}>
        {priceDrops.map((med) => (
          <div
            key={med.id}
            style={styles.medCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
            }}
          >
            <div style={styles.medName}>{med.name}</div>
            <div style={styles.medPharmacy}>{med.pharmacy}</div>
            <div style={styles.priceRow}>
              <span style={styles.mrp}>₹{med.mrp}</span>
              <span style={styles.currentPrice}>₹{med.price}</span>
            </div>
            <span style={styles.savingsBadge}>Save ₹{med.savings}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
