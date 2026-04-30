import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { MapPin, Star, Search as SearchIcon } from 'lucide-react';

/* ── Filter chip definitions ── */
const filterOptions = [
  { key: 'openNow', label: 'Open Now' },
  { key: 'isGeneric', label: 'Generic Available' },
  { key: 'withinRange', label: 'Within 5km' },
  { key: 'inStock', label: 'In Stock' },
];

/* ── Styles ── */
const s = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  /* Search Bar */
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    background: 'var(--color-bg-elevated, #fff)',
    padding: '0.65rem 0.75rem',
    borderRadius: 'var(--radius-lg, 16px)',
    border: '1px solid var(--color-border-light, #edeae5)',
    transition: 'all 200ms ease',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text-primary, #1a1a1a)',
    padding: '0 0.5rem',
    background: 'transparent',
  },
  searchBtn: {
    background: 'var(--color-primary, #1D9E75)',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1.25rem',
    borderRadius: 'var(--radius-md, 12px)',
    fontWeight: 600,
    fontSize: '0.82rem',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    transition: 'background 200ms ease',
    letterSpacing: '0.2px',
  },
  /* Top Bar */
  topBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  resultCount: {
    fontSize: '0.82rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
    fontWeight: 500,
  },
  controlsWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  filters: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  chip: {
    padding: '0.35rem 0.85rem',
    borderRadius: 'var(--radius-full, 9999px)',
    border: '1px solid var(--color-border, #e5e2dc)',
    background: 'var(--color-bg-elevated, #fff)',
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text-secondary, #5a5a5a)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  chipActive: {
    border: '1px solid var(--color-primary, #1D9E75)',
    background: 'var(--color-primary-light, #e6f7f1)',
    color: 'var(--color-primary, #1D9E75)',
  },
  sortSelect: {
    padding: '0.35rem 0.85rem',
    borderRadius: 'var(--radius-md, 12px)',
    border: '1px solid var(--color-border, #e5e2dc)',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-family)',
    color: 'var(--color-text-secondary, #5a5a5a)',
    fontWeight: 500,
    outline: 'none',
    cursor: 'pointer',
    background: 'var(--color-bg-elevated, #fff)',
  },

  /* Cards Grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'var(--color-bg-elevated, #fff)',
    borderRadius: 'var(--radius-lg, 16px)',
    padding: '1.25rem',
    border: '1px solid var(--color-border-light, #edeae5)',
    transition: 'all 200ms ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardCheapest: {
    border: '1.5px solid #a7f3d0',
    background: 'var(--color-primary-subtle, #f0fdf7)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.85rem',
  },
  medName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #1a1a1a)',
    marginBottom: '0.15rem',
  },
  medMeta: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #b0aca6)',
    fontWeight: 500,
  },
  priceBlock: {
    textAlign: 'right',
  },
  mrp: {
    fontSize: '0.72rem',
    color: 'var(--color-text-muted, #b0aca6)',
    textDecoration: 'line-through',
    marginBottom: '0.1rem',
  },
  price: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--color-primary, #1D9E75)',
  },
  cardMiddle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    paddingBottom: '0.85rem',
    borderBottom: '1px solid var(--color-border-light, #edeae5)',
  },
  pharmacyName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary, #5a5a5a)',
  },
  distance: {
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary, #8b8b8b)',
  },
  stockText: {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  stockDot: {
    display: 'inline-block',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    marginRight: '0.35rem',
  },
  savingsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.55rem',
    borderRadius: 'var(--radius-sm, 8px)',
    background: 'var(--color-warning-bg, #fefce8)',
    color: 'var(--color-warning, #ca8a04)',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  lowestBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.55rem',
    borderRadius: 'var(--radius-sm, 8px)',
    background: 'var(--color-primary-light, #e6f7f1)',
    color: 'var(--color-primary, #1D9E75)',
    fontSize: '0.68rem',
    fontWeight: 700,
    gap: '0.25rem',
  },
  cardBottom: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '0.85rem',
  },
  btnOutline: {
    flex: 1,
    padding: '0.55rem',
    borderRadius: 'var(--radius-md, 12px)',
    border: '1px solid var(--color-border, #e5e2dc)',
    background: 'var(--color-bg-elevated, #fff)',
    color: 'var(--color-text-secondary, #5a5a5a)',
    fontWeight: 600,
    fontSize: '0.78rem',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  btnFilled: {
    flex: 1,
    padding: '0.55rem',
    borderRadius: 'var(--radius-md, 12px)',
    border: 'none',
    background: 'var(--color-primary, #1D9E75)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.78rem',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    letterSpacing: '0.2px',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--color-text-muted, #b0aca6)',
    fontSize: '0.9rem',
  },
};

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryFromUrl = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('low-to-high');
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryFromUrl) {
      setLoading(true);
      api.get(`/api/medicines/search?q=${queryFromUrl}&lat=22.5726&lng=88.3639`)
        .then((res) => {
          const formatted = res.data.results.map((item, index) => ({
            id: item.medicine.id,
            inventoryId: item.inventoryId,
            pharmacyId: item.pharmacy.id,
            name: item.medicine.name,
            dosage: item.medicine.dosage,
            packSize: item.medicine.packSize,
            pharmacy: item.pharmacy.name,
            distance: `${item.distance} km`,
            mrp: item.mrp,
            price: item.sellingPrice,
            inStock: item.stockQty > 0,
            isGeneric: !!item.medicine.genericName,
            openNow: true,
            withinRange: item.distance <= 5,
          }));
          setAllResults(formatted);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setAllResults([]);
    }
  }, [queryFromUrl]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const toggleFilter = (key) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const processedResults = useMemo(() => {
    let results = [...allResults];
    if (activeFilters.includes('openNow')) results = results.filter((r) => r.openNow);
    if (activeFilters.includes('isGeneric')) results = results.filter((r) => r.isGeneric);
    if (activeFilters.includes('withinRange')) results = results.filter((r) => r.withinRange);
    if (activeFilters.includes('inStock')) results = results.filter((r) => r.inStock);
    if (sortBy === 'low-to-high') results.sort((a, b) => a.price - b.price);
    else if (sortBy === 'high-to-low') results.sort((a, b) => b.price - a.price);
    return results;
  }, [activeFilters, sortBy, allResults]);

  const cheapestPrice =
    processedResults.length > 0
      ? Math.min(...processedResults.map((r) => r.price))
      : null;

  return (
    <motion.div
      style={s.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Search Bar */}
      <motion.form
        style={s.searchForm}
        onSubmit={handleSearch}
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <input
          style={s.input}
          type="text"
          placeholder="Search medicines..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <motion.button
          type="submit"
          style={s.searchBtn}
          whileHover={{ scale: 1.04, backgroundColor: '#178c65' }}
          whileTap={{ scale: 0.96 }}
        >
          Search
        </motion.button>
      </motion.form>

      {/* Toolbar */}
      <motion.div
        style={s.topBar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <div style={s.controlsWrap}>
          <div style={s.filters}>
            {filterOptions.map((opt) => {
              const isActive = activeFilters.includes(opt.key);
              return (
                <motion.div
                  key={opt.key}
                  style={{ ...s.chip, ...(isActive ? s.chipActive : {}) }}
                  onClick={() => toggleFilter(opt.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {opt.label}
                </motion.div>
              );
            })}
          </div>
          <select
            style={s.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="low-to-high">Price: Low → High</option>
            <option value="high-to-low">Price: High → Low</option>
          </select>
        </div>
      </motion.div>

      {/* Result Count */}
      <motion.div
        style={s.resultCount}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {processedResults.length} result{processedResults.length !== 1 ? 's' : ''} found
        {queryFromUrl ? ` for "${queryFromUrl}"` : ''}
      </motion.div>

      {/* Result cards */}
      {loading ? (
        <motion.div
          style={s.empty}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Loading medicines...
        </motion.div>
      ) : processedResults.length === 0 ? (
        <motion.div
          style={s.empty}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          No medicines match your search. Try a different query.
        </motion.div>
      ) : (
        <motion.div
          style={s.grid}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.07 } },
          }}
        >
          {processedResults.map((med, index) => {
            const isCheapest = med.price === cheapestPrice;
            const savings = med.mrp - med.price;

            return (
              <motion.div
                key={`${med.inventoryId || med.id}-${index}`}
                style={{
                  ...s.card,
                  ...(isCheapest ? s.cardCheapest : {}),
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                }}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
              >
                <div style={s.cardTop}>
                  <div>
                    <div style={s.medName}>{med.name}</div>
                    <div style={s.medMeta}>{med.dosage} · {med.packSize}</div>
                  </div>
                  <div style={s.priceBlock}>
                    <div style={s.mrp}>₹{med.mrp}</div>
                    <div style={s.price}>₹{med.price}</div>
                  </div>
                </div>

                <div style={s.cardMiddle}>
                  <span style={s.pharmacyName}>{med.pharmacy}</span>
                  <span style={{...s.distance, display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <MapPin size={12} /> {med.distance}
                  </span>
                  <span>
                    <span style={{ ...s.stockDot, background: med.inStock ? '#22c55e' : '#ef4444' }} />
                    <span style={{ ...s.stockText, color: med.inStock ? '#22c55e' : '#ef4444' }}>
                      {med.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </span>
                  {savings > 0 && <span style={s.savingsBadge}>Save ₹{savings}</span>}
                  {isCheapest && (
                    <span style={{...s.lowestBadge, display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                      <Star size={10} fill="#1D9E75" /> Lowest Price
                    </span>
                  )}
                </div>

                <div style={s.cardBottom}>
                  <motion.button
                    style={s.btnOutline}
                    onClick={() => navigate(`/patient/medicine/${med.id}`)}
                    whileHover={{ scale: 1.03, borderColor: '#1D9E75', color: '#1D9E75' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Compare Prices
                  </motion.button>
                  <motion.button
                    style={s.btnFilled}
                    onClick={() => navigate(`/patient/reservation/${med.id}?pharmacyId=${med.pharmacyId}&name=${encodeURIComponent(med.name)}&mrp=${med.mrp}&price=${med.price}&pharmacyName=${encodeURIComponent(med.pharmacy)}`)}
                    whileHover={{ scale: 1.03, backgroundColor: '#178c65' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Reserve
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

export default SearchResults;
