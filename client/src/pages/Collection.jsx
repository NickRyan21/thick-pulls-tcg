import React, { useState } from 'react';
import AddCardModal from '../components/AddCardModal';

export default function Collection() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

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
          <select style={{ marginLeft: 8 }}>
            <option>Newest</option>
            <option>Oldest</option>
            <option>Name A-Z</option>
            <option>Value High-Low</option>
          </select>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <label>Total Cards</label>
          <div className="value">0</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <label>Est. Value</label>
          <div className="value green">$0.00</div>
        </div>
      </div>

      <div className="empty-state" style={{ padding: 60 }}>
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary" onClick={() => setShowAddCard(true)} style={{ fontSize: 16, padding: '16px 24px' }}>
            + Add New Card
          </button>
        </div>
        <p>Scan or manually add your first Pokemon card.</p>
      </div>

      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} />}
    </div>
  );
}
