import React, { useState } from 'react';
import api from '../../lib/api';
import { ShieldCheck, CheckCircle, XCircle, Clock, Eye, Users, FileText, LogOut } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('pending');
  const [actionMsg, setActionMsg] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewImg, setPreviewImg] = useState(null);

  const fetchVendors = async (s) => {
    setLoading(true); setErr('');
    try {
      await api.get(`/api/vendor/verification/admin/pending?secret=${s}`);
      // Also fetch all vendors for stats
      const { data: all } = await api.get(`/api/vendor/verification/admin/all?secret=${s}`);
      setAllVendors(all.vendors || []);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!secret.trim()) return;
    setAuthenticated(true);
    fetchVendors(secret);
  };

  const handleApprove = async (userId, name) => {
    try {
      await api.post(`/api/vendor/verification/admin/approve/${userId}?secret=${secret}`);
      setActionMsg(`✓ ${name} approved successfully!`);
      fetchVendors(secret);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setErr(e.response?.data?.message || 'Approve failed.');
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/api/vendor/verification/admin/reject/${userId}?secret=${secret}`, {
        reason: rejectReason || 'License could not be verified.',
      });
      setActionMsg('Vendor rejected.');
      setRejectId(null);
      setRejectReason('');
      fetchVendors(secret);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setErr(e.response?.data?.message || 'Reject failed.');
    }
  };

  const filtered = tab === 'pending'
    ? allVendors.filter(v => v.verificationStatus === 'pending')
    : tab === 'approved'
    ? allVendors.filter(v => v.verificationStatus === 'approved')
    : tab === 'rejected'
    ? allVendors.filter(v => v.verificationStatus === 'rejected')
    : allVendors;

  const pendingCount = allVendors.filter(v => v.verificationStatus === 'pending').length;
  const approvedCount = allVendors.filter(v => v.verificationStatus === 'approved').length;
  const rejectedCount = allVendors.filter(v => v.verificationStatus === 'rejected').length;

  // Login screen
  if (!authenticated) {
    return (
      <div style={s.loginPage}>
        <form onSubmit={handleLogin} style={s.loginCard}>
          <div style={s.loginIcon}>
            <ShieldCheck size={36} color="#1D9E75" />
          </div>
          <h1 style={s.loginTitle}>MedPrice Admin</h1>
          <p style={s.loginSub}>Enter your admin secret key to continue</p>
          <input
            style={s.loginInput}
            type="password"
            placeholder="Admin Secret Key"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            autoFocus
          />
          {err && <div style={s.errBanner}>{err}</div>}
          <button type="submit" style={s.loginBtn}>
            <ShieldCheck size={16} /> Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <ShieldCheck size={22} color="#1D9E75" />
          <span style={s.headerTitle}>MedPrice Admin</span>
        </div>
        <button style={s.logoutBtn} onClick={() => { setAuthenticated(false); setSecret(''); }}>
          <LogOut size={14} /> Exit
        </button>
      </header>

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={{ ...s.statCard, borderColor: '#fde68a' }}>
          <Clock size={20} color="#f59e0b" />
          <div style={s.statNum}>{pendingCount}</div>
          <div style={s.statLabel}>Pending</div>
        </div>
        <div style={{ ...s.statCard, borderColor: '#bbf7d0' }}>
          <CheckCircle size={20} color="#1D9E75" />
          <div style={s.statNum}>{approvedCount}</div>
          <div style={s.statLabel}>Approved</div>
        </div>
        <div style={{ ...s.statCard, borderColor: '#fecaca' }}>
          <XCircle size={20} color="#ef4444" />
          <div style={s.statNum}>{rejectedCount}</div>
          <div style={s.statLabel}>Rejected</div>
        </div>
        <div style={{ ...s.statCard, borderColor: '#e5e7eb' }}>
          <Users size={20} color="#6b7280" />
          <div style={s.statNum}>{allVendors.length}</div>
          <div style={s.statLabel}>Total Vendors</div>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && <div style={s.successBanner}>{actionMsg}</div>}
      {err && <div style={s.errBanner}>{err}</div>}

      {/* Tabs */}
      <div style={s.tabRow}>
        {['pending', 'approved', 'rejected', 'all'].map(t => (
          <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'pending' && pendingCount > 0 && <span style={s.tabBadge}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={s.center}><div style={s.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <Users size={36} color="#d1d5db" />
          <div>No {tab} vendors found.</div>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Vendor</th>
                <th style={s.th}>Phone</th>
                <th style={s.th}>License</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Registered</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v._id}>
                  <td style={{ ...s.td, fontWeight: 700, color: '#111827' }}>{v.name || 'No Name'}</td>
                  <td style={s.td}>{v.phone}</td>
                  <td style={s.td}>
                    {v.licenseUrl ? (
                      <button style={s.viewBtn} onClick={() => setPreviewImg(`${API_BASE}${v.licenseUrl}`)}>
                        <Eye size={13} /> View
                      </button>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Not uploaded</span>
                    )}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      ...(v.verificationStatus === 'pending' ? s.badgePending :
                          v.verificationStatus === 'approved' ? s.badgeApproved :
                          v.verificationStatus === 'rejected' ? s.badgeRejected : s.badgeNone),
                    }}>
                      {v.verificationStatus || 'none'}
                    </span>
                  </td>
                  <td style={s.td}>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    {rejectId === v._id ? (
                      <div style={s.rejectForm}>
                        <input
                          style={s.rejectInput}
                          placeholder="Reason (optional)"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                        />
                        <button style={s.confirmRejectBtn} onClick={() => handleReject(v._id)}>Confirm</button>
                        <button style={s.cancelBtn} onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={s.actionRow}>
                        {v.verificationStatus !== 'approved' && (
                          <button style={s.approveBtn} onClick={() => handleApprove(v._id, v.name)}>
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {v.verificationStatus !== 'rejected' && (
                          <button style={s.rejectBtn} onClick={() => setRejectId(v._id)}>
                            <XCircle size={13} /> Reject
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* License Preview Modal */}
      {previewImg && (
        <div style={s.overlay} onClick={() => setPreviewImg(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <FileText size={16} color="#1D9E75" /> License Document
              <button style={s.closeBtn} onClick={() => setPreviewImg(null)}>×</button>
            </div>
            <img src={previewImg} alt="License" style={s.previewImg} />
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  // Login page
  loginPage: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  loginCard: { background: '#fff', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  loginIcon: { width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  loginTitle: { fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem', letterSpacing: '-0.4px' },
  loginSub: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' },
  loginInput: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', marginBottom: '0.75rem', boxSizing: 'border-box' },
  loginBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.75rem', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },

  // Main page
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '0 2rem 2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '10px', color: '#6b7280', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#fff', borderRadius: '14px', padding: '1.25rem', textAlign: 'center', border: '2px solid', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  statNum: { fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0.5rem 0 0.15rem' },
  statLabel: { fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },

  // Tabs
  tabRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' },
  tab: { padding: '0.55rem 1.2rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { background: '#1D9E75', color: '#fff', border: '1.5px solid #1D9E75' },
  tabBadge: { background: '#fff', color: '#1D9E75', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '6px' },

  // Table
  tableWrap: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6', background: '#fafbfc' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid #f3f4f6', color: '#374151', verticalAlign: 'middle' },

  // Badges
  badge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 },
  badgePending: { background: '#fef3c7', color: '#92400e' },
  badgeApproved: { background: '#d1fae5', color: '#065f46' },
  badgeRejected: { background: '#fee2e2', color: '#991b1b' },
  badgeNone: { background: '#f3f4f6', color: '#6b7280' },

  // Buttons
  viewBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem', background: '#f0fdf7', border: '1px solid #bbf7d0', borderRadius: '7px', color: '#1D9E75', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' },
  actionRow: { display: 'flex', gap: '0.4rem' },
  approveBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.7rem', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' },
  rejectBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.7rem', background: '#fff', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' },

  // Reject form
  rejectForm: { display: 'flex', gap: '0.4rem', alignItems: 'center' },
  rejectInput: { padding: '0.35rem 0.6rem', border: '1.5px solid #e5e7eb', borderRadius: '7px', fontSize: '0.75rem', width: '140px', outline: 'none' },
  confirmRejectBtn: { padding: '0.35rem 0.6rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' },
  cancelBtn: { padding: '0.35rem 0.6rem', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' },

  // States
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
  spinner: { width: '26px', height: '26px', border: '3px solid #e5e7eb', borderTop: '3px solid #1D9E75', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  successBanner: { background: '#f0fdf7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.7rem 1rem', color: '#166534', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' },
  errBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' },

  // Modal
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.9rem', color: '#111827' },
  closeBtn: { marginLeft: 'auto', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' },
  previewImg: { width: '100%', display: 'block', padding: '1rem' },
};
