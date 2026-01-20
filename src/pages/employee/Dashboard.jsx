import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Dati esempio
  const [myStats, setMyStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Simula caricamento dati
    setTimeout(() => {
      setMyStats({
        totalTasks: 8,
        inProgress: 3,
        completed: 4,
        overdue: 1
      });
      
      setRecentTasks([
        { id: 1, title: 'Report Settimanale', dueDate: '25/01', priority: 'media', progress: 75 },
        { id: 2, title: 'Presentazione Clienti', dueDate: '20/01', priority: 'alta', progress: 30 },
        { id: 3, title: 'Aggiornamento Documenti', dueDate: '30/01', priority: 'bassa', progress: 100 }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#ff4d4f';
      case 'media': return '#fa8c16';
      case 'bassa': return '#52c41a';
      default: return '#8c8c8c';
    }
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
            Dashboard Personale
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            {user?.name || 'Dipendente'} • {user?.department || 'Dipartimento'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/employee/profile')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#1890ff',
              border: '1px solid #1890ff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            👤 Profilo
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
        {/* My Stats */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#1f1f1f', marginBottom: '20px', fontSize: '20px' }}>
            Le Tue Statistiche
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {[
              { title: 'Task Totali', value: myStats.totalTasks, color: '#1890ff', icon: '📋' },
              { title: 'In Corso', value: myStats.inProgress, color: '#fa8c16', icon: '🔄' },
              { title: 'Completati', value: myStats.completed, color: '#52c41a', icon: '✅' },
              { title: 'In Ritardo', value: myStats.overdue, color: '#ff4d4f', icon: '⚠️' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  border: `2px solid ${stat.color}20`
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>
                  {stat.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1f1f1f', fontSize: '20px' }}>
              Task Recenti
            </h2>
            <button
              onClick={() => navigate('/employee/tasks')}
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
              Vedi tutti i task
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {recentTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => navigate(`/employee/tasks/${task.id}`)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '600', color: '#1f1f1f', fontSize: '16px' }}>
                      {task.title}
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      backgroundColor: `${getPriorityColor(task.priority)}15`,
                      color: getPriorityColor(task.priority),
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {task.priority.toUpperCase()}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
                      <span>📅</span>
                      <span>Scade: {task.dueDate}</span>
                    </div>
                    
                    <div style={{ flex: 1, maxWidth: '200px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: '#666', fontSize: '12px' }}>Progresso</span>
                        <span style={{ color: '#1890ff', fontSize: '12px', fontWeight: '500' }}>
                          {task.progress}%
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${task.progress}%`,
                            backgroundColor: task.progress === 100 ? '#52c41a' : '#1890ff',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Marca come completato
                    console.log('Task completato:', task.id);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: task.progress === 100 ? '#52c41a' : '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginLeft: '20px'
                  }}
                >
                  {task.progress === 100 ? '✅ Fatto' : 'Segna progresso'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1f1f1f', marginBottom: '15px', fontSize: '18px' }}>
              Azioni Rapide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate('/employee/tasks')}
                style={{
                  padding: '12px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>📋</span> I miei task
              </button>
              <button
                onClick={() => navigate('/employee/reports')}
                style={{
                  padding: '12px',
                  backgroundColor: '#52c41a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>📊</span> I miei report
              </button>
              <button
                onClick={() => navigate('/employee/messages')}
                style={{
                  padding: '12px',
                  backgroundColor: '#722ed1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>💬</span> Messaggi
              </button>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1f1f1f', marginBottom: '15px', fontSize: '18px' }}>
              Stato Sistema
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666' }}>Task completati</span>
                <span style={{ fontWeight: '500', color: '#52c41a' }}>
                  {Math.round((myStats.completed / myStats.totalTasks) * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666' }}>Tempo medio task</span>
                <span style={{ fontWeight: '500', color: '#1890ff' }}>2.3 giorni</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666' }}>Valutazione</span>
                <span style={{ fontWeight: '500', color: '#fa8c16' }}>8.5/10</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666' }}>Attivo da</span>
                <span style={{ fontWeight: '500', color: '#722ed1' }}>45 giorni</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;