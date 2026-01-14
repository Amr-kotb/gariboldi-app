import React from 'react';

const EmployeeDashboard = () => {
  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h1>La Mia Dashboard</h1>
        <p>Panoramica delle tue attività</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">5</div><div className="stat-label">Task Assegnati</div></div>
        <div className="stat-card"><div className="stat-value">3</div><div className="stat-label">In Corso</div></div>
        <div className="stat-card"><div className="stat-value">8</div><div className="stat-label">Completati</div></div>
        <div className="stat-card"><div className="stat-value">1</div><div className="stat-label">In Ritardo</div></div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;