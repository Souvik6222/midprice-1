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
    <div className="ps-shell">
      <style>{responsiveCSS}</style>
      
      {/* ─── NAV BAR ─── */}
      <div className="ps-nav-bar">
        <div className="ps-brand"><span className="ps-brand-dot" /> MedPrice</div>
        <div className="ps-nav-right" ref={accountRef}>
          <button className="ps-avatar-btn" onClick={() => setShowAccount(!showAccount)}>{initials}</button>
          {showAccount && (
            <div className="ps-dropdown">
              <div className="ps-dd-header">
                <div className="ps-dd-avatar">{initials}</div>
                <div>
                  <div className="ps-dd-name">{user?.name || 'Guest'}</div>
                  <div className="ps-dd-role">Patient Account</div>
                </div>
              </div>
              <div className="ps-dd-divider" />
              <div className="ps-dd-row"><User size={14} color="#6b7280" /><span className="ps-dd-label">Name</span><span className="ps-dd-val">{user?.name || 'Guest'}</span></div>
              <div className="ps-dd-row"><Phone size={14} color="#6b7280" /><span className="ps-dd-label">Phone</span><span className="ps-dd-val">{user?.phone || 'N/A'}</span></div>
              <div className="ps-dd-row"><Shield size={14} color="#6b7280" /><span className="ps-dd-label">Role</span><span className="ps-dd-val">{user?.role || 'patient'}</span></div>
              <div className="ps-dd-divider" />
              <button className="ps-dd-logout" onClick={handleLogout}><LogOut size={14} /> Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── MAIN AREA ─── */}
      <div className="ps-main">
        {/* ─── MAP (left) ─── */}
        <div className="ps-map-area">
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
            <div className="ps-route-bar">
              <Navigation size={16} color="#3b82f6" />
              <div style={{ flex: 1 }}>
                <div className="ps-route-title">Route to {routeInfo.name}</div>
                <div className="ps-route-meta">{routeInfo.dist} km · ~{routeInfo.dur} min drive</div>
              </div>
              <button className="ps-route-close" onClick={clearRoute}><X size={14} /></button>
            </div>
          )}
          {routeLoading && (
            <div className="ps-route-bar">
              <Navigation size={16} color="#3b82f6" />
              <span className="ps-route-title">Finding shortest route...</span>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="ps-sidebar">
          {/* Search */}
          <div className="ps-search-section">
            <div className="ps-search-label"><Search size={18} color="#1D9E75" /> Find Medicines Near You</div>
            <form onSubmit={handleSearch} className="ps-search-form">
              <input
                ref={inputRef} className="ps-search-input"
                placeholder="Search medicine name..."
                value={query} onChange={e => setQuery(e.target.value)} autoFocus
              />
              <button type="submit" className="ps-search-btn" disabled={loading}>
                {loading ? '...' : 'Search'}
              </button>
            </form>
            {userLoc && (
              <div className="ps-loc-info"><MapPin size={12} color="#3b82f6" /> Location detected</div>
            )}
          </div>

          {/* Results */}
          <div className="ps-results-list">
            {!searched && (
              <div className="ps-empty-state">
                <MapPin size={36} color="#d1d5db" />
                <div className="ps-empty-title">Search for a medicine</div>
                <div className="ps-empty-sub">Results will appear here with prices and directions</div>
              </div>
            )}

            {searched && results.length === 0 && (
              <div className="ps-empty-state">
                <Search size={36} color="#d1d5db" />
                <div className="ps-empty-title">No results found</div>
                <div className="ps-empty-sub">No pharmacy near you has "{query}"</div>
              </div>
            )}

            {searched && results.length > 0 && (
              <>
                <div className="ps-result-count">{results.length} result{results.length !== 1 ? 's' : ''}</div>
                {results.map((r, i) => (
                  <div
                    key={r.inventoryId}
                    className={`ps-card ${selectedId === r.inventoryId ? 'ps-card-active' : ''} ${i === 0 ? 'ps-card-best' : ''}`}
                    onClick={() => handleCardClick(r)}
                  >
                    {i === 0 && <div className="ps-best-badge">Best Price</div>}
                    <div className="ps-card-row">
                      <div className="ps-card-left">
                        <div className="ps-med-name">{r.medicine.name}</div>
                        <div className="ps-shop-name">{r.pharmacy.name}</div>
                        {r.pharmacy.address && <div className="ps-shop-addr">{r.pharmacy.address}</div>}
                      </div>
                      <div className="ps-card-right">
                        <div className="ps-price">₹{r.sellingPrice}</div>
                        {r.distance > 0 && <div className="ps-dist">{r.distance} km</div>}
                        <div className="ps-stock-tag" style={{
                          background: r.stockQty > 5 ? '#dcfce7' : r.stockQty > 0 ? '#fef9c3' : '#fee2e2',
                          color:      r.stockQty > 5 ? '#15803d' : r.stockQty > 0 ? '#854d0e' : '#b91c1c',
                        }}>
                          {r.stockQty > 0 ? `${r.stockQty} left` : 'Out'}
                        </div>
                      </div>
                    </div>
                    <button className="ps-dir-btn" onClick={(e) => { e.stopPropagation(); handleDirections(r.pharmacy); }}>
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

const responsiveCSS = `
  .ps-shell { width: 100%; height: 100vh; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; overflow: hidden; }

  /* Nav */
  .ps-nav-bar { height: 52px; min-height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; background: #fff; border-bottom: 1px solid #eee; box-shadow: 0 1px 3px rgba(0,0,0,0.04); z-index: 100; }
  .ps-brand { font-weight: 800; font-size: 1.15rem; color: #111827; display: flex; align-items: center; gap: 6px; }
  .ps-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #1D9E75; }
  .ps-nav-right { position: relative; }
  .ps-avatar-btn { width: 34px; height: 34px; border-radius: 50%; background: #1D9E75; color: #fff; border: none; cursor: pointer; font-weight: 800; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

  /* Dropdown */
  .ps-dropdown { position: absolute; top: 42px; right: 0; width: 260px; background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; box-shadow: 0 8px 32px rgba(0,0,0,0.12); padding: 0.65rem 0; z-index: 200; }
  .ps-dd-header { display: flex; align-items: center; gap: 10px; padding: 0.4rem 1rem 0.5rem; }
  .ps-dd-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #1D9E75, #14b8a6); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0; }
  .ps-dd-name { font-weight: 700; font-size: 0.88rem; color: #111827; }
  .ps-dd-role { font-size: 0.7rem; color: #9ca3af; font-weight: 500; }
  .ps-dd-divider { height: 1px; background: #f3f4f6; margin: 0.2rem 0; }
  .ps-dd-row { display: flex; align-items: center; gap: 8px; padding: 0.4rem 1rem; font-size: 0.8rem; }
  .ps-dd-label { font-weight: 500; color: #9ca3af; width: 48px; }
  .ps-dd-val { font-weight: 600; color: #374151; flex: 1; text-align: right; }
  .ps-dd-logout { width: calc(100% - 1.6rem); margin: 0.3rem 0.8rem 0.2rem; padding: 0.5rem; border-radius: 10px; border: none; background: #fef2f2; color: #ef4444; cursor: pointer; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 5px; }

  /* Main layout */
  .ps-main { flex: 1; display: flex; overflow: hidden; }

  /* Map area */
  .ps-map-area { flex: 1; position: relative; }

  /* Route bar */
  .ps-route-bar { position: absolute; bottom: 16px; left: 16px; right: 16px; z-index: 500; background: #fff; border-radius: 12px; padding: 0.6rem 0.85rem; box-shadow: 0 2px 12px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 10px; }
  .ps-route-title { font-weight: 700; font-size: 0.82rem; color: #111827; }
  .ps-route-meta { font-size: 0.72rem; color: #3b82f6; font-weight: 600; }
  .ps-route-close { width: 26px; height: 26px; border-radius: 50%; border: none; background: #f3f4f6; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; }

  /* Sidebar */
  .ps-sidebar { width: 380px; min-width: 380px; height: 100%; background: #fff; border-left: 1px solid #eee; display: flex; flex-direction: column; overflow: hidden; }

  /* Search section */
  .ps-search-section { padding: 1rem 1rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
  .ps-search-label { font-size: 1rem; font-weight: 800; color: #111827; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px; letter-spacing: -0.3px; }
  .ps-search-form { display: flex; gap: 6px; }
  .ps-search-input { flex: 1; border: 1.5px solid #e5e7eb; background: #f9fafb; border-radius: 10px; padding: 0.6rem 0.75rem; font-size: 0.85rem; outline: none; font-family: inherit; color: #111827; }
  .ps-search-btn { padding: 0.6rem 1rem; background: #1D9E75; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.82rem; flex-shrink: 0; }
  .ps-loc-info { display: flex; align-items: center; gap: 5px; margin-top: 0.5rem; font-size: 0.72rem; color: #6b7280; }

  /* Results list */
  .ps-results-list { flex: 1; overflow-y: auto; padding: 0.75rem; }
  .ps-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; }
  .ps-empty-title { font-weight: 700; font-size: 0.95rem; color: #374151; margin-top: 0.75rem; }
  .ps-empty-sub { font-size: 0.78rem; color: #9ca3af; margin-top: 0.25rem; }
  .ps-result-count { font-size: 0.75rem; font-weight: 700; color: #6b7280; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Cards */
  .ps-card { padding: 0.7rem 0.85rem; border-radius: 12px; border: 1.5px solid #f3f4f6; cursor: pointer; transition: all 0.15s ease; position: relative; overflow: hidden; margin-bottom: 6px; }
  .ps-card-active { border: 1.5px solid #1D9E75; background: #f0fdf7; }
  .ps-card-best { border: 2px solid #1D9E75; }
  .ps-best-badge { position: absolute; top: 0; left: 50%; transform: translateX(-50%); background: #1D9E75; color: #fff; font-size: 0.62rem; font-weight: 800; padding: 0.15rem 0.6rem; border-radius: 0 0 8px 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ps-card-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .ps-card-left { flex: 1; min-width: 0; }
  .ps-med-name { font-weight: 700; font-size: 0.85rem; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ps-shop-name { font-size: 0.75rem; color: #1D9E75; font-weight: 600; margin-top: 1px; }
  .ps-shop-addr { font-size: 0.68rem; color: #9ca3af; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ps-card-right { text-align: right; flex-shrink: 0; }
  .ps-price { font-weight: 800; font-size: 1.1rem; color: #111827; }
  .ps-dist { font-size: 0.7rem; color: #6b7280; }
  .ps-stock-tag { font-size: 0.62rem; font-weight: 700; padding: 0.1rem 0.35rem; border-radius: 5px; margin-top: 2px; display: inline-block; }
  .ps-dir-btn { margin-top: 0.4rem; padding: 0.3rem 0.65rem; background: #111827; color: #fff; border: none; border-radius: 6px; font-weight: 600; font-size: 0.7rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }

  /* ═══ RESPONSIVE: Mobile (<768px) ═══ */
  @media (max-width: 768px) {
    .ps-main { flex-direction: column; }
    .ps-map-area { flex: 1; min-height: 40vh; max-height: 50vh; }
    .ps-sidebar { width: 100%; min-width: 100%; flex: 1; border-left: none; border-top: 1px solid #eee; }
  }
`;
