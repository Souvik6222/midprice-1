import React from 'react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  card: { background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1.5rem' },
  infoRow: { display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' },
  label: { width: '100px', fontWeight: 600, color: '#6b7280' },
  value: { fontWeight: 700, color: '#1a1a2e' },
  logoutBtn: { padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, marginTop: '1.5rem', cursor: 'pointer' },
};

function Settings() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/select-role');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>Pharmacy Settings</div>
        <div style={styles.infoRow}>
          <div style={styles.label}>Name</div>
          <div style={styles.value}>{user?.name || 'Pharmacy'}</div>
        </div>
        <div style={styles.infoRow}>
          <div style={styles.label}>Role</div>
          <div style={styles.value} style={{ textTransform: 'capitalize' }}>{user?.role || 'pharmacy'}</div>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}

export default Settings;
