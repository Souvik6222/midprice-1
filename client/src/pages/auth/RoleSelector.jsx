import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1D9E75 0%, #17845f 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftOverlay: {
    position: 'absolute',
    top: '-50%',
    right: '-30%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },
  leftOverlay2: {
    position: 'absolute',
    bottom: '-40%',
    left: '-20%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    pointerEvents: 'none',
  },
  appName: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-1px',
    marginBottom: '1rem',
    zIndex: 1,
  },
  tagline: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 400,
    textAlign: 'center',
    maxWidth: '320px',
    lineHeight: 1.6,
    zIndex: 1,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    background: '#fafbfc',
  },
  rightHeading: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  rightSubtext: {
    fontSize: '0.95rem',
    color: '#6b7280',
    marginBottom: '2.5rem',
  },
  cardsWrapper: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  card: {
    width: '200px',
    padding: '2rem 1.5rem',
    borderRadius: '16px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.25s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardSelected: {
    border: '2px solid #1D9E75',
    background: '#f0fdf7',
    boxShadow: '0 4px 16px rgba(29,158,117,0.15)',
    transform: 'translateY(-2px)',
  },
  cardIcon: {
    fontSize: '2.8rem',
    marginBottom: '0.8rem',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#1a1a2e',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '0.4rem',
  },
  continueBtn: {
    padding: '0.85rem 3rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    background: '#1D9E75',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 14px rgba(29,158,117,0.3)',
  },
  continueBtnDisabled: {
    background: '#d1d5db',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};

function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/auth/login', { state: { role: selectedRole } });
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftOverlay} />
        <div style={styles.leftOverlay2} />
        <div style={styles.appName}>MedPrice</div>
        <div style={styles.tagline}>
          Compare medicine prices across pharmacies. Save money on every prescription.
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.rightHeading}>Welcome! Who are you?</div>
        <div style={styles.rightSubtext}>Select your role to get started</div>

        <div style={styles.cardsWrapper}>
          {/* Patient Card */}
          <div
            style={{
              ...styles.card,
              ...(selectedRole === 'patient' ? styles.cardSelected : {}),
            }}
            onClick={() => setSelectedRole('patient')}
            onMouseEnter={(e) => {
              if (selectedRole !== 'patient') {
                e.currentTarget.style.borderColor = '#a7f3d0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== 'patient') {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={styles.cardIcon}>🏥</div>
            <div style={styles.cardTitle}>I am a Patient</div>
            <div style={styles.cardDesc}>Search & compare medicine prices</div>
          </div>

          {/* Pharmacy Card */}
          <div
            style={{
              ...styles.card,
              ...(selectedRole === 'pharmacy' ? styles.cardSelected : {}),
            }}
            onClick={() => setSelectedRole('pharmacy')}
            onMouseEnter={(e) => {
              if (selectedRole !== 'pharmacy') {
                e.currentTarget.style.borderColor = '#a7f3d0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== 'pharmacy') {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={styles.cardIcon}>💊</div>
            <div style={styles.cardTitle}>I am a Pharmacy</div>
            <div style={styles.cardDesc}>List your medicines & prices</div>
          </div>
        </div>

        <button
          style={{
            ...styles.continueBtn,
            ...(!selectedRole ? styles.continueBtnDisabled : {}),
          }}
          disabled={!selectedRole}
          onClick={handleContinue}
          onMouseEnter={(e) => {
            if (selectedRole) {
              e.currentTarget.style.background = '#178c65';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedRole) {
              e.currentTarget.style.background = '#1D9E75';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          Continue →
        </button>
        {!selectedRole && (
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            👆 Select a role to proceed
          </p>
        )}
      </div>
    </div>
  );
}

export default RoleSelector;
