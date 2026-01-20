import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers } from '../../services/api/users';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import { 
  TASK_STATUS, 
  TASK_PRIORITY,
  getStatusName, 
  getStatusColor,
  getPriorityName,
  getPriorityColor
} from '../../constants/statuses';
import { getRoleName } from '../../constants/roles';

const AdminHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  
  const [filters, setFilters] = useState({
    user: 'all',
    action: 'all',
    period: 'week',
    search: ''
  });
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date()
  });

  // Carica dati iniziali
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carica utenti
        const usersResult = await getAllUsers();
        if (usersResult.success) {
          setUsers(usersResult.data);
        }
        
        // Carica attività (in un'app reale, questo sarebbe da Firebase)
        loadMockActivities();
        
      } catch (error) {
        console.error('Error loading history data:', error);
        setError('Errore nel caricamento dello storico');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtra attività
  useEffect(() => {
    if (activities.length === 0) {
      setFilteredActivities([]);
      return;
    }

    let result = [...activities];

    // Filtro utente
    if (filters.user !== 'all') {
      result = result.filter(activity => activity.userId === filters.user);
    }

    // Filtro azione
    if (filters.action !== 'all') {
      result = result.filter(activity => activity.action === filters.action);
    }

    // Filtro data
    result = result.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= dateRange.start && activityDate <= dateRange.end;
    });

    // Filtro ricerca
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(activity => 
        activity.description.toLowerCase().includes(query) ||
        activity.userName.toLowerCase().includes(query) ||
        (activity.taskTitle && activity.taskTitle.toLowerCase().includes(query))
      );
    }

    // Ordina per data (più recenti prima)
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredActivities(result);
  }, [activities, filters, dateRange]);

  // Carica dati mock per attività
  const loadMockActivities = () => {
    const mockUsers = [
      { id: '1', name: 'Leonardo', role: 'dipendente' },
      { id: '2', name: 'Andrea', role: 'dipendente' },
      { id: '3', name: 'Domenico', role: 'dipendente' },
      { id: '4', name: 'Stefano', role: 'dipendente' },
      { id: '5', name: user?.name || 'Admin', role: 'admin' }
    ];

    const mockActions = [
      {
        id: '1',
        action: 'task_created',
        description: 'Ha creato un nuovo task',
        userId: '5',
        userName: 'Admin',
        taskId: 'task001',
        taskTitle: 'Implementare sistema di login',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        details: { priority: 'alta', assignedTo: 'Leonardo' }
      },
      {
        id: '2',
        action: 'task_assigned',
        description: 'Ha assegnato un task a Leonardo',
        userId: '5',
        userName: 'Admin',
        taskId: 'task001',
        taskTitle: 'Implementare sistema di login',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        details: { from: null, to: 'Leonardo' }
      },
      {
        id: '3',
        action: 'task_status_changed',
        description: 'Ha cambiato lo stato del task',
        userId: '1',
        userName: 'Leonardo',
        taskId: 'task001',
        taskTitle: 'Implementare sistema di login',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        details: { from: 'assegnato', to: 'in corso' }
      },
      {
        id: '4',
        action: 'task_completed',
        description: 'Ha completato il task',
        userId: '1',
        userName: 'Leonardo',
        taskId: 'task001',
        taskTitle: 'Implementare sistema di login',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        details: { timeSpent: '3 giorni' }
      },
      {
        id: '5',
        action: 'task_created',
        description: 'Ha creato un nuovo task',
        userId: '5',
        userName: 'Admin',
        taskId: 'task002',
        taskTitle: 'Progettare dashboard admin',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        details: { priority: 'media', assignedTo: 'Andrea' }
      },
      {
        id: '6',
        action: 'comment_added',
        description: 'Ha aggiunto un commento',
        userId: '2',
        userName: 'Andrea',
        taskId: 'task002',
        taskTitle: 'Progettare dashboard admin',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        details: { comment: 'Ho bisogno di chiarimenti sui requisiti' }
      },
      {
        id: '7',
        action: 'task_deleted',
        description: 'Ha eliminato un task',
        userId: '5',
        userName: 'Admin',
        taskId: 'task003',
        taskTitle: 'Task obsoleto',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        details: { reason: 'Obsoleto' }
      }
    ];

    setActivities(mockActions);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDateChange = (dateType, value) => {
    setDateRange(prev => ({
      ...prev,
      [dateType]: new Date(value)
    }));
  };

  const handleExportHistory = () => {
    const csvData = filteredActivities.map(activity => ({
      'Data/Ora': formatDateTime(activity.timestamp),
      'Utente': activity.userName,
      'Azione': getActionLabel(activity.action),
      'Descrizione': activity.description,
      'Task': activity.taskTitle || 'N/D',
      'Dettagli': JSON.stringify(activity.details || {})
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storico_admin_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getActionLabel = (action) => {
    const labels = {
      'task_created': 'Creazione Task',
      'task_assigned': 'Assegnazione Task',
      'task_status_changed': 'Cambio Stato',
      'task_completed': 'Completamento Task',
      'task_deleted': 'Eliminazione Task',
      'comment_added': 'Commento Aggiunto',
      'user_created': 'Creazione Utente',
      'user_updated': 'Modifica Utente'
    };
    
    return labels[action] || action;
  };

  const getActionIcon = (action) => {
    const icons = {
      'task_created': 'fa-plus-circle',
      'task_assigned': 'fa-user-check',
      'task_status_changed': 'fa-sync-alt',
      'task_completed': 'fa-check-circle',
      'task_deleted': 'fa-trash',
      'comment_added': 'fa-comment',
      'user_created': 'fa-user-plus',
      'user_updated': 'fa-user-edit'
    };
    
    return icons[action] || 'fa-history';
  };

  const getActionColor = (action) => {
    const colors = {
      'task_created': 'primary',
      'task_assigned': 'info',
      'task_status_changed': 'warning',
      'task_completed': 'success',
      'task_deleted': 'danger',
      'comment_added': 'secondary',
      'user_created': 'primary',
      'user_updated': 'info'
    };
    
    return colors[action] || 'secondary';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/D';
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getActivityStats = () => {
    const stats = {
      total: filteredActivities.length,
      byAction: {},
      byUser: {},
      today: filteredActivities.filter(act => {
        const today = new Date();
        const actDate = new Date(act.timestamp);
        return actDate.toDateString() === today.toDateString();
      }).length,
      thisWeek: filteredActivities.filter(act => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(act.timestamp) >= weekAgo;
      }).length
    };

    // Calcola distribuzione per azione
    filteredActivities.forEach(act => {
      stats.byAction[act.action] = (stats.byAction[act.action] || 0) + 1;
      stats.byUser[act.userId] = (stats.byUser[act.userId] || 0) + 1;
    });

    return stats;
  };

  if (loading && activities.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <LoadingSpinner size="lg" message="Caricamento storico..." />
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="alert alert-danger">
        <h4>Errore nel caricamento</h4>
        <p>{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Riprova
        </Button>
      </div>
    );
  }

  const stats = getActivityStats();

  return (
    <div className="admin-history-container">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 mb-3">Storico Globale</h1>
        <p className="text-muted">
          Monitora tutte le attività del sistema. Traccia modifiche, assegnazioni e completamenti.
        </p>
      </div>

      {/* Statistiche */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-history text-primary fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats.total}</h3>
                <p className="text-muted mb-0">Attività Totali</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-calendar-day text-success fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats.today}</h3>
                <p className="text-muted mb-0">Oggi</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-calendar-week text-info fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats.thisWeek}</h3>
                <p className="text-muted mb-0">Questa Settimana</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-users text-warning fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">{Object.keys(stats.byUser).length}</h3>
                <p className="text-muted mb-0">Utenti Attivi</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filtri */}
      <Card className="mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Utente</label>
                <Select
                  value={filters.user}
                  onChange={(e) => handleFilterChange('user', e.target.value)}
                  options={[
                    { value: 'all', label: 'Tutti gli utenti' },
                    ...users.map(u => ({ value: u.id, label: u.name }))
                  ]}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Azione</label>
                <Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  options={[
                    { value: 'all', label: 'Tutte le azioni' },
                    { value: 'task_created', label: 'Creazione Task' },
                    { value: 'task_assigned', label: 'Assegnazione' },
                    { value: 'task_status_changed', label: 'Cambio Stato' },
                    { value: 'task_completed', label: 'Completamento' },
                    { value: 'task_deleted', label: 'Eliminazione' },
                    { value: 'comment_added', label: 'Commenti' }
                  ]}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Da</label>
                <Input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">A</label>
                <div className="d-flex gap-2">
                  <Input
                    type="date"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Ricerca</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cerca per descrizione, utente o task..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <Button variant="primary">
                    <i className="fas fa-search"></i>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="d-flex justify-content-end gap-2 align-items-end">
                <Button 
                  variant="outline-secondary"
                  onClick={() => {
                    setFilters({
                      user: 'all',
                      action: 'all',
                      period: 'week',
                      search: ''
                    });
                    setDateRange({
                      start: new Date(new Date().setDate(new Date().getDate() - 7)),
                      end: new Date()
                    });
                  }}
                >
                  <i className="fas fa-filter-circle-xmark me-2"></i>
                  Reset Filtri
                </Button>
                
                <Button 
                  variant="outline-primary" 
                  onClick={handleExportHistory}
                  disabled={filteredActivities.length === 0}
                >
                  <i className="fas fa-download me-2"></i>
                  Esporta CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline attività */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0">
              {filteredActivities.length} attività{filteredActivities.length !== 1 ? ' trovate' : ' trovata'}
              {filters.user !== 'all' && ` per ${users.find(u => u.id === filters.user)?.name}`}
            </h3>
            
            {filteredActivities.length > 0 && (
              <div className="text-muted">
                <small>
                  Periodo: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                </small>
              </div>
            )}
          </div>

          {filteredActivities.length === 0 ? (
            <Card className="text-center py-5">
              <i className="fas fa-history fa-3x text-muted mb-3"></i>
              <h4>Nessuna attività trovata</h4>
              <p className="text-muted">
                {filters.user !== 'all' || filters.action !== 'all' || filters.search
                  ? 'Nessuna attività corrisponde ai filtri selezionati'
                  : 'Non ci sono attività registrate nel periodo selezionato'
                }
              </p>
              {(filters.user !== 'all' || filters.action !== 'all' || filters.search) && (
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setFilters({
                      user: 'all',
                      action: 'all',
                      period: 'week',
                      search: ''
                    });
                  }}
                >
                  Mostra tutte le attività
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <div className="card-body p-0">
                <div className="timeline">
                  {filteredActivities.map((activity, index) => {
                    const user = users.find(u => u.id === activity.userId);
                    const actionColor = getActionColor(activity.action);
                    const actionIcon = getActionIcon(activity.action);
                    
                    return (
                      <div key={activity.id} className="timeline-item d-flex p-4 border-bottom">
                        <div className="timeline-marker me-3">
                          <div className={`bg-${actionColor} rounded-circle d-flex align-items-center justify-content-center`}
                               style={{ width: '40px', height: '40px' }}>
                            <i className={`fas ${actionIcon} text-white`}></i>
                          </div>
                        </div>
                        
                        <div className="timeline-content flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{activity.description}</h6>
                              <div className="d-flex align-items-center gap-2">
                                <div className="d-flex align-items-center">
                                  <div className="avatar-small me-2">
                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                                         style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                                      {user?.name?.charAt(0) || '?'}
                                    </div>
                                  </div>
                                  <span className="fw-medium">{activity.userName}</span>
                                </div>
                                
                                <Badge variant={actionColor}>
                                  {getActionLabel(activity.action)}
                                </Badge>
                                
                                {activity.taskTitle && (
                                  <Badge variant="outline-secondary">
                                    <i className="fas fa-tasks me-1"></i>
                                    {activity.taskTitle}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-end">
                              <small className="text-muted">
                                {formatDateTime(activity.timestamp)}
                              </small>
                              <br />
                              <small className="text-muted">
                                {activity.taskId && `ID: ${activity.taskId.substring(0, 8)}...`}
                              </small>
                            </div>
                          </div>
                          
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-3">
                              <small className="text-muted d-block mb-1">Dettagli:</small>
                              <div className="bg-light p-2 rounded">
                                <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
                                  {JSON.stringify(activity.details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {index < filteredActivities.length - 1 && (
                            <div className="timeline-connector">
                              <div className="vertical-line"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Statistiche distribuzione */}
      {Object.keys(stats.byAction).length > 0 && (
        <div className="row mt-5">
          <div className="col-md-6">
            <Card>
              <div className="card-body">
                <h5 className="card-title mb-4">Distribuzione per Azione</h5>
                <div className="row g-3">
                  {Object.entries(stats.byAction).map(([action, count]) => (
                    <div key={action} className="col-6">
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                        <div className="d-flex align-items-center">
                          <i className={`fas ${getActionIcon(action)} me-2 text-${getActionColor(action)}`}></i>
                          <span>{getActionLabel(action)}</span>
                        </div>
                        <Badge variant={getActionColor(action)}>
                          {count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          <div className="col-md-6">
            <Card>
              <div className="card-body">
                <h5 className="card-title mb-4">Attività per Utente</h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Utente</th>
                        <th>Ruolo</th>
                        <th className="text-end">Attività</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byUser).map(([userId, count]) => {
                        const user = users.find(u => u.id === userId);
                        if (!user) return null;
                        
                        const percentage = Math.round((count / stats.total) * 100);
                        
                        return (
                          <tr key={userId}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-small me-2">
                                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                                       style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                                    {user.name?.charAt(0) || '?'}
                                  </div>
                                </div>
                                {user.name}
                              </div>
                            </td>
                            <td>
                              <Badge variant={user.role === 'admin' ? 'warning' : 'primary'}>
                                {getRoleName(user.role)}
                              </Badge>
                            </td>
                            <td className="text-end">{count}</td>
                            <td className="text-end">
                              <div className="progress" style={{ height: '6px', width: '60px', display: 'inline-block' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="ms-2">{percentage}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHistory;