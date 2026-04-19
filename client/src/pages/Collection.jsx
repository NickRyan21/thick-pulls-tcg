import React, { useState, useEffect, useMemo } from 'react';
import AddCardModal from '../components/AddCardModal';
import { API_URL } from '../config';

const SORTS = {
  Newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  Oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  'Name A-Z': (a, b) => (a.name || '').localeCompare(b.name || ''),
  'Value High-Low': (a, b) => (Number(b.purchase_price) || 0) - (Number(a.purchase_price) || 0),
};

export default function Collection({ user }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Newest');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCards = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cards?user_id=${user.id}`);
      if (res.ok) setCards(await res.json());
    } catch (err) {
      console.error('Failed to load cards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCards(); }, [user?.id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? cards.filter(c =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.set_name || '').toLowerCase().includes(q) ||
          (c.card_number || '').toLowerCase().includes(q)
        )
      : cards;
    return [...list].sort(SORTS[sort]);
  }, [cards, search, sort]);

  const totalValue = useMemo(
    () => cards.reduce((s, c) => s + (Number(c.purchase_price) || 0), 0),
    [cards]
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this card?')) return;
    const res = await fetch(`${API_URL}/api/cards/${id}`, { method: 'DELETE' });
    if (res.ok) setCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Collection</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <button className="btn btn-primary" onClick={() => setShowAddCard(true)}>+ Add</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
            style={{ padding: '6px 10px' }}
          >
            Grid
          </button>
          <button
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
            style={{ padding: '6px 10px' }}
          >
            List
          </button>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ marginLeft: 8 }}>
            {Object.keys(SORTS).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <label>Total Cards</label>
          <div className="value">{cards.length}</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <label>Est. Value</label>
          <div className="value green">${totalValue.toFixed(2)}</div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state" style={{ padding: 60 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 60 }}>
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-secondary" onClick={() => setShowAddCard(true)} style={{ fontSize: 16, padding: '16px 24px' }}>
              + Add New Card
            </button>
          </div>
          <p>{search ? 'No cards match your search.' : 'Scan or manually add your first Pokemon card.'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={styles.grid}>
          {filtered.map(card => (
            <div key={card.id} style={styles.card}>
              <div style={styles.cardImage}>
                {card.front_image_url ? (
                  <img src={card.front_image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#484f58', fontSize: 12 }}>No image</span>
                )}
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{card.name}</div>
                <div style={{ fontSize: 12, color: '#8b949e' }}>{card.set_name} {card.card_number ? `· ${card.card_number}` : ''}</div>
                <div style={{ fontSize: 11, color: '#58a6ff', marginTop: 4 }}>{card.rarity}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: '#3fb950' }}>
                    {card.purchase_price ? `$${Number(card.purchase_price).toFixed(2)}` : ''}
                  </span>
                  <button onClick={() => handleDelete(card.id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #30363d', background: '#0d1117' }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Set</th>
                <th style={styles.th}>Number</th>
                <th style={styles.th}>Rarity</th>
                <th style={styles.th}>Condition</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Value</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(card => (
                <tr key={card.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={styles.td}>{card.name}</td>
                  <td style={styles.td}>{card.set_name}</td>
                  <td style={styles.td}>{card.card_number}</td>
                  <td style={styles.td}>{card.rarity}</td>
                  <td style={styles.td}>{card.condition}</td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#3fb950' }}>
                    {card.purchase_price ? `$${Number(card.purchase_price).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <button onClick={() => handleDelete(card.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddCard && (
        <AddCardModal
          user={user}
          onClose={() => setShowAddCard(false)}
          onSave={loadCards}
        />
      )}
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 },
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' },
  cardImage: { width: '100%', aspectRatio: '63/88', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  th: { padding: '10px 12px', fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { padding: '10px 12px', fontSize: 13 },
  deleteBtn: { fontSize: 11, color: '#f85149', background: 'transparent', border: '1px solid #30363d', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' },
};
