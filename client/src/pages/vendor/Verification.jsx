import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { ShieldCheck, Upload, Clock, XCircle, FileText } from 'lucide-react';

export default function VendorVerification() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const token = useAuthStore(s => s.token);

  const [status, setStatus] = useState(user?.verificationStatus || 'none');
  const [licenseUrl, setLicenseUrl] = useState(user?.licenseUrl || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/api/vendor/verification/status')
      .then(r => {
        setStatus(r.data.verificationStatus);
        setLicenseUrl(r.data.licenseUrl);
        setRejectionReason(r.data.rejectionReason || '');
        // Update local store too
        if (r.data.isVerified && user && !user.isVerified) {
          setUser({ ...user, isVerified: true, verificationStatus: 'approved' }, token);
          window.location.reload();
        }
      })
      .catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setErr('Please select a license file.');
    setUploading(true); setMsg(''); setErr('');

    const formData = new FormData();
    formData.append('license', file);

    try {
      const { data } = await api.post('/api/vendor/verification/upload-license', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('pending');
      setLicenseUrl(data.licenseUrl);
      setMsg(data.message);
      setFile(null);
      // Update store
      setUser({ ...user, verificationStatus: 'pending', licenseUrl: data.licenseUrl }, token);
    } catch (e) {
      setErr(e.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.iconCircle}>
          {status === 'pending'  && <Clock size={32} color="#f59e0b" />}
          {status === 'none'     && <Upload size={32} color="#6b7280" />}
          {status === 'rejected' && <XCircle size={32} color="#ef4444" />}
          {status === 'approved' && <ShieldCheck size={32} color="#1D9E75" />}
        </div>

        <h1 style={s.title}>
          {status === 'none'     && 'Verify Your Pharmacy'}
          {status === 'pending'  && 'Verification Under Review'}
          {status === 'rejected' && 'Verification Rejected'}
          {status === 'approved' && 'Verified!'}
        </h1>

        <p style={s.subtitle}>
          {status === 'none'     && 'Upload your Drug License or Trade License to get verified and start adding medicines.'}
          {status === 'pending'  && 'Your license has been submitted and is being reviewed by our team. This usually takes 24-48 hours.'}
          {status === 'rejected' && 'Your license could not be verified. Please re-upload a valid document.'}
          {status === 'approved' && 'Your pharmacy is verified. You can now manage your inventory.'}
        </p>

        {/* Rejection reason */}
        {status === 'rejected' && rejectionReason && (
          <div style={s.rejectBox}>
            <XCircle size={14} color="#ef4444" />
            <span>Reason: {rejectionReason}</span>
          </div>
        )}

        {/* Upload form (show for 'none' or 'rejected') */}
        {(status === 'none' || status === 'rejected') && (
          <form onSubmit={handleUpload} style={s.form}>
            <label style={s.fileLabel}>
              <FileText size={18} color="#6b7280" />
              <span>{file ? file.name : 'Choose License File (JPG, PNG, PDF)'}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
            <div style={s.hint}>Max file size: 5 MB</div>

            {msg && <div style={s.successBanner}>{msg}</div>}
            {err && <div style={s.errBanner}>{err}</div>}

            <button type="submit" style={s.uploadBtn} disabled={uploading || !file}>
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload & Submit for Review'}
            </button>
          </form>
        )}

        {/* Pending state - show uploaded file */}
        {status === 'pending' && licenseUrl && (
          <div style={s.uploadedBox}>
            <FileText size={16} color="#1D9E75" />
            <span>License uploaded. Awaiting admin review.</span>
          </div>
        )}

        {/* Status steps */}
        <div style={s.steps}>
          <div style={s.step}>
            <div style={{ ...s.stepDot, background: status !== 'none' ? '#1D9E75' : '#d1d5db' }} />
            <span style={s.stepText}>Upload License</span>
          </div>
          <div style={s.stepLine} />
          <div style={s.step}>
            <div style={{ ...s.stepDot, background: status === 'approved' ? '#1D9E75' : status === 'pending' ? '#f59e0b' : '#d1d5db' }} />
            <span style={s.stepText}>Admin Review</span>
          </div>
          <div style={s.stepLine} />
          <div style={s.step}>
            <div style={{ ...s.stepDot, background: status === 'approved' ? '#1D9E75' : '#d1d5db' }} />
            <span style={s.stepText}>Start Selling</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)', padding: '2rem',
  },
  card: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px',
    padding: '2.5rem', maxWidth: '480px', width: '100%', textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
  },
  iconCircle: {
    width: '64px', height: '64px', borderRadius: '50%', background: '#f3f4f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  title: { fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem', letterSpacing: '-0.3px' },
  subtitle: { fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.5rem' },

  rejectBox: {
    display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: '10px', padding: '0.6rem 1rem',
    fontSize: '0.82rem', color: '#ef4444', marginBottom: '1.25rem', textAlign: 'left',
  },

  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  fileLabel: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem',
    border: '2px dashed #d1d5db', borderRadius: '12px', cursor: 'pointer',
    fontSize: '0.85rem', color: '#6b7280', fontWeight: 500,
    transition: 'border-color 0.2s',
  },
  hint: { fontSize: '0.72rem', color: '#9ca3af' },

  successBanner: { background: '#f0fdf7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.6rem', color: '#166534', fontSize: '0.82rem' },
  errBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.6rem', color: '#ef4444', fontSize: '0.82rem' },

  uploadBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '0.75rem 1.5rem', background: '#1D9E75', color: '#fff', border: 'none',
    borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
  },

  uploadedBox: {
    display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf7',
    border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem',
    fontSize: '0.82rem', color: '#166534', justifyContent: 'center', marginBottom: '1.5rem',
  },

  steps: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '2rem' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  stepDot: { width: '12px', height: '12px', borderRadius: '50%' },
  stepText: { fontSize: '0.68rem', color: '#6b7280', fontWeight: 600 },
  stepLine: { width: '40px', height: '2px', background: '#e5e7eb', marginBottom: '18px' },
};
