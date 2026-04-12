import React, { useState } from 'react';

const TABS = ['Rarity', 'Energy Type', 'Parallel', 'Language'];

export default function Labels() {
  const [activeTab, setActiveTab] = useState('Rarity');

  return (
    <div>
      <div className="page-header">
        <h1>Manage Labels</h1>
      </div>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #30363d' }}>
              <th style={{ padding: '8px 0', fontSize: 12, color: '#8b949e', textTransform: 'uppercase' }}>Item Name</th>
              <th style={{ padding: '8px 0', fontSize: 12, color: '#8b949e', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2} className="empty-state">No items found for this category.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
