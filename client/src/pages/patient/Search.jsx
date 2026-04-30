import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

/* ─── Fix default marker icons (leaflet + webpack issue) ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* Custom pharmacy marker */
const pharmacyIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50%;background:#1D9E75;
    display:flex;align-items:center;justify-content:center;
    border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);
    color:#fff;font-weight:800;font-size:16px;font-family:sans-serif;
  ">💊</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
});

/* User location marker */
const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;background:#3b82f6;
    border:3px solid #fff;box-shadow:0 0 0 6px rgba(59,130,246,0.25);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/* Fly map to position */
function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 14, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function PatientSearch() {
  const user     = useAuthStore(s => s.user);
  const logout   = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [userLoc, setUserLoc]   = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [panelOpen, setPanelOpen]   = useState(false);

  const inputRef    = useRef(null);
  const listRef     = useRef(null);

  /* Get user location on mount */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(loc);
          setFlyTarget(loc);
        },
        () => {
          // Default to Kolkata if denied
          const fallback = { lat: 22.5726, lng: 88.3639 };
          setUserLoc(fallback);
          setFlyTarget(fallback);
        }
      );
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const { data } = await api.get('/api/medicines/search', {
        params: { q: query.trim(), lat: userLoc?.lat || 0, lng: userLoc?.lng || 0 },
      });
      setResults(data.results || []);
      setSearched(true);
      setPanelOpen(true);
      // Fly to first result
      if (data.results?.length > 0) {
        const first = data.results[0];
        if (first.pharmacy?.lat && first.pharmacy?.lng) {
          setFlyTarget({ lat: first.pharmacy.lat, lng: first.pharmacy.lng });
        }
      }
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/auth/select-role'); };

  const handleCardClick = (r) => {
    setSelectedId(r.inventoryId);
    if (r.pharmacy?.lat && r.pharmacy?.lng) {
      setFlyTarget({ lat: r.pharmacy.lat, lng: r.pharmacy.lng });
    }
  };

  /* Group results by pharmacy for map markers */
  const pharmacyMap = {};
  results.forEach(r => {
    const pid = r.pharmacy?.id;
    if (!pid) return;
    if (!pharmacyMap[pid]) {
      pharmacyMap[pid] = { ...r.pharmacy, lat: r.pharmacy.lat, lng: r.pharmacy.lng, medicines: [] };
    }
    pharmacyMap[pid].medicines.push(r);
  });
  const pharmacies = Object.values(pharmacyMap).filter(p => p.lat && p.lng);

  const defaultCenter = userLoc || { lat: 22.5726, lng: 88.3639 };

  return (
    <div style={s.shell}>
      {/* ─── MAP ─── */}
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />
        {flyTarget && <FlyTo center={[flyTarget.lat, flyTarget.lng]} zoom={14} />}

        {/* User location */}
        {userLoc && (
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup><b>You are here</b></Popup>
          </Marker>
        )}

        {/* Pharmacy markers */}
        {pharmacies.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pharmacyIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{p.name}</div>
                {p.address && <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '6px' }}>{p.address}</div>}
                {p.medicines.map(m => (
                  <div key={m.inventoryId} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{m.medicine.name}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1D9E75' }}>₹{m.sellingPrice}</span>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ─── TOP BAR (Uber-style) ─── */}
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <div style={s.brand}>
            <span style={s.brandDot} />
            MedPrice
          </div>
        </div>
        <div style={s.topRight}>
          <span style={s.greeting}>Hi, {user?.name || 'User'}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ─── SEARCH CARD (Floating) ─── */}
      <div style={s.searchCard}>
        <div style={s.searchLabel}>Find Medicines Near You</div>
        <form onSubmit={handleSearch} style={s.searchForm}>
          <div style={s.searchDot} />
          <input
            ref={inputRef}
            style={s.searchInput}
            placeholder="Search medicine name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" style={s.searchBtn} disabled={loading}>
            {loading ? '...' : 'Go'}
          </button>
        </form>
        {userLoc && (
          <div style={s.locInfo}>
            <span style={s.locDot} /> Your location detected
          </div>
        )}
      </div>

      {/* ─── BOTTOM RESULTS PANEL (Uber-style slide-up) ─── */}
      {searched && (
        <div style={{ ...s.bottomPanel, ...(panelOpen ? s.bottomPanelOpen : s.bottomPanelClosed) }}>
          {/* Drag handle */}
          <div style={s.dragBar} onClick={() => setPanelOpen(!panelOpen)}>
            <div style={s.dragHandle} />
            <span style={s.resultCount}>
              {results.length > 0
                ? `${results.length} medicine${results.length !== 1 ? 's' : ''} found`
                : 'No results found'}
            </span>
          </div>

          {/* Results list */}
          {panelOpen && (
            <div ref={listRef} style={s.resultsList}>
              {results.length === 0 ? (
                <div style={s.emptyMsg}>
                  No pharmacy near you has "{query}". Try a different medicine.
                </div>
              ) : (
                results.map((r, i) => (
                  <div
                    key={r.inventoryId}
                    style={{ ...s.card, ...(selectedId === r.inventoryId ? s.cardActive : {}), ...(i === 0 ? s.cardBest : {}) }}
                    onClick={() => handleCardClick(r)}
                  >
                    {i === 0 && <div style={s.bestBadge}>Best Price</div>}
                    <div style={s.cardRow}>
                      <div style={s.cardLeft}>
                        <div style={s.medName}>{r.medicine.name}</div>
                        <div style={s.shopName}>{r.pharmacy.name}</div>
                        {r.pharmacy.address && <div style={s.shopAddr}>{r.pharmacy.address}</div>}
                      </div>
                      <div style={s.cardRight}>
                        <div style={s.price}>₹{r.sellingPrice}</div>
                        {r.distance > 0 && <div style={s.dist}>{r.distance} km</div>}
                        <div style={{
                          ...s.stockTag,
                          background: r.stockQty > 5 ? '#dcfce7' : r.stockQty > 0 ? '#fef9c3' : '#fee2e2',
                          color:      r.stockQty > 5 ? '#15803d' : r.stockQty > 0 ? '#854d0e' : '#b91c1c',
                        }}>
                          {r.stockQty > 0 ? `${r.stockQty} left` : 'Out'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─── */
const s = {
  shell: { width: '100%', height: '100%', position: 'relative', fontFamily: "'Inter', sans-serif" },

  /* Top bar */
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
    height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 1.25rem',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  },
  topLeft: { pointerEvents: 'auto' },
  brand: { fontWeight: 800, fontSize: '1.2rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' },
  brandDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' },
  topRight: { display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' },
  greeting: { fontSize: '0.82rem', color: '#374151', fontWeight: 500 },
  logoutBtn: {
    padding: '0.3rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e5e7eb',
    background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },

  /* Search card */
  searchCard: {
    position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, width: '92%', maxWidth: '440px',
    background: '#fff', borderRadius: '16px', padding: '1rem 1.1rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
  },
  searchLabel: { fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: '0.7rem', letterSpacing: '-0.3px' },
  searchForm: { display: 'flex', alignItems: 'center', gap: '8px' },
  searchDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#1D9E75', flexShrink: 0, boxShadow: '0 0 0 3px rgba(29,158,117,0.15)' },
  searchInput: {
    flex: 1, border: 'none', background: '#f3f4f6', borderRadius: '10px',
    padding: '0.7rem 0.85rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', color: '#111827',
  },
  searchBtn: {
    padding: '0.7rem 1.1rem', background: '#111827', color: '#fff', border: 'none',
    borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0,
  },
  locInfo: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.6rem', fontSize: '0.75rem', color: '#6b7280' },
  locDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' },

  /* Bottom panel */
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
    background: '#fff', borderRadius: '20px 20px 0 0',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
    transition: 'max-height 0.35s ease, padding 0.35s ease',
    overflow: 'hidden',
  },
  bottomPanelOpen: { maxHeight: '55vh', padding: '0' },
  bottomPanelClosed: { maxHeight: '70px', padding: '0' },

  dragBar: {
    padding: '0.7rem 1.25rem', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
  },
  dragHandle: { width: '36px', height: '4px', borderRadius: '2px', background: '#d1d5db' },
  resultCount: { fontSize: '0.85rem', fontWeight: 700, color: '#111827' },

  resultsList: {
    padding: '0 1rem 1rem', overflowY: 'auto', maxHeight: 'calc(55vh - 70px)',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },

  emptyMsg: { textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.88rem' },

  /* Result cards */
  card: {
    padding: '0.85rem 1rem', borderRadius: '14px', border: '1.5px solid #f3f4f6',
    cursor: 'pointer', transition: 'all 0.15s ease', position: 'relative', overflow: 'hidden',
  },
  cardActive: { border: '1.5px solid #1D9E75', background: '#f0fdf7' },
  cardBest: { border: '2px solid #1D9E75' },
  bestBadge: {
    position: 'absolute', top: 0, right: 0,
    background: '#1D9E75', color: '#fff',
    fontSize: '0.65rem', fontWeight: 700,
    padding: '0.15rem 0.5rem', borderRadius: '0 14px 0 8px',
    letterSpacing: '0.3px',
  },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  cardLeft: { flex: 1, minWidth: 0 },
  medName: { fontWeight: 700, fontSize: '0.92rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  shopName: { fontSize: '0.8rem', color: '#1D9E75', fontWeight: 600, marginTop: '2px' },
  shopAddr: { fontSize: '0.73rem', color: '#9ca3af', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardRight: { textAlign: 'right', flexShrink: 0 },
  price: { fontWeight: 800, fontSize: '1.15rem', color: '#111827' },
  dist: { fontSize: '0.72rem', color: '#6b7280', marginTop: '1px' },
  stockTag: { fontSize: '0.65rem', fontWeight: 700, padding: '0.12rem 0.4rem', borderRadius: '6px', marginTop: '3px', display: 'inline-block' },
};
