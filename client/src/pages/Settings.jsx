import React, { useState } from 'react';
import { API_URL } from '../config';

export default function Settings({ user, onUpdateUser }) {
  const initial = {
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    startingBid: user?.ebay_default_starting_bid ?? 0.01,
  };

  const [username, setUsername] = useState(initial.username);
  const [email, setEmail] = useState(initial.email);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [startingBid, setStartingBid] = useState(initial.startingBid);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password: password || undefined,
          ebay_default_starting_bid: parseFloat(startingBid) || 0.01,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to save');
        return;
      }
      onUpdateUser(data.user);
      setPassword('');
      setMessage('Saved');
    } catch {
      setMessage('Connection failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(initial.username);
    setEmail(initial.email);
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
    setStartingBid(initial.startingBid);
    setPassword('');
    setMessage('');
  };

  const handleLinkEbay = () => {
    setMessage('eBay linking is not yet configured. Add EBAY_APP_ID, EBAY_CERT_ID, and EBAY_RUNAME to the server.');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Account Settings</h1>
      </div>

      <div className="panel">
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Username</label>
            <input style={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          </div>
          <div>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>
          <div>
            <label style={styles.label}>First Name</label>
            <input style={styles.input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" />
          </div>
          <div>
            <label style={styles.label}>Last Name</label>
            <input style={styles.input} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={styles.label}>New Password</label>
          <input style={{ ...styles.input, width: '100%' }} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>eBay Integration</h2>
          {user?.ebay_username && (
            <span style={{ fontSize: 12, color: '#3fb950', padding: '2px 8px', background: '#0d2818', borderRadius: 4 }}>
              Linked: {user.ebay_username}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>Default Starting Bid ($)</label>
          <input style={styles.input} type="number" step="0.01" value={startingBid} onChange={e => setStartingBid(e.target.value)} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLinkEbay}>
          {user?.ebay_username ? 'Re-link eBay Account' : 'Link eBay Account'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 16 }}>
        {message && <span style={{ fontSize: 13, color: message === 'Saved' ? '#3fb950' : '#f85149' }}>{message}</span>}
        <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
};
