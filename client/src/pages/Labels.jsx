import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const TABS = [
  { label: 'Rarity', category: 'rarity' },
  { label: 'Energy Type', category: 'energy_type' },
  { label: 'Parallel', category: 'parallel' },
  { label: 'Language', category: 'language' },
];

export default function Labels() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/labels?category=${category}`);
      if (res.ok) setLabels(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab.category); }, [activeTab.category]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeTab.category, name: newName.trim() }),
      });
      if (res.ok) {
        setNewName('');
        await load(activeTab.category);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this label?')) return;
    const res = await fetch(`${API_URL}/api/labels/${id}`, { method: 'DELETE' });
    if (res.ok) await load(activeTab.category);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Manage Labels</h1>
      </div>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.category}
            className={`tab ${activeTab.category === tab.category ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`Add new ${activeTab.label.toLowerCase()}...`}
            style={styles.input}
          />
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !newName.trim()}>
            {saving ? 'Adding...' : '+ Add'}
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #30363d' }}>
              <th style={{ padding: '8px 0', fontSize: 12, color: '#8b949e', textTransform: 'uppercase' }}>Item Name</th>
              <th style={{ padding: '8px 0', fontSize: 12, color: '#8b949e', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="empty-state">Loading...</td></tr>
            ) : labels.length === 0 ? (
              <tr><td colSpan={2} className="empty-state">No items found for this category.</td></tr>
            ) : (
              labels.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '10px 0', fontSize: 14 }}>{l.name}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(l.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  input: { flex: 1, padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
  deleteBtn: { fontSize: 11, color: '#f85149', background: 'transparent', border: '1px solid #30363d', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' },
};
