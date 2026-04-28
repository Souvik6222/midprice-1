import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
    distance: '1.2 km',
    mrp: 145,
    price: 112,
    inStock: true,
    isGeneric: false,
    openNow: true,
    withinRange: true,
  },
  {
    id: 3,
    name: 'Metformin 500mg',
    dosage: '500mg',
    packSize: 'Strip of 15 tablets',
    pharmacy: 'Wellness Forever',
    distance: '2.5 km',
    mrp: 145,
    price: 85,
    inStock: true,
    isGeneric: true,
    openNow: false,
    withinRange: false,
  },
  {
    id: 4,
    name: 'Metformin 500mg',
    dosage: '500mg',
    packSize: 'Strip of 15 tablets',
    pharmacy: 'NetMeds Store',
    distance: '1.8 km',
    mrp: 145,
    price: 105,
    inStock: false,
    isGeneric: true,
    openNow: true,
    withinRange: true,
  },
  {
    id: 5,
    name: 'Metformin 500mg',
    dosage: '500mg',
    packSize: 'Strip of 15 tablets',
    pharmacy: 'HealthKart Pharmacy',
    distance: '0.5 km',
    mrp: 145,
    price: 92,
    inStock: true,
    isGeneric: false,
    openNow: true,
    withinRange: true,
  },
];

/* ── Filter chip definitions ── */
const filterOptions = [
  { key: 'openNow', label: 'Open Now' },
  { key: 'isGeneric', label: 'Generic Available' },
  { key: 'withinRange', label: 'Within 2km' },
  { key: 'inStock', label: 'In Stock' },
];

