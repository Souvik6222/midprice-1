import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Shield, LogOut, Bell, Heart, MapPin, ChevronRight, Moon, Sun, Bookmark, ClipboardList } from 'lucide-react';

function Profile() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [priceDrop, setPriceDrop] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/auth/select-role');
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={s.page}>
      {/* Page Header */}
      <div style={s.pageHeader}>
        <div style={s.pageHeaderIcon}><User size={24} /></div>
        <div>
          <div style={s.pageTitle}>Profile</div>
          <div style={s.pageSubtitle}>Manage your account and preferences</div>
        </div>
      </div>

      {/* Profile Card */}
      <div style={s.profileCard}>
        <div style={s.avatar}>{initials}</div>
        <div style={s.profileInfo}>
          <div style={s.profileName}>{user?.name || 'Guest'}</div>
          <div style={s.profileRole}><Heart size={14} /> Patient Account</div>
        </div>
        <div style={s.profileBadge}>Active</div>
      </div>

      {/* Account Info */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Personal Information</div>
        <div style={s.card}>
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><User size={18} color="#1D9E75" /></div>
              <div>
                <div style={s.rowLabel}>Full Name</div>
                <div style={s.rowValue}>{user?.name || 'Guest'}</div>
              </div>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </div>
          <div style={s.divider} />
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><Phone size={18} color="#3b82f6" /></div>
              <div>
                <div style={s.rowLabel}>Phone Number</div>
                <div style={s.rowValue}>{user?.phone || 'N/A'}</div>
              </div>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </div>
          <div style={s.divider} />
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><Shield size={18} color="#8b5cf6" /></div>
              <div>
                <div style={s.rowLabel}>Account Type</div>
                <div style={s.rowValue}>{user?.role || 'patient'}</div>
              </div>
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><MapPin size={18} color="#f59e0b" /></div>
              <div>
                <div style={s.rowLabel}>Location</div>
                <div style={s.rowValue}>{user?.location || 'Not set'}</div>
              </div>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Quick Access</div>
        <div style={s.card}>
          <div style={{ ...s.row, cursor: 'pointer' }} onClick={() => navigate('/patient/saved')}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><Bookmark size={18} color="#f59e0b" /></div>
              <div>
                <div style={s.rowLabel}>Saved Medicines</div>
                <div style={s.rowHint}>View your bookmarked medicines</div>
              </div>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </div>
          <div style={s.divider} />
          <div style={{ ...s.row, cursor: 'pointer' }} onClick={() => navigate('/patient/reservations')}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><ClipboardList size={18} color="#1D9E75" /></div>
              <div>
                <div style={s.rowLabel}>My Reservations</div>
                <div style={s.rowHint}>Track your active orders</div>
              </div>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Preferences</div>
        <div style={s.card}>
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><Bell size={18} color="#f59e0b" /></div>
              <div>
                <div style={s.rowLabel}>Notifications</div>
                <div style={s.rowHint}>Reservation updates and alerts</div>
              </div>
            </div>
            <label style={s.toggle}>
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} style={{ display: 'none' }} />
              <span style={{
                ...s.toggleTrack,
                background: notifications ? '#1D9E75' : '#e5e7eb',
              }}>
                <span style={{
                  ...s.toggleKnob,
                  transform: notifications ? 'translateX(18px)' : 'translateX(2px)',
                }} />
              </span>
            </label>
          </div>
          <div style={s.divider} />
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowIcon}><Heart size={18} color="#ef4444" /></div>
              <div>
                <div style={s.rowLabel}>Price Drop Alerts</div>
                <div style={s.rowHint}>Notify when saved medicine prices drop</div>
              </div>
            </div>
            <label style={s.toggle}>
              <input type="checkbox" checked={priceDrop} onChange={() => setPriceDrop(!priceDrop)} style={{ display: 'none' }} />
              <span style={{
                ...s.toggleTrack,
                background: priceDrop ? '#1D9E75' : '#e5e7eb',
              }}>
                <span style={{
                  ...s.toggleKnob,
                  transform: priceDrop ? 'translateX(18px)' : 'translateX(2px)',
                }} />
              </span>
            </label>
          </div>
          <div style={s.divider} />
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowIcon}>{darkMode ? <Moon size={18} color="#8b5cf6" /> : <Sun size={18} color="#f59e0b" />}</div>
              <div>
                <div style={s.rowLabel}>Dark Mode</div>
                <div style={s.rowHint}>Switch appearance theme</div>
              </div>
            </div>
            <label style={s.toggle}>
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} style={{ display: 'none' }} />
              <span style={{
                ...s.toggleTrack,
                background: darkMode ? '#1D9E75' : '#e5e7eb',
              }}>
                <span style={{
                  ...s.toggleKnob,
                  transform: darkMode ? 'translateX(18px)' : 'translateX(2px)',
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Account</div>
        <div style={s.card}>
          <div style={{ ...s.row, cursor: 'pointer' }} onClick={handleLogout}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={s.rowLeft}>
              <div style={{ ...s.rowIcon, background: '#fef2f2' }}><LogOut size={18} color="#ef4444" /></div>
              <div>
                <div style={{ ...s.rowLabel, color: '#ef4444' }}>Log Out</div>
                <div style={s.rowHint}>Sign out of your account</div>
              </div>
            </div>
            <ChevronRight size={18} color="#ef4444" />
          </div>
        </div>
      </div>

      <div style={s.footer}>MedPrice v1.0 · Patient Portal</div>
    </div>
  );
}

const s = {
  page: { maxWidth: '640px', margin: '0 auto' },
  pageHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' },
  pageHeaderIcon: { width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D9E75' },
  pageTitle: { fontSize: '1.35rem', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' },
  pageSubtitle: { fontSize: '0.82rem', color: '#9ca3af', fontWeight: 400, marginTop: '2px' },

  profileCard: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', color: '#fff' },
  avatar: { width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.5px' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '1.1rem', fontWeight: 700 },
  profileRole: { fontSize: '0.78rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' },
  profileBadge: { padding: '0.2rem 0.7rem', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', fontWeight: 600 },

  section: { marginBottom: '1.25rem' },
  sectionTitle: { fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem', paddingLeft: '4px' },
  card: { background: '#fff', borderRadius: '14px', border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.1rem', transition: 'background 0.15s ease' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  rowIcon: { width: '36px', height: '36px', borderRadius: '10px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowLabel: { fontSize: '0.88rem', fontWeight: 600, color: '#1a1a2e' },
  rowValue: { fontSize: '0.8rem', color: '#6b7280', marginTop: '1px', textTransform: 'capitalize' },
  rowHint: { fontSize: '0.75rem', color: '#9ca3af', marginTop: '1px' },
  divider: { height: '1px', background: '#f3f4f6', margin: '0 1.1rem' },

  toggle: { cursor: 'pointer', display: 'inline-flex' },
  toggleTrack: { width: '40px', height: '22px', borderRadius: '11px', position: 'relative', transition: 'background 0.2s ease', display: 'inline-block' },
  toggleKnob: { width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', transition: 'transform 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' },

  footer: { textAlign: 'center', fontSize: '0.72rem', color: '#d1d5db', padding: '1.5rem 0 0.5rem', fontWeight: 500, letterSpacing: '0.3px' },
};

export default Profile;
