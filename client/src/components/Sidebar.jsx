import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/collection', label: 'Collection' },
  { to: '/series', label: 'Series' },
  { to: '/sets', label: 'Sets' },
  { to: '/labels', label: 'Labels' },
];

export default function Sidebar({ onLogout, user }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/pokeball.png" alt="" style={{ width: 24, height: 24 }} />
        Thick Rips TCG
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {user && <span style={{ fontSize: 12, color: '#58a6ff', padding: '0 0 4px' }}>{user.username}</span>}
        <NavLink to="/settings" className="sidebar-link">My Account</NavLink>
        <a className="sidebar-link logout" onClick={onLogout} style={{ cursor: 'pointer', color: '#f85149' }}>Logout</a>
      </div>
    </aside>
  );
}
