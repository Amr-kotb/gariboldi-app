import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard" style={{ padding: '20px' }}>
      <h1>Dashboard Amministratore</h1>
      <p>Benvenuto nell'area di amministrazione del Task Manager!</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={() => navigate(ROUTES.ADMIN.TASKS)}
          className="btn btn-primary"
        >
          Gestione Task
        </button>
        
        <button 
          onClick={() => navigate(ROUTES.ADMIN.USERS)}
          className="btn btn-secondary"
        >
          Gestione Utenti
        </button>
        
        <button 
          onClick={() => navigate(ROUTES.ADMIN.STATISTICS)}
          className="btn btn-info"
        >
          Statistiche
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="btn btn-outline"
        >
          Home
        </button>
      </div>
      
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
          <h3>Task</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>12</p>
          <p style={{ fontSize: '12px' }}>Attivi</p>
        </div>
        
        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px' }}>
          <h3>Utenti</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>5</p>
          <p style={{ fontSize: '12px' }}>Registrati</p>
        </div>
        
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
          <h3>Completati</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>8</p>
          <p style={{ fontSize: '12px' }}>Task</p>
        </div>
        
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
          <h3>In Ritardo</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>3</p>
          <p style={{ fontSize: '12px' }}>Da completare</p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Azioni Rapide</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className="btn btn-sm" onClick={() => navigate(ROUTES.ADMIN.ASSIGN_TASK)}>
            Nuovo Task
          </button>
          <button className="btn btn-sm" onClick={() => navigate(ROUTES.ADMIN.USERS)}>
            Aggiungi Utente
          </button>
          <button className="btn btn-sm" onClick={() => navigate(ROUTES.ADMIN.STATISTICS)}>
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;