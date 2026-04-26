import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';

const s = {
  page: { maxWidth: '1020px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  searchInput: { flex: '0 1 360px', padding: '0.7rem 1rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease' },
  addBtn: { padding: '0.7rem 1.4rem', borderRadius: '12px', border: 'none', background: '#1D9E75', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s ease', boxShadow: '0 4px 14px rgba(29,158,117,0.25)', whiteSpace: 'nowrap' },
  tableWrap: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { padding: '0.8rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6', background: '#fafbfc' },
  td: { padding: '0.75rem', borderBottom: '1px solid #f3f4f6', color: '#374151', verticalAlign: 'middle' },
  medName: { fontWeight: 600, color: '#1a1a2e' },
  price: { fontWeight: 700, color: '#1D9E75' },
  mrpStyle: { color: '#9ca3af' },
  badgeListed: { display: 'inline-block', padding: '0.18rem 0.55rem', borderRadius: '8px', background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', fontWeight: 600 },
  badgeUnlisted: { display: 'inline-block', padding: '0.18rem 0.55rem', borderRadius: '8px', background: '#f3f4f6', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600 },
  badgeOos: { display: 'inline-block', padding: '0.18rem 0.55rem', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 600 },
  actionRow: { display: 'flex', gap: '0.35rem' },
  iconBtn: { width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', transition: 'all 0.15s ease' },
  saveBtn: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 700 },
  cancelEditBtn: { width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 700 },
  inlineInput: { width: '70px', padding: '0.35rem 0.5rem', borderRadius: '8px', border: '2px solid #1D9E75', fontSize: '0.85rem', fontWeight: 600, outline: 'none', textAlign: 'center' },
  loading: { textAlign: 'center', padding: '3rem', color: '#1D9E75', fontSize: '1rem', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem' },
  error: { color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: '20px', width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' },
  modalTitle: { fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1.5rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  formGroupFull: { display: 'flex', flexDirection: 'column', gap: '0.3rem', gridColumn: '1 / -1' },
  formLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  formInput: { padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease' },
  savingsHint: { fontSize: '0.8rem', fontWeight: 600, color: '#22c55e', marginTop: '0.25rem' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  modalSaveBtn: { padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', background: '#1D9E75', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,158,117,0.25)' },
  modalCancelBtn: { padding: '0.7rem 1.5rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
};

const getStatus = (item) => {
  if (!item.isListed) return { text: 'Unlisted', badge: s.badgeUnlisted };
  if (item.stockQty <= 0) return { text: 'Out of Stock', badge: s.badgeOos };
  return { text: 'Listed', badge: s.badgeListed };
};

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newMed, setNewMed] = useState({ medicineId: '', mrp: '', sellingPrice: '', stockQty: '' });

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/api/vendor/inventory');
      setInventory(data.inventory || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const filtered = useMemo(() =>
    inventory.filter((item) => (item.medicineId?.name || '').toLowerCase().includes(search.toLowerCase())),
    [inventory, search]);

  const startEdit = (item) => { setEditingId(item._id); setEditPrice(String(item.sellingPrice)); setEditStock(String(item.stockQty)); };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/api/vendor/inventory/${id}`, { sellingPrice: Number(editPrice), stockQty: Number(editStock) });
      setEditingId(null);
      fetchInventory();
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
  };

  const deleteMed = async (id) => {
    try { await api.delete(`/api/vendor/inventory/${id}`); fetchInventory(); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed'); }
  };

  const updateNew = (field, val) => setNewMed((p) => ({ ...p, [field]: val }));

  const saveNew = async () => {
    if (!newMed.medicineId) return;
    setSaving(true); setError('');
    try {
      await api.post('/api/vendor/inventory', { medicineId: newMed.medicineId, mrp: Number(newMed.mrp) || 0, sellingPrice: Number(newMed.sellingPrice) || 0, stockQty: Number(newMed.stockQty) || 0 });
      setNewMed({ medicineId: '', mrp: '', sellingPrice: '', stockQty: '' });
      setShowModal(false); fetchInventory();
    } catch (err) { setError(err.response?.data?.message || 'Add failed'); }
    finally { setSaving(false); }
  };

  const newSavings = newMed.mrp && newMed.sellingPrice ? Number(newMed.mrp) - Number(newMed.sellingPrice) : 0;

  if (loading) return <div style={s.loading}>⏳ Loading inventory...</div>;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <input style={s.searchInput} type="text" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} onFocus={(e) => (e.target.style.borderColor = '#1D9E75')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
        <button style={s.addBtn} onClick={() => setShowModal(true)} onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')} onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}>+ Add Medicine</button>
      </div>

      {error && <div style={s.error}>⚠️ {error}</div>}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr><th style={s.th}>Medicine</th><th style={s.th}>Dosage</th><th style={s.th}>Pack</th><th style={s.th}>MRP</th><th style={s.th}>Your Price</th><th style={s.th}>Stock</th><th style={s.th}>Status</th><th style={s.th}>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={s.empty}>No medicines found. Add your first medicine!</td></tr>
            ) : (
              filtered.map((item) => {
                const isEditing = editingId === item._id;
                const med = item.medicineId || {};
                const st = getStatus(item);
                return (
                  <tr key={item._id}>
                    <td style={{ ...s.td, ...s.medName }}>{med.name || 'Unknown'}</td>
                    <td style={s.td}>{med.dosage || '-'}</td>
                    <td style={s.td}>{med.packSize || '-'}</td>
                    <td style={{ ...s.td, ...s.mrpStyle }}>₹{item.mrp}</td>
                    <td style={s.td}>{isEditing ? <input style={s.inlineInput} type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} /> : <span style={s.price}>₹{item.sellingPrice}</span>}</td>
                    <td style={s.td}>{isEditing ? <input style={s.inlineInput} type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} /> : item.stockQty}</td>
                    <td style={s.td}><span style={st.badge}>{st.text}</span></td>
                    <td style={s.td}>
                      <div style={s.actionRow}>
                        {isEditing ? (<><button style={s.saveBtn} onClick={() => saveEdit(item._id)} title="Save">✓</button><button style={s.cancelEditBtn} onClick={() => setEditingId(null)} title="Cancel">✗</button></>) : (<><button style={s.iconBtn} onClick={() => startEdit(item)} title="Edit">✏️</button><button style={s.iconBtn} onClick={() => deleteMed(item._id)} title="Delete">🗑️</button></>)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Add New Medicine</div>
            <div style={s.formGrid}>
              <div style={s.formGroupFull}><label style={s.formLabel}>Medicine ID</label><input style={s.formInput} placeholder="Paste medicine ObjectId" value={newMed.medicineId} onChange={(e) => updateNew('medicineId', e.target.value)} /></div>
              <div style={s.formGroup}><label style={s.formLabel}>MRP (₹)</label><input style={s.formInput} type="number" placeholder="150" value={newMed.mrp} onChange={(e) => updateNew('mrp', e.target.value)} /></div>
              <div style={s.formGroup}><label style={s.formLabel}>Your Price (₹)</label><input style={s.formInput} type="number" placeholder="95" value={newMed.sellingPrice} onChange={(e) => updateNew('sellingPrice', e.target.value)} />{newSavings > 0 && <div style={s.savingsHint}>Saving customers ₹{newSavings}</div>}</div>
              <div style={s.formGroupFull}><label style={s.formLabel}>Stock Quantity</label><input style={s.formInput} type="number" placeholder="100" value={newMed.stockQty} onChange={(e) => updateNew('stockQty', e.target.value)} /></div>
            </div>
            <div style={s.modalActions}>
              <button style={s.modalCancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ ...s.modalSaveBtn, ...(!newMed.medicineId || saving ? { background: '#d1d5db', cursor: 'not-allowed', boxShadow: 'none' } : {}) }} disabled={!newMed.medicineId || saving} onClick={saveNew}>{saving ? 'Saving...' : 'Save Medicine'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
