import React from 'react';

const styles = {
  container: { padding: '3rem', textAlign: 'center' },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1rem' },
  subtitle: { fontSize: '1rem', color: '#9ca3af' },
};

function Saved() {
  return (
    <div style={styles.container}>
      <div style={styles.title}>Saved Medicines</div>
      <div style={styles.subtitle}>Feature coming soon!</div>
    </div>
  );
}

export default Saved;
