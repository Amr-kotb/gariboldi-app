import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Statistiche esempio
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeEmployees: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    // Simula caricamento dati
    setLoading(true);
    setTimeout(() => {
      setStats({
        totalTasks: 24,
        completedTasks: 18,
        activeEmployees: 8,
        pendingTasks: 6
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Top Bar */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px 30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#1f1f1f', margin: 0 }}>
            Dashboard Amministratore
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            {user?.name || 'Amministratore'} • {user?.email || 'admin@azienda.com'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            👥 Utenti
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚪 Esci
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px' }}>
        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { title: 'Task Totali', value: stats.totalTasks, color: '#1890ff', icon: '📋' },
            { title: 'Completati', value: stats.completedTasks, color: '#52c41a', icon: '✅' },
            { title: 'Dipendenti', value: stats.activeEmployees, color: '#722ed1', icon: '👥' },
            { title: 'In Sospeso', value: stats.pendingTasks, color: '#fa8c16', icon: '⏳' }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: `${item.color}15`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: item.color }}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions Grid */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#1f1f1f', marginBottom: '20px', fontSize: '20px' }}>
            Azioni Amministrative
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {[
              { title: 'Gestisci Task', icon: '📝', path: '/admin/tasks', color: '#1890ff' },
              { title: 'Gestisci Utenti', icon: '👨‍💼', path: '/admin/users', color: '#52c41a' },
              { title: 'Assegna Task', icon: '➕', path: '/admin/assign', color: '#722ed1' },
              { title: 'Statistiche', icon: '📊', path: '/admin/stats', color: '#fa8c16' },
              { title: 'Report', icon: '📈', path: '/admin/reports', color: '#f5222d' },
              { title: 'Impostazioni', icon: '⚙️', path: '/admin/settings', color: '#8c8c8c' }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  border: `2px solid ${action.color}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => {
                  e.target.style.backgroundColor = action.color;
                  e.target.style.color = 'white';
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'inherit';
                }}
              >
                <span style={{ fontSize: '32px' }}>{action.icon}</span>
                <span style={{ fontWeight: '500' }}>{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1f1f1f', fontSize: '20px' }}>
              Attività Recente
            </h2>
            <button
              onClick={() => navigate('/admin/activity')}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                color: '#1890ff',
                border: '1px solid #1890ff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Vedi tutto
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { action: 'Task creato', details: 'Report Mensile Vendite', time: 'Oggi, 10:30', user: 'Admin' },
              { action: 'Task completato', details: 'Aggiornamento Database', time: 'Oggi, 09:15', user: 'Mario R.' },
              { action: 'Utente registrato', details: 'Nuovo dipendente', time: 'Ieri, 16:45', user: 'Sistema' },
              { action: 'Task modificato', details: 'Presentazione Team', time: 'Ieri, 14:20', user: 'Luisa B.' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #f0f0f0'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', color: '#1f1f1f' }}>
                    {item.action}: <span style={{ color: '#666' }}>{item.details}</span>
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '5px' }}>
                    {item.time} • da {item.user}
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  backgroundColor: index === 1 ? '#52c41a15' : '#1890ff15',
                  color: index === 1 ? '#52c41a' : '#1890ff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {index === 1 ? 'Completato' : 'In corso'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;