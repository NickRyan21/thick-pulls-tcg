import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import Series from './pages/Series';
import Sets from './pages/Sets';
import Labels from './pages/Labels';
import Settings from './pages/Settings';
import './styles/layout.css';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
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
