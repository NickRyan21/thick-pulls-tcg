import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Sets() {
  const [sets, setSets] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', year: '', series_id: '', parallel: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [setsRes, seriesRes] = await Promise.all([
        fetch(`${API_URL}/api/sets`),
        fetch(`${API_URL}/api/series`),
      ]);
      if (setsRes.ok) setSets(await setsRes.json());
      if (seriesRes.ok) {
        const parents = await seriesRes.json();
        const flat = parents.flatMap(p => [{ id: p.id, name: p.name }, ...(p.sub_series || []).map(s => ({ id: s.id, name: `${p.name} → ${s.name}` }))]);
        setSeriesList(flat);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          year: form.year || null,
          series_id: form.series_id || null,
          parallel: form.parallel || null,
        }),
      });
      if (res.ok) {
        setForm({ name: '', year: '', series_id: '', parallel: '' });
        setShowAdd(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this set?')) return;
    const res = await fetch(`${API_URL}/api/sets/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Sets</h1>
        <p>Group cards into sets for bulk management and tracking.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Set</button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : sets.length === 0 ? (
          <div className="empty-state">No sets created yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #30363d' }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Series</th>
                <th style={styles.th}>Year</th>
                <th style={styles.th}>Parallel</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sets.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.series?.name || '—'}</td>
                  <td style={styles.td}>{s.year || '—'}</td>
                  <td style={styles.td}>{s.parallel || '—'}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <button onClick={() => handleDelete(s.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>Add Set</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Obsidian Flames" autoFocus />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Series (optional)</label>
              <select style={styles.input} value={form.series_id} onChange={e => setForm({ ...form, series_id: e.target.value })}>
                <option value="">— None —</option>
                {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={styles.label}>Year</label>
                <input style={styles.input} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2024" />
              </div>
              <div>
                <label style={styles.label}>Parallel</label>
                <input style={styles.input} value={form.parallel} onChange={e => setForm({ ...form, parallel: e.target.value })} placeholder="e.g. Reverse Holo" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !form.name.trim()}>
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
  th: { padding: '10px 12px', fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { padding: '10px 12px', fontSize: 13 },
  deleteBtn: { fontSize: 11, color: '#f85149', background: 'transparent', border: '1px solid #30363d', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, width: 480 },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
};
