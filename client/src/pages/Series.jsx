import React from 'react';

export default function Series() {
  return (
    <div>
      <div className="page-header">
        <h1>Series</h1>
        <p>Manage parent series and sub-series for organizing your cards.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary">+ Add Series</button>
      </div>

      <div className="panel">
        <div className="empty-state">
          <p>No series created yet.</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>Examples: "Scarlet & Violet" (parent) → "151", "Obsidian Flames" (sub-series)</p>
        </div>
      </div>
    </div>
  );
}
