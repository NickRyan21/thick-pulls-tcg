import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your cards and eBay sales activity.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <label>Listed on eBay</label>
          <div className="value">0</div>
          <div className="sub">Active listings</div>
        </div>
        <div className="stat-card">
          <label>Cards Sold</label>
          <div className="value">0</div>
          <div className="sub">All time</div>
        </div>
        <div className="stat-card">
          <label>Total Revenue</label>
          <div className="value green">$0.00</div>
          <div className="sub">From sold cards</div>
        </div>
        <div className="stat-card">
          <label>Avg Sale Price</label>
          <div className="value blue">$0.00</div>
          <div className="sub">No sales yet</div>
        </div>
      </div>

      <div className="panel">
        <h2>Sales Revenue — Last 30 Days</h2>
        <div className="empty-state">No sales recorded in the last 30 days.</div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Recent Sales</h2>
          <button className="btn btn-secondary" style={{ fontSize: 12 }}>View All</button>
        </div>
        <div className="empty-state">No cards sold yet.</div>
      </div>
    </div>
  );
}
