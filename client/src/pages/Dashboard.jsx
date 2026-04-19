import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({ listed: 0, soldCount: 0, revenue: 0, avg: 0, recent30: 0 });
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [statsRes, cardsRes] = await Promise.all([
          fetch(`${API_URL}/api/stats?user_id=${user.id}`),
          fetch(`${API_URL}/api/cards?user_id=${user.id}`),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (cardsRes.ok) {
          const cards = await cardsRes.json();
          const sales = cards
            .filter(c => c.ebay_status === 'sold' && c.ebay_sold_at)
            .sort((a, b) => new Date(b.ebay_sold_at) - new Date(a.ebay_sold_at))
            .slice(0, 5);
          setRecentSales(sales);
        }
      } catch (err) {
        console.error('Failed to load dashboard', err);
      }
    })();
  }, [user?.id]);

  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your cards and eBay sales activity.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <label>Listed on eBay</label>
          <div className="value">{stats.listed}</div>
          <div className="sub">Active listings</div>
        </div>
        <div className="stat-card">
          <label>Cards Sold</label>
          <div className="value">{stats.soldCount}</div>
          <div className="sub">All time</div>
        </div>
        <div className="stat-card">
          <label>Total Revenue</label>
          <div className="value green">{fmt(stats.revenue)}</div>
          <div className="sub">From sold cards</div>
        </div>
        <div className="stat-card">
          <label>Avg Sale Price</label>
          <div className="value blue">{fmt(stats.avg)}</div>
          <div className="sub">{stats.soldCount ? `Across ${stats.soldCount} sales` : 'No sales yet'}</div>
        </div>
      </div>

      <div className="panel">
        <h2>Sales Revenue — Last 30 Days</h2>
        {stats.recent30 > 0 ? (
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3fb950', padding: '12px 0' }}>{fmt(stats.recent30)}</div>
        ) : (
          <div className="empty-state">No sales recorded in the last 30 days.</div>
        )}
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Recent Sales</h2>
        </div>
        {recentSales.length === 0 ? (
          <div className="empty-state">No cards sold yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #30363d' }}>
                <th style={{ padding: '8px 0', fontSize: 12, color: '#8b949e' }}>Card</th>
                <th style={{ padding: '8px 0', fontSize: 12, color: '#8b949e' }}>Sold</th>
                <th style={{ padding: '8px 0', fontSize: 12, color: '#8b949e', textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '8px 0', fontSize: 13 }}>{c.name}</td>
                  <td style={{ padding: '8px 0', fontSize: 13, color: '#8b949e' }}>
                    {new Date(c.ebay_sold_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '8px 0', fontSize: 13, color: '#3fb950', textAlign: 'right' }}>
                    {fmt(c.ebay_sold_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
