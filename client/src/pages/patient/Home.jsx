import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Pill, IndianRupee, Store, Flame, Hand } from 'lucide-react';

const s = {
  page: { maxWidth: '960px' },
  greeting: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #1a1a1a)',
    marginBottom: '0.35rem',
    letterSpacing: '-0.3px',
  },
  greetingSub: {
    fontSize: '0.88rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
    marginBottom: '2rem',
    fontWeight: 400,
  },
  statsRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    flex: 1,
    background: 'var(--color-bg-elevated, #fff)',
    borderRadius: 'var(--radius-lg, 16px)',
    padding: '1.5rem',
    border: '1px solid var(--color-border-light, #edeae5)',
    cursor: 'default',
    overflow: 'hidden',
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--color-text-muted, #b0aca6)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '0.65rem',
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #1a1a1a)',
    letterSpacing: '-0.5px',
  },
  statIcon: {
    fontSize: '1.4rem',
    marginBottom: '0.65rem',
    display: 'block',
  },
  sectionHeading: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #1a1a1a)',
    marginBottom: '1rem',
    letterSpacing: '-0.2px',
  },
  scrollRow: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    paddingBottom: '0.75rem',
  },
  medCard: {
    minWidth: '260px',
    background: 'var(--color-bg-elevated, #fff)',
    borderRadius: 'var(--radius-lg, 16px)',
    padding: '1.25rem 1.5rem',
    border: '1px solid var(--color-border-light, #edeae5)',
    flex: '0 0 auto',
    cursor: 'default',
  },
  medName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #1a1a1a)',
    marginBottom: '0.2rem',
  },
  medPharmacy: {
    fontSize: '0.78rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
    marginBottom: '0.85rem',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.6rem',
  },
  mrp: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted, #b0aca6)',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--color-primary, #1D9E75)',
  },
  savingsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.65rem',
    borderRadius: 'var(--radius-sm, 8px)',
    background: 'var(--color-warning-bg, #fefce8)',
    color: 'var(--color-warning, #ca8a04)',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.2px',
  },
};

const statsData = [
  { icon: <Pill size={24} color="#3b82f6" />, label: 'Medicines Tracked', value: 12, prefix: '' },
  { icon: <IndianRupee size={24} color="#1D9E75" />, label: 'Avg Savings', value: 340, prefix: '₹' },
  { icon: <Store size={24} color="#f59e0b" />, label: 'Nearby Pharmacies', value: 8, prefix: '' },
];

/* Framer Motion variants */
const cardHover = {
  rest: { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' },
  hover: { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', transition: { type: 'spring', stiffness: 400, damping: 20 } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

/* GSAP animated counter hook */
function useCountUp(target, duration = 1.2) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      delay: 0.5,
      onUpdate: () => {
        el.textContent = Math.round(obj.val);
      },
    });
  }, [target, duration]);
  return ref;
}

function StatCard({ stat, index }) {
  const counterRef = useCountUp(stat.value, 1 + index * 0.2);

  return (
    <motion.div
      style={s.statCard}
      variants={fadeUp}
      initial="rest"
      whileHover="hover"
    >
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        style={{ height: '100%' }}
      >
        <span style={s.statIcon}>{stat.icon}</span>
        <div style={s.statLabel}>{stat.label}</div>
        <div style={s.statValue}>
          {stat.prefix}
          <span ref={counterRef}>0</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Home() {
  const [priceDrops] = useState([
    { id: 1, name: 'Paracetamol 500mg', pharmacy: 'Apollo Pharmacy, Sector 5', mrp: 85, price: 42, savings: 43 },
    { id: 2, name: 'Amoxicillin 250mg', pharmacy: 'MedPlus, Park Street', mrp: 220, price: 165, savings: 55 },
    { id: 3, name: 'Cetirizine 10mg', pharmacy: 'Wellness Forever, Salt Lake', mrp: 60, price: 32, savings: 28 },
  ]);

  return (
    <motion.div
      style={s.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Greeting */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div style={{...s.greeting, display: 'flex', alignItems: 'center', gap: '8px'}}>Good morning <Hand size={24} color="#f59e0b" /></div>
        <div style={s.greetingSub}>Here's your health savings overview</div>
      </motion.div>

      {/* Stat Cards with GSAP counters */}
      <motion.div
        style={s.statsRow}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {statsData.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} />
        ))}
      </motion.div>

      {/* Today's Price Drops */}
      <motion.div
        style={{...s.sectionHeading, display: 'flex', alignItems: 'center', gap: '6px'}}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Today's Price Drops <Flame size={20} color="#ef4444" />
      </motion.div>

      <motion.div
        style={s.scrollRow}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {priceDrops.map((med, index) => (
          <motion.div
            key={med.id}
            style={s.medCard}
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <div style={s.medName}>{med.name}</div>
            <div style={s.medPharmacy}>{med.pharmacy}</div>
            <div style={s.priceRow}>
              <span style={s.mrp}>₹{med.mrp}</span>
              <span style={s.currentPrice}>₹{med.price}</span>
            </div>
            <span style={s.savingsBadge}>Save ₹{med.savings}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default Home;
