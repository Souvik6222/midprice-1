import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Hospital, Pill, ArrowRight } from 'lucide-react';

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
  rightHeading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #1a1a1a)',
    marginBottom: '0.4rem',
    letterSpacing: '-0.3px',
  },
  rightSubtext: {
    fontSize: '0.9rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
    marginBottom: '2.5rem',
  },
  cardsWrapper: {
    display: 'flex',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  card: {
    width: '210px',
    padding: '2rem 1.5rem',
    borderRadius: 'var(--radius-lg, 16px)',
    border: '1px solid var(--color-border, #e5e2dc)',
    background: 'var(--color-bg-elevated, #fff)',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: 'var(--shadow-xs)',
  },
  cardSelected: {
    border: '1.5px solid var(--color-primary, #1D9E75)',
    background: 'var(--color-primary-subtle, #f0fdf7)',
    boxShadow: '0 4px 16px rgba(29,158,117,0.1)',
  },
  cardIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    display: 'block',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary, #1a1a1a)',
  },
  cardDesc: {
    fontSize: '0.78rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
    marginTop: '0.4rem',
    lineHeight: 1.5,
  },
  continueBtn: {
    padding: '0.8rem 2.5rem',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: '#fff',
    background: 'var(--color-primary, #1D9E75)',
    border: 'none',
    borderRadius: 'var(--radius-md, 12px)',
    cursor: 'pointer',
    letterSpacing: '0.2px',
  },
  continueBtnDisabled: {
    background: 'var(--color-border, #e5e2dc)',
    color: 'var(--color-text-muted, #b0aca6)',
    cursor: 'not-allowed',
  },
  hint: {
    color: 'var(--color-text-muted, #b0aca6)',
    fontSize: '0.78rem',
    marginTop: '0.75rem',
    fontWeight: 500,
  },
};

/* Framer Motion variants */
const cardVariants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
  selected: { scale: 1.02, y: -3, transition: { type: 'spring', stiffness: 350, damping: 18 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const glowRef = useRef(null);
  const glow2Ref = useRef(null);

  /* GSAP: Floating glow animation on the dark panel */
  useEffect(() => {
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: 30, y: -20,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }
    if (glow2Ref.current) {
      gsap.to(glow2Ref.current, {
        x: -25, y: 15,
        duration: 8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
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
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          MedPrice
        </motion.div>
        <motion.div
          style={s.tagline}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          Compare medicine prices across pharmacies. Save money on every prescription.
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
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <motion.div variants={staggerItem} style={s.rightHeading}>
            Welcome to MedPrice
          </motion.div>
          <motion.div variants={staggerItem} style={s.rightSubtext}>
            Select your role to get started
          </motion.div>

          <motion.div variants={staggerItem} style={s.cardsWrapper}>
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
              <motion.span
                style={{...s.cardIcon, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                animate={selectedRole === 'patient' ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Hospital size={40} color={selectedRole === 'patient' ? "#1D9E75" : "#6b7280"} />
              </motion.span>
              <div style={s.cardTitle}>I am a Patient</div>
              <div style={s.cardDesc}>Search & compare medicine prices near you</div>
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
              <motion.span
                style={{...s.cardIcon, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                animate={selectedRole === 'pharmacy' ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Pill size={40} color={selectedRole === 'pharmacy' ? "#1D9E75" : "#6b7280"} />
              </motion.span>
              <div style={s.cardTitle}>I am a Pharmacy</div>
              <div style={s.cardDesc}>List your medicines & manage inventory</div>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <motion.button
              style={{
                ...s.continueBtn,
                ...(!selectedRole ? s.continueBtnDisabled : {}),
              }}
              disabled={!selectedRole}
              onClick={handleContinue}
              whileHover={selectedRole ? { scale: 1.04, backgroundColor: '#178c65' } : {}}
              whileTap={selectedRole ? { scale: 0.97 } : {}}
            >
              Continue <ArrowRight size={20} />
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {!selectedRole && (
              <motion.p
                style={s.hint}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                Select a role above to proceed
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default RoleSelector;
