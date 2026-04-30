import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, Package, Settings, LogOut, ShieldCheck } from 'lucide-react';
import VendorVerification from '../pages/vendor/Verification';

const links = [
  { to: '/vendor/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { to: '/vendor/inventory', icon: <Package size={17} />, label: 'My Medicines' },
  { to: '/vendor/settings',  icon: <Settings size={17} />,        label: 'Shop Setup' },
];

function VendorLayout() {
  const logout   = useAuthStore(s => s.logout);
  const user     = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth/select-role'); };

  const isVerified = user?.isVerified === true;

  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <span style={s.brandDot} />
          MedPrice
          <div style={s.brandSub}>Pharmacy Portal</div>
        </div>

        <nav style={s.nav}>
          {isVerified ? (
            links.map(l => (
              <NavLink key={l.to} to={l.to} style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}>
                <span style={s.linkIcon}>{l.icon}</span>
                {l.label}
              </NavLink>
            ))
          ) : (
            <div style={s.link}>
              <span style={s.linkIcon}><ShieldCheck size={17} /></span>
              Verification
            </div>
          )}
        </nav>

        {/* Verification badge */}
        {!isVerified && (
          <div style={s.verifyBadge}>
            <ShieldCheck size={14} color="#f59e0b" />
            <span>Not Verified</span>
          </div>
        )}
        {isVerified && (
          <div style={s.verifiedBadge}>
            <ShieldCheck size={14} color="#1D9E75" />
            <span>Verified</span>
          </div>
        )}

        <div style={s.sideFooter}>
          <div style={s.userInfo}>
            <div style={s.userAvatar}>{(user?.name || 'P').charAt(0).toUpperCase()}</div>
            <div style={s.userName}>{user?.name || 'Pharmacy'}</div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content — show verification gate if not verified */}
      <main style={s.content}>
        {isVerified ? <Outlet /> : <VendorVerification />}
      </main>
    </div>
  );
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  sidebar: {
    width: '220px', minHeight: '100vh', background: '#fff', borderRight: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 10,
  },
  brand: {
    padding: '1.25rem 1.25rem 1rem', fontWeight: 800, fontSize: '1.15rem',
    color: '#1D9E75', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center',
    gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid #f3f4f6',
  },
  brandDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' },
  brandSub: { width: '100%', fontSize: '0.62rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '-2px' },
  nav: { flex: 1, padding: '0.75rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '2px' },
  link: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.8rem', borderRadius: '10px', textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s' },
  linkActive: { background: '#f0fdf7', color: '#1D9E75', fontWeight: 600 },
  linkIcon: { flexShrink: 0, display: 'flex' },

  verifyBadge: {
    display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0.6rem 0.5rem',
    padding: '0.5rem 0.8rem', borderRadius: '8px', background: '#fffbeb',
    border: '1px solid #fde68a', fontSize: '0.72rem', fontWeight: 700, color: '#92400e',
  },
  verifiedBadge: {
    display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0.6rem 0.5rem',
    padding: '0.5rem 0.8rem', borderRadius: '8px', background: '#f0fdf7',
    border: '1px solid #bbf7d0', fontSize: '0.72rem', fontWeight: 700, color: '#166534',
  },

  sideFooter: { padding: '1rem', borderTop: '1px solid #f3f4f6' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' },
  userAvatar: { width: '30px', height: '30px', borderRadius: '8px', background: '#1D9E75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 },
  userName: { fontSize: '0.8rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' },
  logoutBtn: { width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #f3f4f6', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  content: { marginLeft: '220px', flex: 1, padding: '2rem', maxWidth: '900px' },
};

export default VendorLayout;
