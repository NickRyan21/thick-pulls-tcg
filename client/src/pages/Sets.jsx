import React from 'react';

export default function Sets() {
  return (
    <div>
      <div className="page-header">
        <h1>Sets</h1>
        <p>Group cards into sets for bulk management and tracking.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary">+ Add Set</button>
      </div>

      <div className="panel">
        <div className="empty-state">No sets created yet.</div>
      </div>
    </div>
  );
}
