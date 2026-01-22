import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { useTasks, useStats } from '../../hooks/useTasks.jsx';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Usa gli hook per dati REALI
  const { tasks, loading: tasksLoading, loadUserTasks, updateTask } = useTasks();
  const { loadUserStats } = useStats();
  
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('tutti');

  console.log('👤 [EmployeeDashboard] Componente montato');
  console.log('👤 [EmployeeDashboard] Utente:', user);

  // Carica i task dell'utente corrente
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      
      try {
        console.log('📊 [EmployeeDashboard] Caricamento dati utente:', user.uid);
        await Promise.all([
          loadUserTasks(user.uid),
          loadUserStats(user.uid).then(stats => setUserStats(stats))
        ]);
      } catch (error) {
        console.error('❌ [EmployeeDashboard] Errore caricamento dati:', error);
      } finally {
        setLoading(false);
        console.log('✅ [EmployeeDashboard] Dati caricati');
      }
    };
    
    loadUserData();
  }, [user]);

  // Calcola statistiche REALI
  const myStats = {
    totalTasks: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in corso').length,
    completed: tasks.filter(t => t.status === 'completato').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completato') return false;
      const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      return dueDate < new Date();
    }).length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completato').length / tasks.length) * 100) 
      : 0
  };

  // Filtra task per status
  const filteredTasks = tasks.filter(task => {
    if (selectedStatus === 'tutti') return true;
    return task.status === selectedStatus;
  });

  // Task recenti (ultimi 3)
  const recentTasks = filteredTasks.slice(0, 3);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      console.log(`✅ Status task ${taskId} aggiornato a ${newStatus}`);
    } catch (error) {
      console.error('❌ Errore aggiornamento status:', error);
      alert('Errore nell\'aggiornamento del task');
    }
  };

  const handleProgressChange = async (taskId, progress) => {
    try {
      await updateTask(taskId, { progress });
      console.log(`✅ Progresso task ${taskId} aggiornato a ${progress}%`);
    } catch (error) {
      console.error('❌ Errore aggiornamento progresso:', error);
    }
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

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    try {
      const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
      const today = new Date();
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  if (loading || tasksLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
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
            👤 Dashboard Personale
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            {user?.name || 'Dipendente'} • {user?.department || 'Dipartimento'} • {user?.email}
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
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            👤 Profilo
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            🚪 Esci
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          borderLeft: '4px solid #3b82f6'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '10px', fontSize: '22px' }}>
            👋 Benvenuto, {user?.name?.split(' ')[0] || 'Collega'}!
          </h2>
          <p style={{ color: '#6b7280' }}>
            Hai <strong>{myStats.totalTasks} task</strong> assegnati, di cui <strong>{myStats.completed} completati</strong>.
            {myStats.overdue > 0 && (
              <span style={{ color: '#ef4444', fontWeight: '500' }}>
                {' '}⚠️ {myStats.overdue} in ritardo
              </span>
            )}
          </p>
        </div>

        {/* My Stats REALI */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '20px' }}>
            📊 Le Tue Statistiche
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {[
              { title: 'Task Totali', value: myStats.totalTasks, color: '#3b82f6', icon: '📋', desc: 'Task assegnati a te' },
              { title: 'In Corso', value: myStats.inProgress, color: '#f59e0b', icon: '🔄', desc: 'In lavorazione' },
              { title: 'Completati', value: myStats.completed, color: '#10b981', icon: '✅', desc: 'Task completati' },
              { title: 'In Ritardo', value: myStats.overdue, color: myStats.overdue > 0 ? '#ef4444' : '#6b7280', icon: '⚠️', desc: 'Da completare' },
              { title: 'Rendimento', value: `${myStats.completionRate}%`, color: '#8b5cf6', icon: '📈', desc: 'Percentuale completati' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                  border: `2px solid ${stat.color}20`,
                  transition: 'transform 0.2s',
                  cursor: stat.value > 0 && index !== 4 ? 'pointer' : 'default',
                  ':hover': {
                    transform: stat.value > 0 && index !== 4 ? 'translateY(-5px)' : 'none',
                    backgroundColor: stat.value > 0 && index !== 4 ? '#f3f4f6' : '#f9fafb'
                  }
                }}
                onClick={() => {
                  if (stat.value > 0 && index !== 4) {
                    const statusMap = ['tutti', 'in corso', 'completato', 'overdue'];
                    setSelectedStatus(statusMap[index]);
                  }
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px', color: stat.color }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: stat.color, marginBottom: '5px' }}>
                  {stat.value}
                </div>
                <div style={{ color: '#374151', fontWeight: '500', marginBottom: '5px' }}>
                  {stat.title}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtri Status */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedStatus('tutti')}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedStatus === 'tutti' ? '#3b82f6' : '#e5e7eb',
                color: selectedStatus === 'tutti' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedStatus === 'tutti' ? '600' : '400'
              }}
            >
              Tutti ({myStats.totalTasks})
            </button>
            <button
              onClick={() => setSelectedStatus('assegnato')}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedStatus === 'assegnato' ? '#3b82f6' : '#e5e7eb',
                color: selectedStatus === 'assegnato' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedStatus === 'assegnato' ? '600' : '400'
              }}
            >
              Assegnati ({tasks.filter(t => t.status === 'assegnato').length})
            </button>
            <button
              onClick={() => setSelectedStatus('in corso')}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedStatus === 'in corso' ? '#f59e0b' : '#e5e7eb',
                color: selectedStatus === 'in corso' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedStatus === 'in corso' ? '600' : '400'
              }}
            >
              In Corso ({myStats.inProgress})
            </button>
            <button
              onClick={() => setSelectedStatus('completato')}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedStatus === 'completato' ? '#10b981' : '#e5e7eb',
                color: selectedStatus === 'completato' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedStatus === 'completato' ? '600' : '400'
              }}
            >
              Completati ({myStats.completed})
            </button>
            {myStats.overdue > 0 && (
              <button
                onClick={() => setSelectedStatus('overdue')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedStatus === 'overdue' ? '#ef4444' : '#e5e7eb',
                  color: selectedStatus === 'overdue' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedStatus === 'overdue' ? '600' : '400'
                }}
              >
                In Ritardo ({myStats.overdue})
              </button>
            )}
          </div>
        </div>

        {/* Task Recenti REALI */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1f2937', fontSize: '20px' }}>
              📋 {selectedStatus === 'tutti' ? 'I Tuoi Task' : `Task ${selectedStatus.toUpperCase()}`}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate('/employee/tasks')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                📋 Vedi tutti ({filteredTasks.length})
              </button>
            </div>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                {selectedStatus === 'completato' 
                  ? 'Nessun task completato ancora!' 
                  : selectedStatus === 'overdue'
                  ? 'Nessun task in ritardo! Ottimo lavoro!'
                  : 'Nessun task trovato!'}
              </p>
              <p style={{ color: '#9ca3af' }}>
                {selectedStatus !== 'tutti' && 'Prova a cambiare filtro o aspetta nuovi task assegnati.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentTasks.map((task, index) => {
                const daysRemaining = getDaysRemaining(task.dueDate);
                const isOverdue = daysRemaining !== null && daysRemaining < 0 && task.status !== 'completato';
                const priorityColor = getPriorityColor(task.priority);
                
                return (
                  <div
                    key={task.id || index}
                    style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      borderLeft: `4px solid ${priorityColor}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      ':hover': {
                        backgroundColor: '#f3f4f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                          {task.title}
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          backgroundColor: `${priorityColor}15`,
                          color: priorityColor,
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {task.priority?.toUpperCase() || 'MEDIA'}
                        </div>
                        {isOverdue && (
                          <div style={{
                            padding: '4px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            ⚠️ IN RITARDO
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        {task.dueDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6b7280', fontSize: '14px' }}>
                            <span>📅</span>
                            <span style={{ color: isOverdue ? '#dc2626' : '#6b7280' }}>
                              Scade: {formatDate(task.dueDate)}
                              {daysRemaining !== null && (
                                <span style={{ 
                                  marginLeft: '10px',
                                  padding: '2px 8px',
                                  backgroundColor: isOverdue ? '#fee2e2' : '#dbeafe',
                                  color: isOverdue ? '#dc2626' : '#1d4ed8',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  {isOverdue ? `In ritardo di ${Math.abs(daysRemaining)} giorni` : 
                                   daysRemaining === 0 ? 'Scade oggi!' : 
                                   `Tra ${daysRemaining} giorni`}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        
                        <div style={{ flex: 1, maxWidth: '200px', minWidth: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Progresso</span>
                            <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '500' }}>
                              {task.progress || 0}%
                            </span>
                          </div>
                          <div style={{
                            height: '6px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${task.progress || 0}%`,
                                backgroundColor: task.progress === 100 ? '#10b981' : '#3b82f6',
                                borderRadius: '3px'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px', gap: '5px' }}>
                            {[0, 25, 50, 75, 100].map(value => (
                              <button
                                key={value}
                                onClick={() => handleProgressChange(task.id, value)}
                                style={{
                                  padding: '2px 8px',
                                  backgroundColor: value === task.progress ? '#3b82f6' : '#f3f4f6',
                                  color: value === task.progress ? 'white' : '#6b7280',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px'
                                }}
                              >
                                {value}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '20px' }}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: task.status === 'completato' ? '#10b981' : 
                                         task.status === 'in corso' ? '#f59e0b' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        <option value="assegnato" style={{ backgroundColor: '#3b82f6' }}>Assegnato</option>
                        <option value="in corso" style={{ backgroundColor: '#f59e0b' }}>In Corso</option>
                        <option value="completato" style={{ backgroundColor: '#10b981' }}>Completato</option>
                      </select>
                      
                      <button
                        onClick={() => navigate(`/employee/tasks/${task.id}`)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        👁️ Dettagli
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions & Performance */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '18px' }}>
              ⚡ Azioni Rapide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate('/employee/tasks')}
                style={{
                  padding: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#2563eb'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>📋</span>
                <div>
                  <div style={{ fontWeight: '500' }}>I miei task</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Gestisci tutti i task assegnati</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/employee/reports')}
                style={{
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#059669'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>📊</span>
                <div>
                  <div style={{ fontWeight: '500' }}>I miei report</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Visualizza performance</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/employee/profile')}
                style={{
                  padding: '12px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#7c3aed'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>👤</span>
                <div>
                  <div style={{ fontWeight: '500' }}>Il mio profilo</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Aggiorna informazioni personali</div>
                </div>
              </button>
            </div>
          </div>

          {/* Performance */}
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '18px' }}>
              🎯 La Tua Performance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>Task completati</span>
                <span style={{ fontWeight: '500', color: '#10b981' }}>
                  {myStats.completionRate}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>Produttività</span>
                <span style={{ fontWeight: '500', color: '#3b82f6' }}>
                  {myStats.totalTasks > 0 ? Math.round((myStats.completed / myStats.totalTasks) * 10) : 0}/10
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>Puntualità</span>
                <span style={{ fontWeight: '500', color: myStats.overdue === 0 ? '#10b981' : '#f59e0b' }}>
                  {myStats.overdue === 0 ? '100%' : `${Math.round(((myStats.totalTasks - myStats.overdue) / myStats.totalTasks) * 100)}%`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>Attività recente</span>
                <span style={{ fontWeight: '500', color: '#8b5cf6' }}>
                  {tasks.length > 0 ? formatDate(tasks[0].updatedAt || tasks[0].createdAt) : 'Nessuna'}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                  Punteggio complessivo
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: myStats.completionRate >= 80 ? '#10b981' : 
                         myStats.completionRate >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  {myStats.completionRate >= 80 ? 'Eccellente' : 
                   myStats.completionRate >= 50 ? 'Buono' : 'Da migliorare'}
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

export default EmployeeDashboard;