import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Trash2, Edit2, Check, X, Package } from 'lucide-react';

export default function VendorInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ medicineName: '', price: '', stockQty: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Inline edit
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ price: '', stockQty: '' });

  const load = () => {
    setLoading(true);
    api.get('/api/vendor/inventory')
      .then(r => setItems(r.data.inventory || []))
      .catch(() => setError('Failed to load medicines.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!form.medicineName.trim()) return setAddError('Medicine name required.');
    if (!form.price || Number(form.price) <= 0) return setAddError('Price must be greater than 0.');
    setAdding(true);
    try {
      await api.post('/api/vendor/inventory', {
        medicineName: form.medicineName.trim(),
        price: Number(form.price),
        stockQty: Number(form.stockQty) || 0,
      });
      setForm({ medicineName: '', price: '', stockQty: '' });
      setShowAdd(false);
      load();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine from your inventory?')) return;
    try {
      await api.delete(`/api/vendor/inventory/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setEditData({ price: item.sellingPrice, stockQty: item.stockQty });
  };

  const saveEdit = async () => {
    try {
      const { data } = await api.patch(`/api/vendor/inventory/${editId}`, {
        price: Number(editData.price),
        stockQty: Number(editData.stockQty),
      });
      setItems(prev => prev.map(i => i._id === editId ? data : i));
      setEditId(null);
    } catch {
      alert('Failed to save.');
    }
  };

  return (
    <div className="vi-container">
      <style>{responsiveCSS}</style>

      {/* Header */}
      <div className="vi-page-header">
        <div>
          <h1 className="vi-title">My Medicines</h1>
          <p className="vi-sub">{items.length} medicine{items.length !== 1 ? 's' : ''} in your inventory</p>
        </div>
        <button className="vi-add-btn" onClick={() => { setShowAdd(!showAdd); setAddError(''); }}>
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="vi-add-form">
          <div className="vi-add-form-title">Add New Medicine</div>
          <div className="vi-form-grid">
            <input
              className="vi-input"
              placeholder="Medicine name (e.g. Paracetamol 500mg)"
              value={form.medicineName}
              onChange={e => setForm(p => ({ ...p, medicineName: e.target.value }))}
            />
            <input
              className="vi-input"
              type="number"
              placeholder="Price (₹)"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              min="0"
            />
            <input
              className="vi-input"
              type="number"
              placeholder="Stock qty"
              value={form.stockQty}
              onChange={e => setForm(p => ({ ...p, stockQty: e.target.value }))}
              min="0"
            />
          </div>
          {addError && <div className="vi-err-msg">{addError}</div>}
          <div className="vi-form-actions">
            <button type="submit" className="vi-save-btn" disabled={adding}>{adding ? 'Adding...' : 'Add Medicine'}</button>
            <button type="button" className="vi-cancel-btn" onClick={() => { setShowAdd(false); setAddError(''); }}>Cancel</button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="vi-center"><div className="vi-spinner" /></div>
      ) : error ? (
        <div className="vi-err-banner">{error} <button className="vi-retry-link" onClick={load}>Retry</button></div>
      ) : items.length === 0 ? (
        <div className="vi-empty">
          <Package size={40} color="#d1d5db" />
          <div>No medicines added yet.</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Click "Add Medicine" to get started.</div>
        </div>
      ) : (
        <div className="vi-list">
          {items.map(item => (
            <div key={item._id} className={`vi-row ${item.stockQty === 0 ? 'vi-row-oos' : ''}`}>
              <div className="vi-row-left">
                <div className="vi-dot" style={{ background: item.stockQty > 5 ? '#22c55e' : item.stockQty > 0 ? '#f59e0b' : '#ef4444' }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="vi-med-name">{item.medicineId?.name}</div>
                  <div className="vi-med-qty">Stock: {item.stockQty} {item.stockQty === 0 && <span className="vi-oos-badge">Out of Stock</span>}</div>
                </div>
              </div>

              {editId === item._id ? (
                <div className="vi-edit-row">
                  <input className="vi-mini-input" type="number" value={editData.price} onChange={e => setEditData(p => ({ ...p, price: e.target.value }))} placeholder="Price" />
                  <input className="vi-mini-input" type="number" value={editData.stockQty} onChange={e => setEditData(p => ({ ...p, stockQty: e.target.value }))} placeholder="Qty" />
                  <button className="vi-icon-btn vi-btn-success" onClick={saveEdit}><Check size={15} /></button>
                  <button className="vi-icon-btn vi-btn-gray" onClick={() => setEditId(null)}><X size={15} /></button>
                </div>
              ) : (
                <div className="vi-row-right">
                  <div className="vi-price">₹{item.sellingPrice}</div>
                  <div className="vi-actions">
                    <button className="vi-icon-btn vi-btn-blue" title="Edit" onClick={() => startEdit(item)}><Edit2 size={15} /></button>
                    <button className="vi-icon-btn vi-btn-red" title="Delete" onClick={() => handleDelete(item._id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const responsiveCSS = `
  .vi-container { width: 100%; }
  .vi-center { display: flex; align-items: center; justify-content: center; height: 200px; }
  .vi-spinner { width: 26px; height: 26px; border: 3px solid #e5e7eb; border-top: 3px solid #1D9E75; border-radius: 50%; animation: spin 0.8s linear infinite; }
  
  .vi-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap; }
  .vi-title { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.3px; }
  .vi-sub { font-size: 0.82rem; color: #9ca3af; margin: 2px 0 0; }
  .vi-add-btn { display: flex; align-items: center; gap: 6px; padding: 0.6rem 1.1rem; background: #1D9E75; color: #fff; border: none; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; white-space: nowrap; }

  .vi-add-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .vi-add-form-title { font-weight: 700; font-size: 0.95rem; color: #111827; margin-bottom: 0.85rem; }
  .vi-form-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .vi-input { flex: 1 1 160px; padding: 0.6rem 0.85rem; border: 1.5px solid #e5e7eb; border-radius: 9px; font-size: 0.875rem; outline: none; font-family: inherit; color: #111827; transition: border-color 0.15s; }
  .vi-input:focus { border-color: #1D9E75; }
  .vi-err-msg { margin-top: 0.5rem; color: #ef4444; font-size: 0.82rem; font-weight: 500; }
  .vi-form-actions { display: flex; gap: 0.6rem; margin-top: 0.85rem; }
  .vi-save-btn { padding: 0.55rem 1.2rem; background: #1D9E75; color: #fff; border: none; border-radius: 9px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }
  .vi-cancel-btn { padding: 0.55rem 1.2rem; background: #fff; color: #6b7280; border: 1.5px solid #e5e7eb; border-radius: 9px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }

  .vi-err-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 0.85rem 1rem; color: #ef4444; font-size: 0.875rem; }
  .vi-retry-link { background: none; border: none; color: #ef4444; text-decoration: underline; cursor: pointer; font-weight: 600; }

  .vi-empty { text-align: center; padding: 3rem; color: #6b7280; display: flex; flex-direction: column; align-items: center; gap: 8px; }

  .vi-list { display: flex; flex-direction: column; gap: 6px; }
  .vi-row { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0.85rem 1.1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .vi-row-oos { opacity: 0.7; border-style: dashed; }
  .vi-row-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .vi-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .vi-med-name { font-weight: 600; font-size: 0.9rem; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vi-med-qty { font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 6px; margin-top: 1px; flex-wrap: wrap; }
  .vi-oos-badge { background: #fef2f2; color: #ef4444; padding: 0.1rem 0.4rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; }
  
  .vi-row-right { display: flex; align-items: center; gap: 8px; }
  .vi-price { font-weight: 700; font-size: 1rem; color: #1D9E75; min-width: 55px; text-align: right; }
  .vi-actions { display: flex; gap: 4px; }
  
  .vi-edit-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .vi-mini-input { width: 70px; padding: 0.4rem 0.5rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 0.82rem; outline: none; text-align: center; }
  
  .vi-icon-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .vi-btn-success { background: #1D9E7515; color: #1D9E75; }
  .vi-btn-gray { background: #6b728015; color: #6b7280; }
  .vi-btn-blue { background: #3b82f615; color: #3b82f6; }
  .vi-btn-red { background: #ef444415; color: #ef4444; }

  /* ═══ RESPONSIVE: Mobile (<768px) ═══ */
  @media (max-width: 768px) {
    .vi-page-header { flex-direction: column; gap: 0.75rem; }
    .vi-add-btn { width: 100%; justify-content: center; }
    .vi-input { flex: 1 1 100%; }
    .vi-form-actions { flex-direction: column; }
    .vi-save-btn, .vi-cancel-btn { width: 100%; }
    
    .vi-row { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
    .vi-row-right { width: 100%; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid #f3f4f6; }
    .vi-price { text-align: left; }
    .vi-edit-row { width: 100%; padding-top: 0.5rem; border-top: 1px solid #f3f4f6; }
  }
`;
