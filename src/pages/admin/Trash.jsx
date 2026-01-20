import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers, getEmployees } from '../../services/api/users';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
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

const AdminTrash = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [taskToAction, setTaskToAction] = useState(null);
  
  const [filters, setFilters] = useState({
    user: 'all',
    priority: 'all',
    period: 'all',
    search: ''
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
        
        // Carica dipendenti
        const employeesResult = await getEmployees();
        if (employeesResult.success) {
          setEmployees(employeesResult.data);
        }
        
        // Carica task eliminati (mock data)
        loadMockDeletedTasks();
        
      } catch (error) {
        console.error('Error loading trash data:', error);
        setError('Errore nel caricamento del cestino');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtra task
  useEffect(() => {
    if (deletedTasks.length === 0) {
      setFilteredTasks([]);
      return;
    }

    let result = [...deletedTasks];

    // Filtro utente
    if (filters.user !== 'all') {
      result = result.filter(task => task.assignedTo === filters.user);
    }

    // Filtro priorità
    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Filtro periodo
    if (filters.period !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.period) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      result = result.filter(task => {
        if (!task.deletedAt) return false;
        const taskDate = new Date(task.deletedAt);
        return taskDate >= cutoffDate;
      });
    }

    // Filtro ricerca
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.assignedToName && task.assignedToName.toLowerCase().includes(query))
      );
    }

    setFilteredTasks(result);
  }, [deletedTasks, filters]);

  // Carica dati mock
  const loadMockDeletedTasks = () => {
    const mockTasks = [
      {
        id: 'task001',
        title: 'Implementare sistema di login',
        description: 'Sviluppare il sistema di autenticazione con Firebase',
        priority: 'alta',
        status: 'bloccato',
        assignedTo: '1',
        assignedToName: 'Leonardo',
        createdBy: '5',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        deletedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        deletedBy: '5',
        deletedReason: 'Task duplicato'
      },
      {
        id: 'task002',
        title: 'Progettare dashboard admin',
        description: 'Creare wireframe e mockup della dashboard',
        priority: 'media',
        status: 'bloccato',
        assignedTo: '2',
        assignedToName: 'Andrea',
        createdBy: '5',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        deletedBy: '2',
        deletedReason: 'Cambio requisiti'
      },
      {
        id: 'task003',
        title: 'Task obsoleto',
        description: 'Task vecchio da eliminare',
        priority: 'bassa',
        status: 'bloccato',
        assignedTo: '3',
        assignedToName: 'Domenico',
        createdBy: '5',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        deletedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        deletedBy: '5',
        deletedReason: 'Obsoleto'
      },
      {
        id: 'task004',
        title: 'Bug fix modulo report',
        description: 'Risolvere bug nel modulo di generazione report',
        priority: 'alta',
        status: 'bloccato',
        assignedTo: '4',
        assignedToName: 'Stefano',
        createdBy: '5',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        deletedBy: '4',
        deletedReason: 'Risolto in altro modo'
      }
    ];

    setDeletedTasks(mockTasks);
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  const handleRestoreTask = (task) => {
    setTaskToAction(task);
    setShowRestoreModal(true);
  };

  const handleDeletePermanently = (task) => {
    setTaskToAction(task);
    setShowDeleteModal(true);
  };

  const handleBulkRestore = async () => {
    if (selectedTasks.length === 0) return;
    
    // Simulazione
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Ripristino bulk task: ${selectedTasks.join(', ')}`);
    
    setSelectedTasks([]);
    // In un'app reale, qui aggiorneresti lo stato
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    // Simulazione
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Eliminazione bulk task: ${selectedTasks.join(', ')}`);
    
    setSelectedTasks([]);
    // In un'app reale, qui aggiorneresti lo stato
  };

  const handleEmptyTrash = () => {
    setShowEmptyModal(true);
  };

  const confirmEmptyTrash = async () => {
    if (filteredTasks.length === 0) return;
    
    // Simulazione
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Cestino globale svuotato');
    
    setShowEmptyModal(false);
    // In un'app reale, qui aggiorneresti lo stato
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non specificata';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysInTrash = (task) => {
    if (!task.deletedAt) return 0;
    
    const deleted = new Date(task.deletedAt);
    const now = new Date();
    const days = Math.round((now - deleted) / (1000 * 60 * 60 * 24));
    
    return days;
  };

  const getTrashStats = () => {
    const stats = {
      total: deletedTasks.length,
      byUser: {},
      byPriority: {},
      spaceUsed: deletedTasks.length * 2.5, // KB
      averageAge: 0
    };

    // Calcola distribuzioni
    deletedTasks.forEach(task => {
      stats.byUser[task.assignedTo] = (stats.byUser[task.assignedTo] || 0) + 1;
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
    });

    // Calcola età media
    const totalDays = deletedTasks.reduce((sum, task) => {
      return sum + calculateDaysInTrash(task);
    }, 0);

    stats.averageAge = deletedTasks.length > 0 
      ? Math.round(totalDays / deletedTasks.length)
      : 0;

    return stats;
  };

  if (loading && deletedTasks.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <LoadingSpinner size="lg" message="Caricamento cestino globale..." />
      </div>
    );
  }

  if (error && deletedTasks.length === 0) {
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

  const stats = getTrashStats();

  return (
    <div className="admin-trash-container">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 mb-3">Cestino Globale</h1>
        <p className="text-muted">
          Gestisci tutti i task eliminati nel sistema. I task rimangono nel cestino per 30 giorni.
        </p>
      </div>

      {/* Statistiche */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-trash-alt text-danger fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats.total}</h3>
                <p className="text-muted mb-0">Task Eliminati</p>
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
                <p className="text-muted mb-0">Utenti Coinvolti</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-hdd text-info fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats.spaceUsed.toFixed(1)} KB</h3>
                <p className="text-muted mb-0">Spazio Occupato</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-calendar-alt text-success fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">{stats.averageAge}</h3>
                <p className="text-muted mb-0">Giorni medi</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Barra azioni */}
      <Card className="mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <form onSubmit={(e) => e.preventDefault()} className="d-flex">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cerca nei task eliminati..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                  <Button type="button" variant="primary">
                    <i className="fas fa-search"></i>
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="col-md-6">
              <div className="d-flex justify-content-end gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filters.user}
                  onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                >
                  <option value="all">Tutti gli utenti</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="all">Tutte le priorità</option>
                  <option value="alta">Alta priorità</option>
                  <option value="media">Media priorità</option>
                  <option value="bassa">Bassa priorità</option>
                </select>
                
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                >
                  <option value="all">Tutti i periodi</option>
                  <option value="week">Ultima settimana</option>
                  <option value="month">Ultimo mese</option>
                  <option value="quarter">Ultimo trimestre</option>
                </select>
                
                <Button 
                  variant="outline-danger" 
                  onClick={handleEmptyTrash}
                  disabled={filteredTasks.length === 0}
                >
                  <i className="fas fa-broom me-2"></i>
                  Svuota Cestino
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Azioni bulk */}
      {filteredTasks.length > 0 && (
        <Card className="mb-4 bg-light">
          <div className="card-body py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAll"
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={handleSelectAll}
                  />
                  <label className="form-check-label" htmlFor="selectAll">
                    Seleziona tutti ({selectedTasks.length} di {filteredTasks.length})
                  </label>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-success"
                  onClick={handleBulkRestore}
                  disabled={selectedTasks.length === 0}
                >
                  <i className="fas fa-redo me-2"></i>
                  Ripristina Selezionati
                </Button>
                
                <Button 
                  variant="outline-danger"
                  onClick={handleBulkDelete}
                  disabled={selectedTasks.length === 0}
                >
                  <i className="fas fa-trash-alt me-2"></i>
                  Elimina Definitivamente
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabella task eliminati */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? ' eliminati' : ' eliminato'}
            </h3>
            
            {filteredTasks.length > 0 && (
              <div className="text-muted">
                <small>
                  Spazio totale: {stats.spaceUsed.toFixed(1)} KB
                </small>
              </div>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <Card className="text-center py-5">
              <i className="fas fa-trash-alt fa-3x text-muted mb-3"></i>
              <h4>Il cestino globale è vuoto</h4>
              <p className="text-muted">
                {filters.user !== 'all' || filters.period !== 'all' || filters.priority !== 'all' || filters.search
                  ? 'Nessun task trovato con questi filtri'
                  : 'Non ci sono task eliminati nel sistema'
                }
              </p>
              {(filters.user !== 'all' || filters.period !== 'all' || filters.priority !== 'all' || filters.search) && (
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setFilters({
                      user: 'all',
                      priority: 'all',
                      period: 'all',
                      search: ''
                    });
                  }}
                >
                  Mostra tutti i task eliminati
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Task</th>
                        <th>Assegnato a</th>
                        <th>Priorità</th>
                        <th>Eliminato il</th>
                        <th>Giorni nel cestino</th>
                        <th className="text-end">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map(task => {
                        const daysInTrash = calculateDaysInTrash(task);
                        const daysUntilPermanent = 30 - daysInTrash;
                        const isSelected = selectedTasks.includes(task.id);
                        
                        return (
                          <tr key={task.id} className={isSelected ? 'table-primary' : ''}>
                            <td>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectTask(task.id)}
                              />
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{task.title}</div>
                                <small className="text-muted">
                                  {task.description?.substring(0, 60)}
                                  {task.description?.length > 60 ? '...' : ''}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-small me-2">
                                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                                       style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                                    {task.assignedToName?.charAt(0) || '?'}
                                  </div>
                                </div>
                                {task.assignedToName}
                              </div>
                            </td>
                            <td>
                              <Badge 
                                style={{ 
                                  backgroundColor: getPriorityColor(task.priority),
                                  color: 'white'
                                }}
                              >
                                {getPriorityName(task.priority)}
                              </Badge>
                            </td>
                            <td>
                              <div>{formatDate(task.deletedAt)}</div>
                              {task.deletedReason && (
                                <small className="text-muted d-block">
                                  Motivo: {task.deletedReason}
                                </small>
                              )}
                            </td>
                            <td>
                              <div className={`fw-bold ${daysUntilPermanent <= 7 ? 'text-danger' : daysUntilPermanent <= 14 ? 'text-warning' : 'text-success'}`}>
                                {daysInTrash} {daysInTrash === 1 ? 'giorno' : 'giorni'}
                              </div>
                              <small className="text-muted">
                                {daysUntilPermanent > 0 
                                  ? `Eliminazione in ${daysUntilPermanent} giorni`
                                  : 'Da eliminare'
                                }
                              </small>
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline-success"
                                  onClick={() => handleRestoreTask(task)}
                                >
                                  <i className="fas fa-redo"></i>
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="outline-danger"
                                  onClick={() => handleDeletePermanently(task)}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Statistiche dettagliate */}
      {deletedTasks.length > 0 && (
        <div className="row mt-5">
          <div className="col-md-6">
            <Card>
              <div className="card-body">
                <h5 className="card-title mb-4">Distribuzione per Utente</h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Utente</th>
                        <th className="text-end">Task Eliminati</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byUser).map(([userId, count]) => {
                        const user = employees.find(e => e.id === userId) || users.find(u => u.id === userId);
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
                            <td className="text-end">{count}</td>
                            <td className="text-end">
                              <div className="progress" style={{ height: '6px', width: '60px', display: 'inline-block' }}>
                                <div 
                                  className="progress-bar bg-primary" 
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
          
          <div className="col-md-6">
            <Card>
              <div className="card-body">
                <h5 className="card-title mb-4">Distribuzione per Priorità</h5>
                <div className="row g-3">
                  {Object.entries(stats.byPriority).map(([priority, count]) => (
                    <div key={priority} className="col-6">
                      <Card className="border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="mb-2">
                            <div 
                              className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                              style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: getPriorityColor(priority) + '20',
                                border: `2px solid ${getPriorityColor(priority)}`,
                                fontSize: '20px',
                                color: getPriorityColor(priority)
                              }}
                            >
                              {count}
                            </div>
                          </div>
                          <div className="h6 mb-1">{getPriorityName(priority)}</div>
                          <small className="text-muted">
                            {Math.round((count / stats.total) * 100)}%
                          </small>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal Ripristino */}
      <Modal
        show={showRestoreModal}
        onHide={() => setShowRestoreModal(false)}
        title="Ripristina Task"
        size="md"
      >
        {taskToAction && (
          <div className="p-3">
            <div className="alert alert-info mb-4">
              <i className="fas fa-info-circle me-2"></i>
              Il task verrà ripristinato e tornará nella lista dei task attivi.
            </div>
            
            <div className="mb-3">
              <h6 className="mb-2">Dettagli task:</h6>
              <div className="bg-light p-3 rounded">
                <div className="mb-2">
                  <strong>Titolo:</strong> {taskToAction.title}
                </div>
                <div className="mb-2">
                  <strong>Assegnato a:</strong> {taskToAction.assignedToName}
                </div>
                <div className="mb-2">
                  <strong>Priorità:</strong> {getPriorityName(taskToAction.priority)}
                </div>
                <div>
                  <strong>Eliminato il:</strong> {formatDate(taskToAction.deletedAt)}
                </div>
                {taskToAction.deletedReason && (
                  <div className="mt-2">
                    <strong>Motivo eliminazione:</strong> {taskToAction.deletedReason}
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowRestoreModal(false)}
              >
                Annulla
              </Button>
              <Button 
                variant="success" 
                onClick={() => {
                  confirmRestoreTask();
                  setShowRestoreModal(false);
                }}
              >
                <i className="fas fa-redo me-2"></i>
                Conferma Ripristino
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Eliminazione Definitiva */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Eliminazione Definitiva"
        size="md"
      >
        {taskToAction && (
          <div className="p-3">
            <div className="alert alert-danger mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Attenzione:</strong> Questa azione è irreversibile. Il task verrà eliminato definitivamente dal sistema.
            </div>
            
            <div className="mb-4">
              <h6 className="mb-2">Confermi di voler eliminare definitivamente:</h6>
              <Card className="border-danger">
                <div className="card-body">
                  <h6 className="card-title text-danger">{taskToAction.title}</h6>
                  <div className="text-muted">
                    Assegnato a: {taskToAction.assignedToName}
                    <br />
                    Eliminato il: {formatDate(taskToAction.deletedAt)}
                    <br />
                    Nel cestino da: {calculateDaysInTrash(taskToAction)} giorni
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Annulla
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  confirmDeletePermanently();
                  setShowDeleteModal(false);
                }}
              >
                <i className="fas fa-trash-alt me-2"></i>
                Elimina Definitivamente
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Svuota Cestino */}
      <Modal
        show={showEmptyModal}
        onHide={() => setShowEmptyModal(false)}
        title="Svuota Cestino Globale"
        size="md"
      >
        <div className="p-3">
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Attenzione Critica:</strong> Stai per svuotare il cestino globale.
          </div>
          
          <div className="mb-4">
            <h6 className="mb-3">Dettagli operazione:</h6>
            <div className="bg-light p-3 rounded">
              <div className="mb-2">
                <strong>Task da eliminare:</strong> {filteredTasks.length}
              </div>
              <div className="mb-2">
                <strong>Utenti coinvolti:</strong> {Object.keys(stats.byUser).length}
              </div>
              <div className="mb-2">
                <strong>Spazio liberato:</strong> {stats.spaceUsed.toFixed(1)} KB
              </div>
              <div>
                <strong>Azione:</strong> Eliminazione definitiva di tutti i task nel cestino
              </div>
            </div>
          </div>
          
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-circle me-2"></i>
            Questa operazione non può essere annullata. Tutti i task verranno eliminati permanentemente.
          </div>
          
          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="confirmEmptyTrash"
            />
            <label className="form-check-label" htmlFor="confirmEmptyTrash">
              Confermo di voler svuotare il cestino globale e sono consapevole che questa azione è irreversibile.
            </label>
          </div>
          
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowEmptyModal(false)}
            >
              Annulla
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmEmptyTrash}
              disabled={!document.getElementById('confirmEmptyTrash')?.checked}
            >
              <i className="fas fa-broom me-2"></i>
              Svuota Cestino
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTrash;