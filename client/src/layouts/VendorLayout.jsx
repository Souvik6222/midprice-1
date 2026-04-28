import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './VendorLayout.css';

const sidebarLinks = [
  { to: '/vendor/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/vendor/inventory', icon: '💊', label: 'Inventory' },
  { to: '/vendor/reservations', icon: '📋', label: 'Reservations' },
  { to: '/vendor/analytics', icon: '📈', label: 'Analytics' },
  { to: '/vendor/settings', icon: '⚙️', label: 'Settings' },
];

function VendorLayout() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/select-role');
  };

  return (
    <div className="vendor-layout">
      {/* Sidebar */}
      <aside className="vendor-sidebar">
        <div className="vendor-sidebar-brand">
          <h1>MedPrice</h1>
          <span>Pharmacy Portal</span>
        </div>

        <nav className="vendor-sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `vendor-sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span className="vendor-sidebar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="vendor-sidebar-footer">
          <div className="vendor-sidebar-footer-text">MedPrice v1.0</div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="vendor-main">
        {/* Top Header */}
        <header className="vendor-header">
          <div className="vendor-header-title">Pharmacy Dashboard</div>
          <div className="vendor-header-search">
            <input
              className="vendor-header-search-input"
              type="text"
              placeholder="Search inventory, orders..."
            />
          </div>
          <div className="vendor-header-avatar" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Logout">P</div>
        </header>

        {/* Page Content */}
        <main className="vendor-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default VendorLayout;
