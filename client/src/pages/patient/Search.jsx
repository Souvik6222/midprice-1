import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Shield, LogOut, Navigation, X, Search, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/* ─── Fix default marker icons ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* Dynamic price-tag marker */
function makePriceIcon(price, isSelected) {
  const bg = isSelected ? '#111827' : '#1D9E75';
  const shadow = isSelected ? '0 3px 12px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.2)';
  return new L.DivIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:${bg};color:#fff;padding:3px 10px;border-radius:20px;
          font-weight:800;font-size:13px;font-family:Inter,sans-serif;
          white-space:nowrap;box-shadow:${shadow};letter-spacing:0.2px;
          border:2px solid #fff;
        ">₹${price}</div>
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;border-right:6px solid transparent;
          border-top:6px solid ${bg};margin-top:-1px;
        "></div>
        <div style="
          width:8px;height:8px;border-radius:50%;background:${bg};
          border:2px solid #fff;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);
        "></div>
      </div>
    `,
    iconSize: [60, 50],
    iconAnchor: [30, 50],
    popupAnchor: [0, -52],
  });
}

const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(59,130,246,0.25);"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, zoom || 14, { duration: 1.2 }); }, [center, zoom, map]);
  return null;
}

/* Routing helper: OSRM (free) */
async function fetchRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      const dist = (data.routes[0].distance / 1000).toFixed(1);
      const dur  = Math.round(data.routes[0].duration / 60);
      return { coords, dist, dur };
    }
  } catch {}
  return null;
}

const SIDEBAR_W = '380px';

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
  const [showAccount, setShowAccount] = useState(false);
  const accountRef = useRef(null);

  const [routeLine, setRouteLine]     = useState(null);
  const [routeInfo, setRouteInfo]     = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccount(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(loc); setFlyTarget(loc);
        },
        () => {
          const fallback = { lat: 22.5726, lng: 88.3639 };
          setUserLoc(fallback); setFlyTarget(fallback);
        }
      );
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(false); setRouteLine(null); setRouteInfo(null);
    try {
      const { data } = await api.get('/api/medicines/search', {
        params: { q: query.trim(), lat: userLoc?.lat || 0, lng: userLoc?.lng || 0 },
      });
      setResults(data.results || []); setSearched(true);
      if (data.results?.length > 0) {
        const first = data.results[0];
        if (first.pharmacy?.lat && first.pharmacy?.lng) setFlyTarget({ lat: first.pharmacy.lat, lng: first.pharmacy.lng });
      }
    } catch { setResults([]); setSearched(true); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/auth/select-role'); };

  const handleCardClick = (r) => {
    setSelectedId(r.inventoryId);
    if (r.pharmacy?.lat && r.pharmacy?.lng) setFlyTarget({ lat: r.pharmacy.lat, lng: r.pharmacy.lng });
  };

  const handleDirections = async (pharmacy) => {
    if (!userLoc || !pharmacy.lat || !pharmacy.lng) return alert('Location not available.');
    setRouteLoading(true);
    const route = await fetchRoute(userLoc, { lat: pharmacy.lat, lng: pharmacy.lng });
    setRouteLoading(false);
    if (route) {
      setRouteLine(route.coords);
      setRouteInfo({ dist: route.dist, dur: route.dur, name: pharmacy.name });
      setFlyTarget({ lat: pharmacy.lat, lng: pharmacy.lng });
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${pharmacy.lat},${pharmacy.lng}&travelmode=driving`, '_blank');
    }
  };

  const clearRoute = () => { setRouteLine(null); setRouteInfo(null); };

  /* Group by pharmacy + lowest price */
  const pharmacyMap = {};
  results.forEach(r => {
    const pid = r.pharmacy?.id;
    if (!pid) return;
    if (!pharmacyMap[pid]) pharmacyMap[pid] = { ...r.pharmacy, medicines: [], lowestPrice: Infinity };
    pharmacyMap[pid].medicines.push(r);
    if (r.sellingPrice < pharmacyMap[pid].lowestPrice) pharmacyMap[pid].lowestPrice = r.sellingPrice;
  });
  const pharmacies = Object.values(pharmacyMap).filter(p => p.lat && p.lng);

  const defaultCenter = userLoc || { lat: 22.5726, lng: 88.3639 };
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={st.shell}>
      {/* ─── NAV BAR ─── */}
      <div style={st.navBar}>
        <div style={st.brand}><span style={st.brandDot} /> MedPrice</div>
        <div style={st.navRight} ref={accountRef}>
          <button style={st.avatarBtn} onClick={() => setShowAccount(!showAccount)}>{initials}</button>
          {showAccount && (
            <div style={st.dropdown}>
              <div style={st.ddHeader}>
                <div style={st.ddAvatar}>{initials}</div>
                <div>
                  <div style={st.ddName}>{user?.name || 'Guest'}</div>
                  <div style={st.ddRole}>Patient Account</div>
                </div>
              </div>
              <div style={st.ddDivider} />
              <div style={st.ddRow}><User size={14} color="#6b7280" /><span style={st.ddLabel}>Name</span><span style={st.ddVal}>{user?.name || 'Guest'}</span></div>
              <div style={st.ddRow}><Phone size={14} color="#6b7280" /><span style={st.ddLabel}>Phone</span><span style={st.ddVal}>{user?.phone || 'N/A'}</span></div>
              <div style={st.ddRow}><Shield size={14} color="#6b7280" /><span style={st.ddLabel}>Role</span><span style={st.ddVal}>{user?.role || 'patient'}</span></div>
              <div style={st.ddDivider} />
              <button style={st.ddLogout} onClick={handleLogout}><LogOut size={14} /> Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── MAIN AREA ─── */}
      <div style={st.main}>
        {/* ─── MAP (left) ─── */}
        <div style={st.mapArea}>
          <MapContainer
            center={[defaultCenter.lat, defaultCenter.lng]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM' />
            {flyTarget && <FlyTo center={[flyTarget.lat, flyTarget.lng]} zoom={14} />}
            {userLoc && <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}><Popup><b>You are here</b></Popup></Marker>}
            {pharmacies.map(p => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={makePriceIcon(p.lowestPrice, selectedId && p.medicines.some(m => m.inventoryId === selectedId))}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '200px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{p.name}</div>
                    {p.address && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px' }}>{p.address}</div>}
                    {p.medicines.map(m => (
                      <div key={m.inventoryId} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderTop: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{m.medicine.name}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1D9E75' }}>₹{m.sellingPrice}</span>
                      </div>
                    ))}
                    <button onClick={() => handleDirections(p)} style={{
                      width: '100%', marginTop: '8px', padding: '0.45rem',
                      background: '#111827', color: '#fff', border: 'none', borderRadius: '8px',
                      fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}><Navigation size={13} /> Get Directions</button>
                  </div>
                </Popup>
              </Marker>
            ))}
            {routeLine && <Polyline positions={routeLine} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85 }} />}
          </MapContainer>

          {/* Route info floating on map */}
          {routeInfo && (
            <div style={st.routeBar}>
              <Navigation size={16} color="#3b82f6" />
              <div style={{ flex: 1 }}>
                <div style={st.routeTitle}>Route to {routeInfo.name}</div>
                <div style={st.routeMeta}>{routeInfo.dist} km · ~{routeInfo.dur} min drive</div>
              </div>
              <button style={st.routeClose} onClick={clearRoute}><X size={14} /></button>
            </div>
          )}
          {routeLoading && (
            <div style={st.routeBar}>
              <Navigation size={16} color="#3b82f6" />
              <span style={st.routeTitle}>Finding shortest route...</span>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div style={st.sidebar}>
          {/* Search */}
          <div style={st.searchSection}>
            <div style={st.searchLabel}><Search size={18} color="#1D9E75" /> Find Medicines Near You</div>
            <form onSubmit={handleSearch} style={st.searchForm}>
              <input
                ref={inputRef} style={st.searchInput}
                placeholder="Search medicine name..."
                value={query} onChange={e => setQuery(e.target.value)} autoFocus
              />
              <button type="submit" style={st.searchBtn} disabled={loading}>
                {loading ? '...' : 'Search'}
              </button>
            </form>
            {userLoc && (
              <div style={st.locInfo}><MapPin size={12} color="#3b82f6" /> Location detected</div>
            )}
          </div>

          {/* Results */}
          <div style={st.resultsList}>
            {!searched && (
              <div style={st.emptyState}>
                <MapPin size={36} color="#d1d5db" />
                <div style={st.emptyTitle}>Search for a medicine</div>
                <div style={st.emptySub}>Results will appear here with prices and directions</div>
              </div>
            )}

            {searched && results.length === 0 && (
              <div style={st.emptyState}>
                <Search size={36} color="#d1d5db" />
                <div style={st.emptyTitle}>No results found</div>
                <div style={st.emptySub}>No pharmacy near you has "{query}"</div>
              </div>
            )}

            {searched && results.length > 0 && (
              <>
                <div style={st.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''}</div>
                {results.map((r, i) => (
                  <div
                    key={r.inventoryId}
                    style={{ ...st.card, ...(selectedId === r.inventoryId ? st.cardActive : {}), ...(i === 0 ? st.cardBest : {}) }}
                    onClick={() => handleCardClick(r)}
                  >
                    {i === 0 && <div style={st.bestBadge}>Best Price</div>}
                    <div style={st.cardRow}>
                      <div style={st.cardLeft}>
                        <div style={st.medName}>{r.medicine.name}</div>
                        <div style={st.shopName}>{r.pharmacy.name}</div>
                        {r.pharmacy.address && <div style={st.shopAddr}>{r.pharmacy.address}</div>}
                      </div>
                      <div style={st.cardRight}>
                        <div style={st.price}>₹{r.sellingPrice}</div>
                        {r.distance > 0 && <div style={st.dist}>{r.distance} km</div>}
                        <div style={{
                          ...st.stockTag,
                          background: r.stockQty > 5 ? '#dcfce7' : r.stockQty > 0 ? '#fef9c3' : '#fee2e2',
                          color:      r.stockQty > 5 ? '#15803d' : r.stockQty > 0 ? '#854d0e' : '#b91c1c',
                        }}>
                          {r.stockQty > 0 ? `${r.stockQty} left` : 'Out'}
                        </div>
                      </div>
                    </div>
                    <button style={st.dirBtn} onClick={(e) => { e.stopPropagation(); handleDirections(r.pharmacy); }}>
                      <Navigation size={12} /> Directions
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const st = {
  shell: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", overflow: 'hidden' },

  /* Nav */
  navBar: {
    height: '52px', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 1.25rem', background: '#fff', borderBottom: '1px solid #eee',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', zIndex: 100,
  },
  brand: { fontWeight: 800, fontSize: '1.15rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' },
  brandDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' },
  navRight: { position: 'relative' },
  avatarBtn: {
    width: '34px', height: '34px', borderRadius: '50%', background: '#1D9E75',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },

  /* Dropdown */
  dropdown: {
    position: 'absolute', top: '42px', right: 0, width: '260px',
    background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '0.65rem 0', zIndex: 200,
  },
  ddHeader: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.4rem 1rem 0.5rem' },
  ddAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #1D9E75, #14b8a6)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
  },
  ddName: { fontWeight: 700, fontSize: '0.88rem', color: '#111827' },
  ddRole: { fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 },
  ddDivider: { height: '1px', background: '#f3f4f6', margin: '0.2rem 0' },
  ddRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', fontSize: '0.8rem' },
  ddLabel: { fontWeight: 500, color: '#9ca3af', width: '48px' },
  ddVal: { fontWeight: 600, color: '#374151', flex: 1, textAlign: 'right' },
  ddLogout: {
    width: 'calc(100% - 1.6rem)', margin: '0.3rem 0.8rem 0.2rem',
    padding: '0.5rem', borderRadius: '10px', border: 'none',
    background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
    fontWeight: 700, fontSize: '0.8rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
  },

  /* Main layout */
  main: { flex: 1, display: 'flex', overflow: 'hidden' },

  /* Map area */
  mapArea: { flex: 1, position: 'relative' },

  /* Route bar (floats on map) */
  routeBar: {
    position: 'absolute', bottom: '16px', left: '16px', right: '16px',
    zIndex: 500, background: '#fff', borderRadius: '12px', padding: '0.6rem 0.85rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '10px',
  },
  routeTitle: { fontWeight: 700, fontSize: '0.82rem', color: '#111827' },
  routeMeta: { fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600 },
  routeClose: {
    width: '26px', height: '26px', borderRadius: '50%', border: 'none',
    background: '#f3f4f6', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#6b7280',
  },

  /* Right sidebar */
  sidebar: {
    width: SIDEBAR_W, minWidth: SIDEBAR_W, height: '100%',
    background: '#fff', borderLeft: '1px solid #eee',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },

  /* Search section */
  searchSection: { padding: '1rem 1rem 0.75rem', borderBottom: '1px solid #f3f4f6' },
  searchLabel: {
    fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.6rem',
    display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px',
  },
  searchForm: { display: 'flex', gap: '6px' },
  searchInput: {
    flex: 1, border: '1.5px solid #e5e7eb', background: '#f9fafb', borderRadius: '10px',
    padding: '0.6rem 0.75rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', color: '#111827',
  },
  searchBtn: {
    padding: '0.6rem 1rem', background: '#1D9E75', color: '#fff', border: 'none',
    borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', flexShrink: 0,
  },
  locInfo: { display: 'flex', alignItems: 'center', gap: '5px', marginTop: '0.5rem', fontSize: '0.72rem', color: '#6b7280' },

  /* Results list */
  resultsList: { flex: 1, overflowY: 'auto', padding: '0.75rem' },

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '3rem 1rem', textAlign: 'center',
  },
  emptyTitle: { fontWeight: 700, fontSize: '0.95rem', color: '#374151', marginTop: '0.75rem' },
  emptySub: { fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem' },

  resultCount: { fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' },

  /* Cards */
  card: {
    padding: '0.7rem 0.85rem', borderRadius: '12px', border: '1.5px solid #f3f4f6',
    cursor: 'pointer', transition: 'all 0.15s ease', position: 'relative',
    overflow: 'hidden', marginBottom: '6px',
  },
  cardActive: { border: '1.5px solid #1D9E75', background: '#f0fdf7' },
  cardBest: { border: '2px solid #1D9E75' },
  bestBadge: {
    position: 'absolute', top: 0, right: 0,
    background: '#1D9E75', color: '#fff',
    fontSize: '0.6rem', fontWeight: 700,
    padding: '0.12rem 0.45rem', borderRadius: '0 12px 0 8px',
  },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  cardLeft: { flex: 1, minWidth: 0 },
  medName: { fontWeight: 700, fontSize: '0.85rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  shopName: { fontSize: '0.75rem', color: '#1D9E75', fontWeight: 600, marginTop: '1px' },
  shopAddr: { fontSize: '0.68rem', color: '#9ca3af', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardRight: { textAlign: 'right', flexShrink: 0 },
  price: { fontWeight: 800, fontSize: '1.1rem', color: '#111827' },
  dist: { fontSize: '0.7rem', color: '#6b7280' },
  stockTag: { fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '5px', marginTop: '2px', display: 'inline-block' },

  dirBtn: {
    marginTop: '0.4rem', padding: '0.3rem 0.65rem',
    background: '#111827', color: '#fff', border: 'none', borderRadius: '6px',
    fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
  },
};
