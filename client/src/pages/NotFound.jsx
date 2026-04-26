import React from 'react';
import { useNavigate } from 'react-router-dom';

const s = {
  page: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf7 0%, #e0f2fe 100%)' },
  card: { textAlign: 'center', background: '#fff', borderRadius: '20px', padding: '3rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', maxWidth: '420px', width: '100%' },
  code: { fontSize: '5rem', fontWeight: 800, color: '#1D9E75', lineHeight: 1, marginBottom: '0.5rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.5rem' },
  text: { fontSize: '0.95rem', color: '#6b7280', marginBottom: '2rem' },
  btn: { padding: '0.8rem 2rem', borderRadius: '12px', border: 'none', background: '#1D9E75', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,158,117,0.3)', transition: 'background 0.2s ease' },
};

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.code}>404</div>
        <div style={s.heading}>Page not found</div>
        <div style={s.text}>The page you're looking for doesn't exist or has been moved.</div>
        <button style={s.btn} onClick={() => navigate('/')} onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')} onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}>Go Home</button>
      </div>
    </div>
  );
}

export default NotFound;
