import React from 'react';

const Logo = ({ height = 30, variant = 'light', style }) => {
  // variant 'light' means the "Med" text is white (for dark backgrounds)
  // variant 'dark' means the "Med" text is dark (for light backgrounds)
  const medColor = variant === 'light' ? '#fff' : '#0f172a';
  const priceColor = '#1D9E75';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', ...style }}>
      <svg 
        width={height * 2.5} 
        height={height} 
        viewBox="0 0 75 30" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect x="0" y="0" width="70" height="30" rx="15" fill="#1D9E75" />
        <path d="M 35 0 L 55 0 C 63.28 0 70 6.72 70 15 C 70 23.28 63.28 30 55 30 L 35 30 Z" fill="white" />
        <path d="M 35 0 L 55 0 C 63.28 0 70 6.72 70 15 C 70 23.28 63.28 30 55 30 L 35 30" stroke="#1D9E75" strokeWidth="2.5" />
        <path d="M 52.5 10 L 52.5 20 M 48.5 16 L 52.5 20 L 56.5 16" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ 
        fontSize: height * 0.9, 
        fontWeight: 800, 
        letterSpacing: '-1.5px', 
        display: 'flex',
        lineHeight: 1
      }}>
        <span style={{ color: medColor }}>Med</span>
        <span style={{ color: priceColor }}>Price</span>
      </div>
    </div>
  );
};

export default Logo;
