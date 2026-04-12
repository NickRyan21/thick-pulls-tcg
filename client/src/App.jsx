import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import Series from './pages/Series';
import Sets from './pages/Sets';
import Labels from './pages/Labels';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/layout.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    const saved = localStorage.getItem('tr_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('tr_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tr_user');
  };

  if (!user) {
    if (page === 'signup') {
      return <Signup onLogin={handleLogin} onGoToLogin={() => setPage('login')} />;
    }
    return <Login onLogin={handleLogin} onGoToSignup={() => setPage('signup')} />;
  }

  return (
    <div className="app-layout">
      <Sidebar onLogout={handleLogout} user={user} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/series" element={<Series />} />
          <Route path="/sets" element={<Sets />} />
          <Route path="/labels" element={<Labels />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
