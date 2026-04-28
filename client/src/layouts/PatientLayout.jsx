import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './PatientLayout.css';

const sidebarLinks = [
  { to: '/patient/home', icon: '🏠', label: 'Home' },
  { to: '/patient/search', icon: '🔍', label: 'Search' },
  { to: '/patient/saved', icon: '💾', label: 'Saved' },
  { to: '/patient/reservations', icon: '📋', label: 'Reservations' },
  { to: '/patient/profile', icon: '👤', label: 'Profile' },
];

function PatientLayout() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/select-role');
  };

  return (
    <div className="patient-layout">
      {/* Sidebar */}
      <aside className="patient-sidebar">
        <div className="sidebar-brand">
          <h1>MedPrice</h1>
          <span>Patient Portal</span>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">MedPrice v1.0</div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="patient-main">
        {/* Top Header */}
        <header className="patient-header">
          <div className="header-title">Dashboard</div>
          <div className="header-search">
            <input
              className="header-search-input"
              type="text"
              placeholder="Search medicines, pharmacies..."
            />
          </div>
          <div className="header-avatar" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Logout">U</div>
        </header>

        {/* Page Content */}
        <main className="patient-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;
