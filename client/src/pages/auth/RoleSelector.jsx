import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Hospital, Pill, ShieldCheck, Zap, Activity } from 'lucide-react';

const s = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "var(--font-family, 'Inter', sans-serif)",
    overflow: 'hidden',
    backgroundColor: '#0f172a', // deep slate
    position: 'relative', // added for absolute SVG positioning
  },
  leftPanel: {
    flex: '1.2',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '4rem',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#fff',
  },
  meshGradient: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `
      radial-gradient(circle at 50% 50%, rgba(29, 158, 117, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 40%)
    `,
    filter: 'blur(60px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glassCard: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    padding: '3rem',
    maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  logoPill: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
  },
  appName: {
    fontSize: '2.2rem',
    fontWeight: 800,
    letterSpacing: '-1.5px',
    display: 'flex',
  },
  appNameMed: {
    color: '#fff',
  },
  appNamePrice: {
    color: '#1D9E75',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '1.5rem',
    letterSpacing: '-1.5px',
  },
  heroHighlight: {
    color: '#1D9E75',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    color: '#94a3b8',
    marginBottom: '2.5rem',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  featureIcon: {
    color: '#1D9E75',
    background: 'rgba(29, 158, 117, 0.1)',
    padding: '0.4rem',
    borderRadius: '8px',
  },
  rightPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    backgroundImage: 'url("https://i.pinimg.com/736x/ae/7b/d3/ae7bd364ac5587581ab6aeb5593a9bde.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#ffffff', // fallback
    position: 'relative',
    borderTopLeftRadius: '32px',
    borderBottomLeftRadius: '32px',
    boxShadow: '-20px 0 50px rgba(0,0,0,0.2)',
  },
  rightContent: {
    width: '100%',
    maxWidth: '440px',
  },
  rightHeading: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '0.5rem',
    letterSpacing: '-0.5px',
  },
  rightSubtext: {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '3rem',
  },
  cardsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '3rem',
  },
  card: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
    borderRadius: '20px',
    border: '2px solid #f1f5f9',
    background: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#1D9E75',
    background: '#f0fdf4',
    boxShadow: '0 20px 40px -15px rgba(29, 158, 117, 0.15)',
  },
  cardIconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1.25rem',
    transition: 'all 0.3s ease',
  },
  cardIconWrapperPatient: {
    background: '#f1f5f9',
    color: '#64748b',
  },
  cardIconWrapperPharmacy: {
    background: '#f1f5f9',
    color: '#64748b',
  },
  cardIconWrapperSelected: {
    background: 'linear-gradient(135deg, #1D9E75 0%, #10b981 100%)',
    color: 'white',
    boxShadow: '0 10px 20px -5px rgba(29, 158, 117, 0.4)',
  },
  cardTextContent: {
    flex: 1,
    paddingRight: '3rem', // Prevent text from overlapping the absolutely positioned check icon
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '0.25rem',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.4,
  },
  checkIcon: {
    position: 'absolute',
    right: '1.5rem',
    color: '#1D9E75',
  },
  actionArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
    transition: 'all 0.3s ease',
  },
  continueBtnDisabled: {
    background: '#e2e8f0',
    color: '#94a3b8',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
};

const cardVariants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  tap: { scale: 0.98 },
  selected: { scale: 1.02, y: -2, transition: { type: 'spring', stiffness: 350, damping: 20 } },
};



