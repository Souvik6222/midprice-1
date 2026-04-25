import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  formCard: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.3rem',
  },
  subtext: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    background: '#f0fdf7',
    color: '#1D9E75',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    textTransform: 'capitalize',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.5rem',
    display: 'block',
  },
  phoneInputWrapper: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  countryCode: {
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#374151',
    width: '70px',
    textAlign: 'center',
    outline: 'none',
  },
  phoneInput: {
    flex: 1,
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  sendOtpBtn: {
    width: '100%',
    padding: '0.85rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    background: '#1D9E75',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 14px rgba(29,158,117,0.3)',
    marginBottom: '1rem',
  },
  otpSection: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  otpLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '1rem',
    display: 'block',
  },
  otpWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.6rem',
    marginBottom: '1.5rem',
  },
  otpInput: {
    width: '48px',
    height: '56px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    textAlign: 'center',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1a1a2e',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  verifyBtn: {
    width: '100%',
    padding: '0.85rem',
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
  resendRow: {
    marginTop: '1rem',
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  resendLink: {
    color: '#1D9E75',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontSize: '0.85rem',
    textDecoration: 'underline',
  },
};

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || 'patient';

  const [phone, setPhone] = useState('9733064817');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move back on backspace if current box is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join('');
    console.log('Verifying OTP:', otpValue, 'for role:', role);
    
    // Redirect to the appropriate dashboard based on role
    if (role === 'patient') {
      navigate('/patient/home');
    } else {
      // Fallback for pharmacy/vendor if those aren't fully built yet
      navigate('/patient/home');
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftOverlay} />
        <div style={styles.leftOverlay2} />
        <div style={styles.appName}>MedPrice</div>
        <div style={styles.tagline}>
          Secure login with OTP verification. No passwords needed.
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.heading}>Login to MedPrice</div>
          <div style={styles.subtext}>Enter your phone number to continue</div>
          <div style={styles.roleBadge}>🔑 Logging in as {role}</div>

          <label style={styles.label}>Phone Number</label>
          <div style={styles.phoneInputWrapper}>
            <input
              style={styles.countryCode}
              value="+91"
              readOnly
            />
            <input
              style={styles.phoneInput}
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {!otpSent && (
            <button
              style={{
                ...styles.sendOtpBtn,
                ...(phone.length < 10
                  ? { background: '#d1d5db', cursor: 'not-allowed', boxShadow: 'none' }
                  : {}),
              }}
              disabled={phone.length < 10}
              onClick={handleSendOtp}
              onMouseEnter={(e) => {
                if (phone.length >= 10) e.currentTarget.style.background = '#178c65';
              }}
              onMouseLeave={(e) => {
                if (phone.length >= 10) e.currentTarget.style.background = '#1D9E75';
              }}
            >
              Send OTP
            </button>
          )}

          {otpSent && (
            <div style={styles.otpSection}>
              <label style={styles.otpLabel}>
                Enter the 6-digit OTP sent to +91 {phone}
              </label>
              <div style={styles.otpWrapper}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    style={styles.otpInput}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                ))}
              </div>

              <button
                style={{
                  ...styles.verifyBtn,
                  ...(!isOtpComplete
                    ? { background: '#d1d5db', cursor: 'not-allowed', boxShadow: 'none' }
                    : {}),
                }}
                disabled={!isOtpComplete}
                onClick={handleVerify}
                onMouseEnter={(e) => {
                  if (isOtpComplete) e.currentTarget.style.background = '#178c65';
                }}
                onMouseLeave={(e) => {
                  if (isOtpComplete) e.currentTarget.style.background = '#1D9E75';
                }}
              >
                Verify & Login
              </button>

              <div style={styles.resendRow}>
                Didn't receive OTP?{' '}
                <button
                  style={styles.resendLink}
                  onClick={() => {
                    setOtp(['', '', '', '', '', '']);
                    console.log('Resending OTP...');
                  }}
                >
                  Resend
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
