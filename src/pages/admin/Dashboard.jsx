import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useTasks, useUsers, useStats } from '../../hooks/useTasks.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Usa gli hook per dati reali
  const { tasks, loading: tasksLoading, loadAllTasks } = useTasks();
  const { users, loading: usersLoading, loadUsers } = useUsers();
  const { stats, loading: statsLoading, loadDashboardStats } = useStats();
  
  const [loading, setLoading] = useState(true);

  console.log('👑 [AdminDashboard] Componente montato');
  console.log('👑 [AdminDashboard] Utente:', user);

  // Carica tutti i dati al mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📊 [AdminDashboard] Caricamento dati...');
        await Promise.all([
          loadAllTasks(),
          loadUsers(),
          loadDashboardStats()
        ]);
      } catch (error) {
        console.error('❌ [AdminDashboard] Errore caricamento dati:', error);
      } finally {
        setLoading(false);
        console.log('✅ [AdminDashboard] Dati caricati');
      }
    };
    
    loadData();
  }, []);

  if (!user || loading || tasksLoading || usersLoading || statsLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1f2937'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #374151',
          borderTop: '4px solid #60a5fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  // Calcola statistiche REALI
  const realStats = {
    totalUsers: users.length,
    activeTasks: tasks.filter(t => t.status === 'in corso' || t.status === 'assegnato').length,
    completedTasks: tasks.filter(t => t.status === 'completato').length,
    overdueTasks: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completato') return false;
      const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      return dueDate < new Date();
    }).length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completato').length / tasks.length) * 100) 
      : 0
  };

  // Task recenti (ultimi 5)
  const recentTasks = tasks.slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'bassa': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/D';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('it-IT');
    } catch {
      return 'N/D';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1f2937',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#111827',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #374151'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, color: '#60a5fa' }}>
            👑 ADMIN DASHBOARD
          </h1>
          <p style={{ color: '#9ca3af', margin: '5px 0 0 0', fontSize: '14px' }}>
            {user.name} • {user.email} • Ruolo: <strong style={{ color: '#10b981' }}>{user.role}</strong>
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Card */}
        <div style={{
          backgroundColor: '#374151',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          borderLeft: '4px solid #3b82f6'
        }}>
          <h2 style={{ color: '#d1d5db', marginBottom: '10px' }}>
            🎉 Benvenuto Amministratore!
          </h2>
          <p style={{ color: '#9ca3af' }}>
            Hai accesso completo a tutte le funzionalità del sistema.
            Gestisci <strong>{users.length} utenti</strong> e <strong>{tasks.length} task</strong>.
          </p>
        </div>

        {/* Stats Grid con DATI REALI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { title: 'Utenti Totali', value: realStats.totalUsers, color: '#3b82f6', icon: '👥' },
            { title: 'Task Attivi', value: realStats.activeTasks, color: '#10b981', icon: '📋' },
            { title: 'Task Completati', value: realStats.completedTasks, color: '#8b5cf6', icon: '✅' },
            { title: 'Task in Ritardo', value: realStats.overdueTasks, color: realStats.overdueTasks > 0 ? '#ef4444' : '#f59e0b', icon: '⚠️' },
            { title: 'Rendimento', value: `${realStats.completionRate}%`, color: '#22c55e', icon: '📊' }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#374151',
                padding: '25px',
                borderRadius: '10px',
                textAlign: 'center',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                ':hover': {
                  transform: 'translateY(-5px)',
                  backgroundColor: '#4b5563'
                }
              }}
              onClick={() => {
                if (index === 3 && realStats.overdueTasks > 0) {
                  navigate('/admin/tasks?filter=overdue');
                }
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                {stat.icon}
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: stat.color,
                marginBottom: '5px'
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#d1d5db', fontSize: '14px' }}>
                {stat.title}
              </div>
            </div>
          ))}
        </div>

        {/* Task Recenti REALI */}
        <div style={{
          backgroundColor: '#374151',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#d1d5db', fontSize: '20px' }}>
              📋 Task Recenti
            </h3>
            <button
              onClick={() => navigate('/admin/tasks')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Vedi tutti ({tasks.length})
            </button>
          </div>
          
          {recentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
              <p>Nessun task creato ancora</p>
              <button
                onClick={() => navigate('/admin/assign-task')}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Crea il primo task
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentTasks.map((task, index) => {
                const isOverdue = task.dueDate && 
                  (task.dueDate?.toDate ? task.dueDate.toDate() : new Date(task.dueDate)) < new Date() && 
                  task.status !== 'completato';
                
                return (
                  <div
                    key={task.id || index}
                    style={{
                      padding: '20px',
                      backgroundColor: '#1f2937',
                      borderRadius: '8px',
                      border: '1px solid #4b5563',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                      ':hover': {
                        backgroundColor: '#2d3748'
                      }
                    }}
                    onClick={() => navigate(`/admin/tasks?view=${task.id}`)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ fontWeight: '600', color: '#f3f4f6', fontSize: '16px' }}>
                          {task.title}
                        </div>
                        {isOverdue && (
                          <span style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            IN RITARDO
                          </span>
                        )}
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: task.status === 'completato' ? '#10b981' : 
                                         task.status === 'in corso' ? '#f59e0b' : '#3b82f6',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {task.status?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#9ca3af', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>👤</span>
                          <span>Assegnato a: {task.assignedToName || 'N/D'}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>📅</span>
                            <span style={{ color: isOverdue ? '#ef4444' : '#9ca3af' }}>
                              Scade: {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                        
                        <div style={{ flex: 1, maxWidth: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '12px' }}>Progresso</span>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#60a5fa' }}>
                              {task.progress || 0}%
                            </span>
                          </div>
                          <div style={{
                            height: '4px',
                            backgroundColor: '#4b5563',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${task.progress || 0}%`,
                                backgroundColor: task.progress === 100 ? '#10b981' : '#60a5fa',
                                borderRadius: '2px'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div style={{
          backgroundColor: '#374151',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#d1d5db', marginBottom: '20px', fontSize: '20px' }}>
            ⚡ Azioni Amministrative
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {[
              { label: 'Gestisci Utenti', action: () => navigate('/admin/users'), color: '#3b82f6', icon: '👥' },
              { label: 'Crea Task', action: () => navigate('/admin/assign-task'), color: '#10b981', icon: '📝' },
              { label: 'Tutti i Task', action: () => navigate('/admin/tasks'), color: '#8b5cf6', icon: '📋' },
              { label: 'Statistiche', action: () => navigate('/admin/stats'), color: '#f59e0b', icon: '📊' },
              { label: 'Report', action: () => navigate('/admin/reports'), color: '#ec4899', icon: '📄' },
              { label: 'Impostazioni', action: () => navigate('/admin/settings'), color: '#6b7280', icon: '⚙️' }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  padding: '15px 25px',
                  backgroundColor: action.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div style={{
          backgroundColor: '#1e40af',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '24px' }}>📊</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#dbeafe', marginBottom: '5px' }}>
                <strong>SISTEMA ATTIVO</strong> • Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ color: '#93c5fd' }}>
                  <span style={{ fontWeight: '500' }}>Utenti:</span> {users.length} registrati
                </div>
                <div style={{ color: '#93c5fd' }}>
                  <span style={{ fontWeight: '500' }}>Task:</span> {tasks.length} totali ({realStats.completedTasks} completati)
                </div>
                <div style={{ color: realStats.overdueTasks > 0 ? '#fca5a5' : '#93c5fd' }}>
                  <span style={{ fontWeight: '500' }}>In ritardo:</span> {realStats.overdueTasks}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stile per animazione spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;