const MedPriceLogo = ({ style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', ...style }}>
    <svg width="75" height="30" viewBox="0 0 75 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="70" height="30" rx="15" fill="#1D9E75" />
      <path d="M 35 0 L 55 0 C 63.28 0 70 6.72 70 15 C 70 23.28 63.28 30 55 30 L 35 30 Z" fill="white" />
      <path d="M 35 0 L 55 0 C 63.28 0 70 6.72 70 15 C 70 23.28 63.28 30 55 30 L 35 30" stroke="#1D9E75" strokeWidth="2.5" />
      <path d="M 52.5 10 L 52.5 20 M 48.5 16 L 52.5 20 L 56.5 16" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={s.appName}>
      <span style={s.appNameMed}>Med</span>
      <span style={s.appNamePrice}>Price</span>
    </div>
  </div>
);

function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const meshRef = useRef(null);

  useEffect(() => {
    if (meshRef.current) {
      gsap.to(meshRef.current, {
        rotation: 360,
        duration: 150,
        repeat: -1,
        ease: "linear"
      });
    }
  }, []);

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/auth/login', { state: { role: selectedRole } });
    }
  };

  return (
    <div style={s.container}>
      
      {/* Left Panel - Brand & Value Prop */}
      <motion.div
        style={s.leftPanel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div ref={meshRef} style={s.meshGradient} />
        
        <motion.div
          style={s.glassCard}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring', damping: 20 }}
        >
          <div style={s.logoRow}>
            <MedPriceLogo />
          </div>
          
          <h1 style={s.heroTitle}>
            Smarter healthcare <br />
            <span style={s.heroHighlight}>pricing for all.</span>
          </h1>
          
          <p style={s.heroSubtitle}>
            Join the transparent marketplace connecting patients with local pharmacies for the best deals on essential medicines.
          </p>
          
          <div style={s.featureList}>
            <motion.div style={s.featureItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <div style={s.featureIcon}><ShieldCheck size={18} /></div>
              <span>Verified local pharmacies</span>
            </motion.div>
            <motion.div style={s.featureItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <div style={s.featureIcon}><Zap size={18} /></div>
              <span>Real-time price comparisons</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Panel - Role Selection */}
      <motion.div
        style={s.rightPanel}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', damping: 25 }}
      >
        <div style={s.rightContent}>
          <motion.h2 
            style={s.rightHeading}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Get Started
          </motion.h2>
          <motion.p 
            style={s.rightSubtext}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Choose how you want to use MedPrice today.
          </motion.p>

          <motion.div 
            style={s.cardsWrapper}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Patient Card */}
            <motion.div
              style={{
                ...s.card,
                ...(selectedRole === 'patient' ? s.cardSelected : {}),
              }}
              variants={cardVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              animate={selectedRole === 'patient' ? 'selected' : 'idle'}
              onClick={() => setSelectedRole('patient')}
            >
              <div style={{
                ...s.cardIconWrapper,
                ...(selectedRole === 'patient' ? s.cardIconWrapperSelected : s.cardIconWrapperPatient)
              }}>
                <Hospital size={28} />
              </div>
              <div style={s.cardTextContent}>
                <div style={s.cardTitle}>Patient</div>
                <div style={s.cardDesc}>Find medicines, compare prices, and save on prescriptions.</div>
              </div>
              <AnimatePresence>
                {selectedRole === 'patient' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={s.checkIcon}
                  >
                    <ShieldCheck size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Pharmacy Card */}
            <motion.div
              style={{
                ...s.card,
                ...(selectedRole === 'pharmacy' ? s.cardSelected : {}),
              }}
              variants={cardVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              animate={selectedRole === 'pharmacy' ? 'selected' : 'idle'}
              onClick={() => setSelectedRole('pharmacy')}
            >
              <div style={{
                ...s.cardIconWrapper,
                ...(selectedRole === 'pharmacy' ? s.cardIconWrapperSelected : s.cardIconWrapperPharmacy)
              }}>
                <Pill size={28} />
              </div>
              <div style={s.cardTextContent}>
                <div style={s.cardTitle}>Pharmacy Vendor</div>
                <div style={s.cardDesc}>List inventory, reach more customers, and grow sales.</div>
              </div>
              <AnimatePresence>
                {selectedRole === 'pharmacy' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={s.checkIcon}
                  >
                    <ShieldCheck size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <motion.div 
            style={s.actionArea}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              style={{
                ...s.continueBtn,
                ...(!selectedRole ? s.continueBtnDisabled : {}),
              }}
              disabled={!selectedRole}
              onClick={handleContinue}
              whileHover={selectedRole ? { scale: 1.02, boxShadow: '0 15px 30px -5px rgba(15, 23, 42, 0.4)' } : {}}
              whileTap={selectedRole ? { scale: 0.98 } : {}}
            >
              Continue securely
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default RoleSelector;

