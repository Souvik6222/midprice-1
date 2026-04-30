import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, Package, Settings, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import VendorVerification from '../pages/vendor/Verification';

const links = [
  { to: '/vendor/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { to: '/vendor/inventory', icon: <Package size={17} />, label: 'Medicines' },
  { to: '/vendor/settings',  icon: <Settings size={17} />,  label: 'Shop Setup' },
];

function VendorLayout() {
  const logout   = useAuthStore(s => s.logout);
  const user     = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth/select-role'); };
  const isVerified = user?.isVerified === true;

  return (
    <>
      <style>{responsiveCSS}</style>
      <div className="vl-shell">
        {/* ─── MOBILE TOP BAR ─── */}
        <header className="vl-mobile-header">
          <div className="vl-mobile-brand">
            <span className="vl-brand-dot" />
            MedPrice
          </div>
          <button className="vl-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* ─── SIDEBAR (Desktop) / Drawer (Mobile) ─── */}
        {mobileOpen && <div className="vl-overlay" onClick={() => setMobileOpen(false)} />}
        <aside className={`vl-sidebar ${mobileOpen ? 'vl-sidebar-open' : ''}`}>
          <div className="vl-brand-section">
            <span className="vl-brand-dot" />
            <span className="vl-brand-text">MedPrice</span>
            <div className="vl-brand-sub">Pharmacy Portal</div>
          </div>

          <nav className="vl-nav">
            {isVerified ? (
              links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) => `vl-link ${isActive ? 'vl-link-active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="vl-link-icon">{l.icon}</span>
                  {l.label}
                </NavLink>
              ))
            ) : (
              <div className="vl-link">
                <span className="vl-link-icon"><ShieldCheck size={17} /></span>
                Verification
              </div>
            )}
          </nav>

          {/* Verification badge */}
          {!isVerified && (
            <div className="vl-verify-badge vl-unverified">
              <ShieldCheck size={14} color="#f59e0b" />
              <span>Not Verified</span>
            </div>
          )}
          {isVerified && (
            <div className="vl-verify-badge vl-verified">
              <ShieldCheck size={14} color="#1D9E75" />
              <span>Verified</span>
            </div>
          )}

          <div className="vl-side-footer">
            <div className="vl-user-info">
              <div className="vl-user-avatar">{(user?.name || 'P').charAt(0).toUpperCase()}</div>
              <div className="vl-user-name">{user?.name || 'Pharmacy'}</div>
            </div>
            <button className="vl-logout-btn" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </aside>

        {/* ─── BOTTOM NAV (Mobile only) ─── */}
        {isVerified && (
          <nav className="vl-bottom-nav">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `vl-bottom-link ${isActive ? 'vl-bottom-active' : ''}`}
              >
                {l.icon}
                <span>{l.label}</span>
              </NavLink>
            ))}
            <button className="vl-bottom-link" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </nav>
        )}

        {/* ─── CONTENT ─── */}
        <main className="vl-content">
          {isVerified ? <Outlet /> : <VendorVerification />}
        </main>
      </div>
    </>
  );
}

const responsiveCSS = `
  /* ═══ VENDOR LAYOUT — RESPONSIVE ═══ */
  .vl-shell {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', sans-serif;
  }

  /* ─── Sidebar (Desktop) ─── */
  .vl-sidebar {
    width: 220px;
    min-height: 100vh;
    background: #fff;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0;
    z-index: 50;
    transition: transform 0.3s ease;
  }

  .vl-brand-section {
    padding: 1.25rem 1.25rem 1rem;
    font-weight: 800; font-size: 1.15rem;
    color: #1D9E75; letter-spacing: -0.3px;
    display: flex; align-items: center;
    gap: 6px; flex-wrap: wrap;
    border-bottom: 1px solid #f3f4f6;
  }
  .vl-brand-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #1D9E75;
  }
  .vl-brand-sub {
    width: 100%; font-size: 0.62rem; color: #9ca3af;
    font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; margin-top: -2px;
  }

  .vl-nav {
    flex: 1; padding: 0.75rem 0.6rem;
    display: flex; flex-direction: column; gap: 2px;
  }
  .vl-link {
    display: flex; align-items: center; gap: 8px;
    padding: 0.6rem 0.8rem; border-radius: 10px;
    text-decoration: none; color: #6b7280;
    font-size: 0.875rem; font-weight: 500;
    transition: all 0.15s;
  }
  .vl-link:hover { background: #f9fafb; }
  .vl-link-active { background: #f0fdf7 !important; color: #1D9E75; font-weight: 600; }
  .vl-link-icon { flex-shrink: 0; display: flex; }

  .vl-verify-badge {
    display: flex; align-items: center; gap: 6px;
    margin: 0 0.6rem 0.5rem; padding: 0.5rem 0.8rem;
    border-radius: 8px; font-size: 0.72rem; font-weight: 700;
  }
  .vl-unverified { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
  .vl-verified { background: #f0fdf7; border: 1px solid #bbf7d0; color: #166534; }

  .vl-side-footer { padding: 1rem; border-top: 1px solid #f3f4f6; }
  .vl-user-info { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
  .vl-user-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    background: #1D9E75; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 700;
  }
  .vl-user-name {
    font-size: 0.8rem; font-weight: 600; color: #374151;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;
  }
  .vl-logout-btn {
    width: 100%; padding: 0.5rem; border-radius: 8px;
    border: 1.5px solid #f3f4f6; background: #fff; color: #6b7280;
    cursor: pointer; font-size: 0.8rem; font-weight: 600;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }

  /* ─── Content ─── */
  .vl-content {
    margin-left: 220px; flex: 1;
    padding: 2rem; max-width: 900px;
  }

  /* ─── Mobile header & bottom nav (hidden on desktop) ─── */
  .vl-mobile-header { display: none; }
  .vl-overlay { display: none; }
  .vl-bottom-nav { display: none; }

  /* ═══ RESPONSIVE: Tablet (<900px) ═══ */
  @media (max-width: 900px) {
    .vl-content {
      padding: 1.5rem 1rem;
    }
  }

  /* ═══ RESPONSIVE: Mobile (<768px) ═══ */
  @media (max-width: 768px) {
    /* Show mobile header */
    .vl-mobile-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1rem; height: 54px; background: #fff;
      border-bottom: 1px solid #e5e7eb;
      position: sticky; top: 0; z-index: 40;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .vl-mobile-brand {
      font-weight: 800; font-size: 1.1rem; color: #1D9E75;
      display: flex; align-items: center; gap: 6px;
    }
    .vl-hamburger {
      background: none; border: none; cursor: pointer;
      color: #374151; padding: 4px;
    }

    /* Sidebar becomes drawer */
    .vl-sidebar {
      transform: translateX(-100%);
      box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    }
    .vl-sidebar-open {
      transform: translateX(0);
    }

    /* Overlay */
    .vl-overlay {
      display: block; position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4); z-index: 45;
    }

    /* Content: no margin, full width */
    .vl-content {
      margin-left: 0; padding: 1rem;
      padding-bottom: 80px; /* space for bottom nav */
      max-width: 100%;
    }

    /* Bottom navigation */
    .vl-bottom-nav {
      display: flex; position: fixed; bottom: 0; left: 0; right: 0;
      background: #fff; border-top: 1px solid #e5e7eb;
      z-index: 30; padding: 0.3rem 0;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
    }
    .vl-bottom-link {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 2px; padding: 0.5rem 0; text-decoration: none;
      color: #9ca3af; font-size: 0.62rem; font-weight: 600;
      background: none; border: none; cursor: pointer;
    }
    .vl-bottom-active { color: #1D9E75; }
  }
`;

export default VendorLayout;
