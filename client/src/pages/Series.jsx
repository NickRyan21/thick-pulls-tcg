import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Series() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/series`);
      if (res.ok) setSeries(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), parent_id: parentId || null }),
      });
      if (res.ok) {
        setName('');
        setParentId('');
        setShowAdd(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this series? Sub-series will also be removed.')) return;
    const res = await fetch(`${API_URL}/api/series/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Series</h1>
        <p>Manage parent series and sub-series for organizing your cards.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Series</button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : series.length === 0 ? (
          <div className="empty-state">
            <p>No series created yet.</p>
            <p style={{ marginTop: 8, fontSize: 12 }}>Examples: "Scarlet & Violet" (parent) → "151", "Obsidian Flames" (sub-series)</p>
          </div>
        ) : (
          <div>
            {series.map(parent => (
              <div key={parent.id} style={styles.parentRow}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{parent.name}</div>
                  <button onClick={() => handleDelete(parent.id)} style={styles.deleteBtn}>Delete</button>
                </div>
                {parent.sub_series?.length > 0 && (
                  <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #30363d' }}>
                    {parent.sub_series.map(sub => (
                      <div key={sub.id} style={styles.subRow}>
                        <span style={{ fontSize: 13, color: '#8b949e' }}>{sub.name}</span>
                        <button onClick={() => handleDelete(sub.id)} style={styles.deleteBtn}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>Add Series</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Scarlet & Violet" autoFocus />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Parent Series (optional)</label>
              <select style={styles.input} value={parentId} onChange={e => setParentId(e.target.value)}>
                <option value="">— None (top level) —</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !name.trim()}>
                {saving ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  parentRow: { padding: '12px 0', borderBottom: '1px solid #21262d' },
  subRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' },
  deleteBtn: { fontSize: 11, color: '#f85149', background: 'transparent', border: '1px solid #30363d', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, width: 420 },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
};
