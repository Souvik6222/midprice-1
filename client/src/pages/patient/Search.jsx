import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Shield, LogOut, Navigation, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/* ─── Fix default marker icons ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* Dynamic price-tag marker (shows price above the pin) */
function makePriceIcon(price, isSelected) {
  const bg  = isSelected ? '#111827' : '#1D9E75';
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

/* ─── Routing helper: fetch route from OSRM (free) ─── */
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

  // Account dropdown
  const [showAccount, setShowAccount] = useState(false);
  const accountRef = useRef(null);

  // Route
  const [routeLine, setRouteLine]   = useState(null);
  const [routeInfo, setRouteInfo]   = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const inputRef = useRef(null);

  /* Close account dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccount(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    setLoading(true); setSearched(false); setRouteLine(null); setRouteInfo(null);
    try {
      const { data } = await api.get('/api/medicines/search', {
        params: { q: query.trim(), lat: userLoc?.lat || 0, lng: userLoc?.lng || 0 },
      });
      setResults(data.results || []);
      setSearched(true);
      setPanelOpen(true);
      if (data.results?.length > 0) {
        const first = data.results[0];
        if (first.pharmacy?.lat && first.pharmacy?.lng) {
          setFlyTarget({ lat: first.pharmacy.lat, lng: first.pharmacy.lng });
        }
      }
    } catch {
      setResults([]); setSearched(true);
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

  /* Directions */
  const handleDirections = async (pharmacy) => {
    if (!userLoc || !pharmacy.lat || !pharmacy.lng) return alert('Location not available.');
    setRouteLoading(true);
    const route = await fetchRoute(userLoc, { lat: pharmacy.lat, lng: pharmacy.lng });
    setRouteLoading(false);
    if (route) {
      setRouteLine(route.coords);
      setRouteInfo({ dist: route.dist, dur: route.dur, name: pharmacy.name });
      // Fit bounds
      setFlyTarget({ lat: pharmacy.lat, lng: pharmacy.lng });
    } else {
      // Fallback: open Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${pharmacy.lat},${pharmacy.lng}&travelmode=driving`, '_blank');
    }
  };

  const clearRoute = () => { setRouteLine(null); setRouteInfo(null); };

  /* Group results by pharmacy + compute lowest price */
  const pharmacyMap = {};
  results.forEach(r => {
    const pid = r.pharmacy?.id;
    if (!pid) return;
    if (!pharmacyMap[pid]) {
      pharmacyMap[pid] = { ...r.pharmacy, medicines: [], lowestPrice: Infinity };
    }
    pharmacyMap[pid].medicines.push(r);
    if (r.sellingPrice < pharmacyMap[pid].lowestPrice) {
      pharmacyMap[pid].lowestPrice = r.sellingPrice;
    }
  });
  const pharmacies = Object.values(pharmacyMap).filter(p => p.lat && p.lng);

  const defaultCenter = userLoc || { lat: 22.5726, lng: 88.3639 };
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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

        {userLoc && (
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup><b>You are here</b></Popup>
          </Marker>
        )}

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
                <button
                  onClick={() => handleDirections(p)}
                  style={{
                    width: '100%', marginTop: '8px', padding: '0.5rem',
                    background: '#111827', color: '#fff', border: 'none', borderRadius: '8px',
                    fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  }}
                >
                  <span>🧭</span> Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polyline */}
        {routeLine && (
          <Polyline positions={routeLine} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85 }} />
        )}
      </MapContainer>

      {/* ─── TOP NAV BAR ─── */}
      <div style={s.navBar}>
        <div style={s.brand}>
          <span style={s.brandDot} />
          MedPrice
        </div>
        <div style={s.navRight} ref={accountRef}>
          <button style={s.avatarBtn} onClick={() => setShowAccount(!showAccount)}>
            {initials}
          </button>

          {/* Account dropdown */}
          {showAccount && (
            <div style={s.dropdown}>
              <div style={s.dropdownHeader}>
                <div style={s.dropdownAvatar}>{initials}</div>
                <div>
                  <div style={s.dropdownName}>{user?.name || 'Guest'}</div>
                  <div style={s.dropdownRole}>Patient Account</div>
                </div>
              </div>
              <div style={s.dropdownDivider} />
              <div style={s.dropdownRow}>
                <User size={15} color="#6b7280" />
                <span style={s.dropdownLabel}>Name</span>
                <span style={s.dropdownValue}>{user?.name || 'Guest'}</span>
              </div>
              <div style={s.dropdownRow}>
                <Phone size={15} color="#6b7280" />
                <span style={s.dropdownLabel}>Phone</span>
                <span style={s.dropdownValue}>{user?.phone || 'N/A'}</span>
              </div>
              <div style={s.dropdownRow}>
                <Shield size={15} color="#6b7280" />
                <span style={s.dropdownLabel}>Role</span>
                <span style={s.dropdownValue}>{user?.role || 'patient'}</span>
              </div>
              <div style={s.dropdownDivider} />
              <button style={s.dropdownLogout} onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── SEARCH CARD ─── */}
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

      {/* ─── ROUTE INFO BAR ─── */}
      {routeInfo && (
        <div style={s.routeBar}>
          <div style={s.routeBarLeft}>
            <Navigation size={16} color="#3b82f6" />
            <div>
              <div style={s.routeBarTitle}>Route to {routeInfo.name}</div>
              <div style={s.routeBarMeta}>{routeInfo.dist} km · ~{routeInfo.dur} min drive</div>
            </div>
          </div>
          <button style={s.routeBarClose} onClick={clearRoute}><X size={16} /></button>
        </div>
      )}

      {routeLoading && (
        <div style={s.routeBar}>
          <Navigation size={16} color="#3b82f6" />
          <span style={s.routeBarTitle}>Finding shortest route...</span>
        </div>
      )}

      {/* ─── BOTTOM RESULTS PANEL ─── */}
      {searched && (
        <div style={{ ...s.bottomPanel, ...(panelOpen ? s.bottomPanelOpen : s.bottomPanelClosed) }}>
          <div style={s.dragBar} onClick={() => setPanelOpen(!panelOpen)}>
            <div style={s.dragHandle} />
            <span style={s.resultCount}>
              {results.length > 0
                ? `${results.length} medicine${results.length !== 1 ? 's' : ''} found`
                : 'No results found'}
            </span>
          </div>

          {panelOpen && (
            <div style={s.resultsList}>
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
                    {/* Directions button on card */}
                    <button
                      style={s.dirBtn}
                      onClick={(e) => { e.stopPropagation(); handleDirections(r.pharmacy); }}
                    >
                      <Navigation size={13} /> Directions
                    </button>
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

  /* Nav bar */
  navBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
    height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 1.25rem',
    background: '#fff', borderBottom: '1px solid #f3f4f6',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  brand: { fontWeight: 800, fontSize: '1.2rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' },
  brandDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' },
  navRight: { position: 'relative' },
  avatarBtn: {
    width: '36px', height: '36px', borderRadius: '50%', background: '#1D9E75',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.3px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },

  /* Account dropdown */
  dropdown: {
    position: 'absolute', top: '44px', right: 0, width: '280px',
    background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '0.75rem 0',
    zIndex: 1001,
  },
  dropdownHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0.5rem 1rem 0.65rem',
  },
  dropdownAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #1D9E75, #14b8a6)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
  },
  dropdownName: { fontWeight: 700, fontSize: '0.92rem', color: '#111827' },
  dropdownRole: { fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500, marginTop: '1px' },
  dropdownDivider: { height: '1px', background: '#f3f4f6', margin: '0.25rem 0' },
  dropdownRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '0.5rem 1rem', fontSize: '0.82rem',
  },
  dropdownLabel: { fontWeight: 500, color: '#9ca3af', width: '50px' },
  dropdownValue: { fontWeight: 600, color: '#374151', flex: 1, textAlign: 'right' },
  dropdownLogout: {
    width: 'calc(100% - 2rem)', margin: '0.4rem 1rem 0.25rem',
    padding: '0.55rem', borderRadius: '10px', border: 'none',
    background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
    fontWeight: 700, fontSize: '0.82rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  },

  /* Search card */
  searchCard: {
    position: 'absolute', top: '64px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 999, width: '92%', maxWidth: '440px',
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

  /* Route info bar */
  routeBar: {
    position: 'absolute', top: '180px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 999, width: '92%', maxWidth: '440px',
    background: '#fff', borderRadius: '12px', padding: '0.7rem 1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  routeBarLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  routeBarTitle: { fontWeight: 700, fontSize: '0.85rem', color: '#111827' },
  routeBarMeta: { fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, marginTop: '1px' },
  routeBarClose: {
    width: '28px', height: '28px', borderRadius: '50%', border: 'none',
    background: '#f3f4f6', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#6b7280',
  },

  /* Bottom panel */
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
    background: '#fff', borderRadius: '20px 20px 0 0',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
    transition: 'max-height 0.35s ease',
    overflow: 'hidden',
  },
  bottomPanelOpen: { maxHeight: '35vh' },
  bottomPanelClosed: { maxHeight: '56px' },

  dragBar: {
    padding: '0.5rem 1.25rem', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
  },
  dragHandle: { width: '36px', height: '4px', borderRadius: '2px', background: '#d1d5db' },
  resultCount: { fontSize: '0.85rem', fontWeight: 700, color: '#111827' },

  resultsList: {
    padding: '0 0.75rem 0.75rem', overflowY: 'auto', maxHeight: 'calc(35vh - 56px)',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },

  emptyMsg: { textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.88rem' },

  card: {
    padding: '0.6rem 0.85rem', borderRadius: '12px', border: '1.5px solid #f3f4f6',
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
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  cardLeft: { flex: 1, minWidth: 0 },
  medName: { fontWeight: 700, fontSize: '0.85rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  shopName: { fontSize: '0.75rem', color: '#1D9E75', fontWeight: 600, marginTop: '1px' },
  shopAddr: { fontSize: '0.68rem', color: '#9ca3af', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardRight: { textAlign: 'right', flexShrink: 0 },
  price: { fontWeight: 800, fontSize: '1.15rem', color: '#111827' },
  dist: { fontSize: '0.72rem', color: '#6b7280', marginTop: '1px' },
  stockTag: { fontSize: '0.65rem', fontWeight: 700, padding: '0.12rem 0.4rem', borderRadius: '6px', marginTop: '3px', display: 'inline-block' },

  dirBtn: {
    marginTop: '0.35rem', padding: '0.3rem 0.7rem',
    background: '#111827', color: '#fff', border: 'none', borderRadius: '6px',
    fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
  },
};
