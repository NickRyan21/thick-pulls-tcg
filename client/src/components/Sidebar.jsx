import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/collection', label: 'Collection' },
  { to: '/series', label: 'Series' },
  { to: '/sets', label: 'Sets' },
  { to: '/labels', label: 'Labels' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Thick Pulls TCG</div>
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
        <NavLink to="/settings" className="sidebar-link">My Account</NavLink>
      </div>
    </aside>
  );
}