/* ── Styles ── */
const s = {
  page: {
    maxWidth: '860px',
  },

  /* Search bar */
  searchForm: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  searchBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },

  /* Toolbar: filters + sort */
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  chipsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  chipBase: {
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1.5px solid #1D9E75',
    userSelect: 'none',
  },
  chipActive: {
    background: '#1D9E75',
    color: '#fff',
  },
  chipInactive: {
    background: '#fff',
    color: '#1D9E75',
  },
  sortSelect: {
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    fontSize: '0.85rem',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer',
  },

  /* Result count */
  resultCount: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginBottom: '1rem',
  },

  /* Card */
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #f3f4f6',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
  },
  cardCheapest: {
    borderLeft: '3px solid #1D9E75',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  medName: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  medMeta: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '0.15rem',
  },
  priceBlock: {
    textAlign: 'right',
  },
  mrp: {
    fontSize: '0.85rem',
    color: '#d1d5db',
    textDecoration: 'line-through',
  },
  price: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#1D9E75',
  },
  cardMiddle: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  pharmacyName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#374151',
  },
  distance: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  stockDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '4px',
  },
  stockText: {
    fontSize: '0.78rem',
    fontWeight: 500,
  },
  savingsBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '8px',
    background: '#fef3c7',
    color: '#b45309',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  lowestBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '8px',
    background: '#f0fdf7',
    color: '#1D9E75',
    fontSize: '0.7rem',
    fontWeight: 700,
    marginLeft: '0.5rem',
    border: '1px solid #a7f3d0',
  },
  cardBottom: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
  },
  btnOutline: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '10px',
    border: '1.5px solid #1D9E75',
    background: '#fff',
    color: '#1D9E75',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnFilled: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '10px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(29,158,117,0.25)',
  },

  /* Empty state */
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#9ca3af',
    fontSize: '0.95rem',
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
            id: item.medicine.id, // For routing to MedicineDetail
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
          // Group by medicine ID to avoid duplicates if we want unique medicines
          // Actually, let's keep all inventory results for the search page since they have pharmacy names.
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

  /* ── Update URL on search ── */
  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  /* ── Toggle filter chips ── */
  const toggleFilter = (key) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  /* ── Filter + sort the list ── */
  const processedResults = useMemo(() => {
    let results = [...allResults];

    // Apply active filters
    if (activeFilters.includes('openNow')) {
      results = results.filter((r) => r.openNow);
    }
    if (activeFilters.includes('isGeneric')) {
      results = results.filter((r) => r.isGeneric);
    }
    if (activeFilters.includes('withinRange')) {
      results = results.filter((r) => r.withinRange);
    }
    if (activeFilters.includes('inStock')) {
      results = results.filter((r) => r.inStock);
    }

    // Sort
    if (sortBy === 'low-to-high') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-to-low') {
      results.sort((a, b) => b.price - a.price);
    }

    return results;
  }, [activeFilters, sortBy]);

  /* ── Cheapest price ── */
  const cheapestPrice =
    processedResults.length > 0
      ? Math.min(...processedResults.map((r) => r.price))
      : null;

  return (
    <div style={s.page}>
      {/* ── Search Bar ── */}
      <form style={s.searchForm} onSubmit={handleSearch}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Search medicines..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = '#1D9E75')}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />
        <button
          type="submit"
          style={s.searchBtn}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
        >
          🔍 Search
        </button>
      </form>

      {/* ── Toolbar: Filters + Sort ── */}
      <div style={s.toolbar}>
        <div style={s.chipsRow}>
          {filterOptions.map((opt) => {
            const isActive = activeFilters.includes(opt.key);
            return (
              <div
                key={opt.key}
                style={{
                  ...s.chipBase,
                  ...(isActive ? s.chipActive : s.chipInactive),
                }}
                onClick={() => toggleFilter(opt.key)}
              >
                {opt.label}
              </div>
            );
          })}
        </div>

        <select
          style={s.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>
      </div>

      {/* ── Result Count ── */}
      <div style={s.resultCount}>
        {processedResults.length} result{processedResults.length !== 1 ? 's' : ''} found
        {queryFromUrl ? ` for "${queryFromUrl}"` : ''}
      </div>

      {/* ── Result cards ── */}
      {loading ? (
        <div style={s.empty}>Loading medicines...</div>
      ) : processedResults.length === 0 ? (
        <div style={s.empty}>
          No medicines match your current filters. Try adjusting your search.
        </div>
      ) : (
        processedResults.map((med) => {
          const isCheapest = med.price === cheapestPrice;
          const savings = med.mrp - med.price;

          return (
            <div
              key={med.id}
              style={{
                ...s.card,
                ...(isCheapest ? s.cardCheapest : {}),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 6px 20px rgba(0,0,0,0.07)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 1px 4px rgba(0,0,0,0.04)';
              }}
            >
              {/* Top row: name + price */}
              <div style={s.cardTop}>
                <div>
                  <div style={s.medName}>{med.name}</div>
                  <div style={s.medMeta}>
                    {med.dosage} · {med.packSize}
                  </div>
                </div>
                <div style={s.priceBlock}>
                  <div style={s.mrp}>₹{med.mrp}</div>
                  <div style={s.price}>₹{med.price}</div>
                </div>
              </div>

              {/* Middle row: pharmacy, stock, savings */}
              <div style={s.cardMiddle}>
                <span style={s.pharmacyName}>{med.pharmacy}</span>
                <span style={s.distance}>📍 {med.distance}</span>
                <span>
                  <span
                    style={{
                      ...s.stockDot,
                      background: med.inStock ? '#22c55e' : '#ef4444',
                    }}
                  />
                  <span
                    style={{
                      ...s.stockText,
                      color: med.inStock ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {med.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </span>
                {savings > 0 && (
                  <span style={s.savingsBadge}>Save ₹{savings}</span>
                )}
                {isCheapest && (
                  <span style={s.lowestBadge}>⭐ Lowest Price</span>
                )}
              </div>

              {/* Bottom row: buttons */}
              <div style={s.cardBottom}>
                <button
                  style={s.btnOutline}
                  onClick={() => navigate(`/patient/medicine/${med.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0fdf7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  ⚖️ Compare Prices
                </button>
                <button
                  style={s.btnFilled}
                  onClick={() => navigate(`/patient/reservation/${med.id}?pharmacyId=${med.pharmacyId}&name=${encodeURIComponent(med.name)}&mrp=${med.mrp}&price=${med.price}&pharmacyName=${encodeURIComponent(med.pharmacy)}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#178c65';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1D9E75';
                  }}
                >
                  🛒 Reserve
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default SearchResults;
