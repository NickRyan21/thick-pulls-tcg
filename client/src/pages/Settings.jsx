import React from 'react';

export default function Settings() {
  return (
    <div>
      <div className="page-header">
        <h1>Account Settings</h1>
      </div>

      <div className="panel">
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Username</label>
            <input style={styles.input} defaultValue="" placeholder="Username" />
          </div>
          <div>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" placeholder="Enter your email" />
          </div>
          <div>
            <label style={styles.label}>First Name</label>
            <input style={styles.input} placeholder="First Name" />
          </div>
          <div>
            <label style={styles.label}>Last Name</label>
            <input style={styles.input} placeholder="Last Name" />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={styles.label}>New Password</label>
          <input style={{ ...styles.input, width: '100%' }} type="password" placeholder="New password" />
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>eBay Integration</h2>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>Default Starting Bid ($)</label>
          <input style={styles.input} type="number" step="0.01" defaultValue="0.01" />
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }}>
          Link eBay Account
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
};
