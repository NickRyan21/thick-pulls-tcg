import React, { useState } from 'react';
import { API_URL } from '../config';

export default function Login({ onLogin, onGoToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onLogin(data.user);
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <img src="/pokeball.png" alt="" style={{ width: 32, height: 32 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Thick Rips TCG</h1>
        </div>
        <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" style={styles.input} required />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 12, justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8b949e' }}>
          Don't have an account?{' '}
          <span onClick={onGoToSignup} style={{ color: '#58a6ff', cursor: 'pointer' }}>Create one</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' },
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 32, width: 380 },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14 },
  error: { color: '#f85149', fontSize: 13, marginBottom: 8 },
};
