import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const s = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "var(--font-family, 'Inter', sans-serif)",
    overflow: 'hidden',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftGlow: {
    position: 'absolute',
    top: '20%',
    left: '30%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    filter: 'blur(40px)',
  },
  leftGlow2: {
    position: 'absolute',
    bottom: '10%',
    right: '20%',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29,158,117,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
    filter: 'blur(30px)',
  },
  appName: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-1.5px',
    marginBottom: '0.75rem',
    zIndex: 1,
  },
  tagline: {
    fontSize: '1.05rem',
    color: 'rgba(255,255,255,0.55)',
    fontWeight: 400,
    textAlign: 'center',
    maxWidth: '300px',
    lineHeight: 1.7,
    zIndex: 1,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    background: 'var(--color-bg, #f7f5f2)',
  },
  formCard: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--color-bg-elevated, #fff)',
    borderRadius: 'var(--radius-xl, 20px)',
    padding: '2.5rem',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--color-border-light, #edeae5)',
  },
  heading: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #1a1a1a)',
    marginBottom: '0.3rem',
    letterSpacing: '-0.3px',
  },
  subtext: {
    fontSize: '0.88rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
    marginBottom: '1.75rem',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.85rem',
    borderRadius: 'var(--radius-full, 9999px)',
    background: 'var(--color-primary-light, #e6f7f1)',
    color: 'var(--color-primary, #1D9E75)',
    fontSize: '0.78rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    textTransform: 'capitalize',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary, #5a5a5a)',
    marginBottom: '0.5rem',
    display: 'block',
  },
  phoneInputWrapper: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  countryCode: {
    padding: '0.75rem 0.85rem',
    borderRadius: 'var(--radius-md, 12px)',
    border: '1px solid var(--color-border, #e5e2dc)',
    background: 'var(--color-bg-subtle, #faf9f7)',
    fontSize: '0.9rem',
    fontWeight: 600,
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text-secondary, #5a5a5a)',
    width: '65px',
    textAlign: 'center',
    outline: 'none',
  },
  phoneInput: {
    flex: 1,
    padding: '0.75rem 0.85rem',
    borderRadius: 'var(--radius-md, 12px)',
    border: '1px solid var(--color-border, #e5e2dc)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'all 200ms ease',
    background: 'var(--color-bg-elevated, #fff)',
  },
  primaryBtn: {
    width: '100%',
    padding: '0.8rem',
    fontSize: '0.92rem',
    fontWeight: 600,
    fontFamily: 'var(--font-family)',
    color: '#fff',
    background: 'var(--color-primary, #1D9E75)',
    border: 'none',
    borderRadius: 'var(--radius-md, 12px)',
    cursor: 'pointer',
    letterSpacing: '0.2px',
  },
  primaryBtnDisabled: {
    background: 'var(--color-border, #e5e2dc)',
    color: 'var(--color-text-muted, #b0aca6)',
    cursor: 'not-allowed',
  },
  otpSection: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  otpLabel: {
    fontSize: '0.82rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary, #5a5a5a)',
    marginBottom: '1rem',
    display: 'block',
    lineHeight: 1.5,
  },
  otpWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  otpInput: {
    width: '46px',
    height: '52px',
    borderRadius: 'var(--radius-md, 12px)',
    border: '1px solid var(--color-border, #e5e2dc)',
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text-primary, #1a1a1a)',
    outline: 'none',
    transition: 'all 200ms ease',
    background: 'var(--color-bg-elevated, #fff)',
  },
  resendRow: {
    marginTop: '1rem',
    fontSize: '0.82rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
  },
  resendLink: {
    color: 'var(--color-primary, #1D9E75)',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-family)',
    fontSize: '0.82rem',
    textDecoration: 'none',
  },
};

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || 'patient';

  const [phone, setPhone] = useState(role === 'patient' ? '9876543210' : '9876543211');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const glowRef = useRef(null);
  const glow2Ref = useRef(null);
  const setUser = useAuthStore((state) => state.setUser);

  /* GSAP: Floating glow orbs */
  useEffect(() => {
    if (glowRef.current) {
      gsap.to(glowRef.current, { x: 25, y: -18, duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
    if (glow2Ref.current) {
      gsap.to(glow2Ref.current, { x: -20, y: 12, duration: 9, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
  }, []);

  const handleSendOtp = () => {
    if (phone.length >= 10) setOtpSent(true);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    // Map 'pharmacy' → 'vendor' (what the backend User model expects)
    const backendRole = role === 'pharmacy' ? 'vendor' : role;
    try {
      let data;
      try {
        // Try login first
        const res = await api.post('/api/auth/login', { phone, otp: otpValue });
        data = res.data;
      } catch (loginErr) {
        // If user not found, auto-register them
        if (loginErr.response?.status === 404) {
          const res = await api.post('/api/auth/register', {
            phone,
            role: backendRole,
            name: backendRole === 'vendor' ? 'Pharmacy' : 'Patient',
          });
          data = res.data;
        } else {
          throw loginErr;
        }
      }
      setUser(data.user, data.token);
      if (data.user.role === 'vendor' || data.user.role === 'pharmacy') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/patient/search');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div style={s.container}>
      {/* Left Panel */}
      <motion.div
        style={s.leftPanel}
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div ref={glowRef} style={s.leftGlow} />
        <div ref={glow2Ref} style={s.leftGlow2} />
        <motion.div
          style={s.appName}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          MedPrice
        </motion.div>
        <motion.div
          style={s.tagline}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Secure login with OTP verification. No passwords needed.
        </motion.div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        style={s.rightPanel}
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          style={s.formCard}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <div style={s.heading}>Login to MedPrice</div>
            <div style={s.subtext}>Enter your phone number to continue</div>
            <div style={s.roleBadge}>Logging in as {role}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <label style={s.label}>Phone Number</label>
            <div style={s.phoneInputWrapper}>
              <input style={s.countryCode} value="+91" readOnly />
              <input
                style={s.phoneInput}
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary, #1D9E75)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29,158,117,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="send-otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  style={{
                    ...s.primaryBtn,
                    ...(phone.length < 10 ? s.primaryBtnDisabled : {}),
                  }}
                  disabled={phone.length < 10}
                  onClick={handleSendOtp}
                  whileHover={phone.length >= 10 ? { scale: 1.02, backgroundColor: '#178c65' } : {}}
                  whileTap={phone.length >= 10 ? { scale: 0.97 } : {}}
                >
                  Send OTP
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="otp-section"
                style={s.otpSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <label style={s.otpLabel}>
                  Enter the 6-digit OTP sent to +91 {phone}
                </label>
                <div style={s.otpWrapper}>
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      style={s.otpInput}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary, #1D9E75)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(29,158,117,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = '';
                      }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 20 }}
                    />
                  ))}
                </div>

                <motion.button
                  style={{
                    ...s.primaryBtn,
                    ...(!isOtpComplete ? s.primaryBtnDisabled : {}),
                  }}
                  disabled={!isOtpComplete}
                  onClick={handleVerify}
                  whileHover={isOtpComplete ? { scale: 1.02, backgroundColor: '#178c65' } : {}}
                  whileTap={isOtpComplete ? { scale: 0.97 } : {}}
                >
                  Verify & Login
                </motion.button>

                <div style={s.resendRow}>
                  Didn't receive OTP?{' '}
                  <button
                    style={s.resendLink}
                    onClick={() => setOtp(['', '', '', '', '', ''])}
                  >
                    Resend
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
