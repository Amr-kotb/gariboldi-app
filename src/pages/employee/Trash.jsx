import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { 
  TASK_STATUS, 
  TASK_PRIORITY,
  getStatusName, 
  getStatusColor,
  getPriorityName,
  getPriorityColor
} from '../../constants/statuses';

const EmployeeTrash = () => {
  const { user } = useAuth();
  const { tasks, loading, error, loadTasks } = useTasks();
  
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToAction, setTaskToAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    period: 'all', // 'all', 'week', 'month'
    priority: 'all'
  });

  // Carica i task al montaggio
  useEffect(() => {
    loadTasks();
  }, []);

  // Filtra i task eliminati
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setDeletedTasks([]);
      setFilteredTasks([]);
      return;
    }

    // In un'app reale, questi sarebbero task con deleted=true
    // Per ora simuliamo con task cancellati
    const deleted = tasks.filter(task => 
      task.status === TASK_STATUS.BLOCCATO // Usiamo bloccato come esempio
    );
    
    setDeletedTasks(deleted);
    
    // Applica filtri
    let result = [...deleted];
    
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
      }
      
      result = result.filter(task => {
        if (!task.deletedAt) return true;
        const taskDate = new Date(task.deletedAt);
        return taskDate >= cutoffDate;
      });
    }

    // Filtro priorità
    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Applica ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(result);
  }, [tasks, filters, searchQuery]);

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

  const confirmRestoreTask = async () => {
    if (!taskToAction) return;
    
    // Qui implementeresti la logica per ripristinare il task
    console.log(`Ripristino task: ${taskToAction.id}`);
    
    // Simulazione
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShowRestoreModal(false);
    setTaskToAction(null);
    
    // Ricarica i task
    loadTasks();
  };

  const confirmDeletePermanently = async () => {
    if (!taskToAction) return;
    
    // Qui implementeresti la logica per eliminare definitivamente
    console.log(`Eliminazione definitiva task: ${taskToAction.id}`);
    
    // Simulazione
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShowDeleteModal(false);
    setTaskToAction(null);
    
    // Ricarica i task
    loadTasks();
  };

  const handleBulkRestore = async () => {
    if (selectedTasks.length === 0) return;
    
    // Qui implementeresti la logica per ripristinare multipli task
    console.log(`Ripristino bulk task: ${selectedTasks.join(', ')}`);
    
    // Simulazione
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSelectedTasks([]);
    loadTasks();
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    // Qui implementeresti la logica per eliminare definitivamente multipli task
    console.log(`Eliminazione bulk task: ${selectedTasks.join(', ')}`);
    
    // Simulazione
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSelectedTasks([]);
    loadTasks();
  };

  const handleEmptyTrash = async () => {
    if (filteredTasks.length === 0) return;
    
    if (window.confirm(`Sei sicuro di voler svuotare il cestino? Verranno eliminati ${filteredTasks.length} task definitivamente.`)) {
      // Simulazione
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Cestino svuotato');
      loadTasks();
    }
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

  if (loading && tasks.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <LoadingSpinner size="lg" message="Caricamento cestino..." />
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="alert alert-danger">
        <h4>Errore nel caricamento</h4>
        <p>{error}</p>
        <Button variant="primary" onClick={loadTasks}>
          Riprova
        </Button>
      </div>
    );
  }

  const stats = {
    total: deletedTasks.length,
    thisWeek: deletedTasks.filter(task => {
      if (!task.deletedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(task.deletedAt) >= weekAgo;
    }).length,
    byPriority: {
      alta: deletedTasks.filter(task => task.priority === TASK_PRIORITY.ALTA).length,
      media: deletedTasks.filter(task => task.priority === TASK_PRIORITY.MEDIA).length,
      bassa: deletedTasks.filter(task => task.priority === TASK_PRIORITY.BASSA).length
    }
  };

  return (
    <div className="employee-trash-container">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 mb-3">Cestino</h1>
        <p className="text-muted">
          Task eliminati. I task rimangono nel cestino per 30 giorni prima di essere eliminati definitivamente.
        </p>
      </div>

      {/* Statistiche */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-trash text-danger fs-4"></i>
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
                <i className="fas fa-clock text-warning fs-4"></i>
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
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-exclamation-triangle text-info fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">
                  {Math.round((stats.total / (tasks.length + stats.total)) * 100) || 0}%
                </h3>
                <p className="text-muted mb-0">Percentuale Eliminati</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <i className="fas fa-redo text-success fs-4"></i>
              </div>
              <div>
                <h3 className="mb-0">30</h3>
                <p className="text-muted mb-0">Giorni al Permanente</p>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                >
                  <option value="all">Tutti i periodi</option>
                  <option value="week">Ultima settimana</option>
                  <option value="month">Ultimo mese</option>
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

      {/* Lista task eliminati */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? ' eliminati' : ' eliminato'}
              {searchQuery && ` per "${searchQuery}"`}
            </h3>
            
            {filteredTasks.length > 0 && (
              <div className="text-muted">
                <small>
                  Spazio occupato: {(filteredTasks.length * 0.5).toFixed(1)} KB
                </small>
              </div>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <Card className="text-center py-5">
              <i className="fas fa-trash-alt fa-3x text-muted mb-3"></i>
              <h4>Il cestino è vuoto</h4>
              <p className="text-muted">
                {tasks.length === 0 
                  ? 'Non hai ancora task assegnati'
                  : searchQuery || filters.period !== 'all' || filters.priority !== 'all'
                  ? 'Nessun task trovato con questi filtri'
                  : 'Non hai task eliminati al momento'
                }
              </p>
              {searchQuery || filters.period !== 'all' || filters.priority !== 'all' ? (
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ period: 'all', priority: 'all' });
                  }}
                >
                  Mostra tutti i task eliminati
                </Button>
              ) : (
                <Button variant="primary" onClick={() => window.location.href = '/employee/my-tasks'}>
                  Vai ai tuoi task attivi
                </Button>
              )}
            </Card>
          ) : (
            <div className="row g-4">
              {filteredTasks.map(task => {
                const daysInTrash = calculateDaysInTrash(task);
                const daysUntilPermanent = 30 - daysInTrash;
                
                return (
                  <div key={task.id} className="col-lg-4 col-md-6">
                    <Card className={`h-100 ${selectedTasks.includes(task.id) ? 'border-primary border-2' : ''}`}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => handleSelectTask(task.id)}
                            />
                          </div>
                          
                          <div className="text-end">
                            <Badge 
                              className="me-2"
                              style={{ 
                                backgroundColor: getPriorityColor(task.priority),
                                color: 'white'
                              }}
                            >
                              {getPriorityName(task.priority)}
                            </Badge>
                            <Badge variant="danger">
                              <i className="fas fa-trash me-1"></i>
                              Eliminato
                            </Badge>
                          </div>
                        </div>
                        
                        <h5 className="card-title mb-2">{task.title}</h5>
                        
                        <p className="card-text text-muted mb-4">
                          {task.description?.substring(0, 100)}
                          {task.description?.length > 100 ? '...' : ''}
                        </p>
                        
                        <div className="task-meta mb-4">
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <small className="text-muted">
                              <i className="far fa-calendar-plus me-1"></i>
                              Creato: {formatDate(task.createdAt)}
                            </small>
                            
                            {task.deletedAt && (
                              <small className="text-muted">
                                <i className="far fa-calendar-times me-1"></i>
                                Eliminato: {formatDate(task.deletedAt)}
                              </small>
                            )}
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              {daysInTrash > 0 && (
                                <div className={`fw-bold ${daysUntilPermanent <= 7 ? 'text-danger' : 'text-warning'}`}>
                                  <small>
                                    <i className="fas fa-clock me-1"></i>
                                    Nel cestino da {daysInTrash} {daysInTrash === 1 ? 'giorno' : 'giorni'}
                                  </small>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              {daysUntilPermanent > 0 ? (
                                <small className="text-muted">
                                  Eliminazione in {daysUntilPermanent} {daysUntilPermanent === 1 ? 'giorno' : 'giorni'}
                                </small>
                              ) : (
                                <small className="text-danger fw-bold">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Da eliminare
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between">
                          <Button 
                            size="sm" 
                            variant="outline-success"
                            onClick={() => handleRestoreTask(task)}
                          >
                            <i className="fas fa-redo me-1"></i>
                            Ripristina
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleDeletePermanently(task)}
                          >
                            <i className="fas fa-trash-alt me-1"></i>
                            Elimina
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Distribuzione per priorità */}
      {stats.total > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <Card>
              <div className="card-body">
                <h5 className="card-title mb-4">Distribuzione per Priorità</h5>
                <div className="d-flex align-items-center gap-4">
                  {Object.entries(stats.byPriority).map(([priority, count]) => (
                    count > 0 && (
                      <div key={priority} className="text-center">
                        <div className="mb-2">
                          <div 
                            className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                            style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: getPriorityColor(priority) + '20',
                              border: `3px solid ${getPriorityColor(priority)}`,
                              fontSize: '24px',
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
                    )
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
              Il task verrà ripristinato e tornará nella lista dei tuoi task attivi.
            </div>
            
            <div className="mb-3">
              <h6 className="mb-2">Task da ripristinare:</h6>
              <Card className="bg-light">
                <div className="card-body">
                  <h6 className="card-title">{taskToAction.title}</h6>
                  <p className="card-text text-muted">
                    {taskToAction.description?.substring(0, 150)}
                    {taskToAction.description?.length > 150 ? '...' : ''}
                  </p>
                  <div className="d-flex gap-2">
                    <Badge 
                      style={{ 
                        backgroundColor: getPriorityColor(taskToAction.priority)
                      }}
                    >
                      {getPriorityName(taskToAction.priority)}
                    </Badge>
                    {taskToAction.deletedAt && (
                      <Badge variant="secondary">
                        Eliminato il: {formatDate(taskToAction.deletedAt)}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
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
                onClick={confirmRestoreTask}
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
              <strong>Attenzione:</strong> Questa azione è irreversibile. Il task verrà eliminato definitivamente e non sarà più recuperabile.
            </div>
            
            <div className="mb-3">
              <h6 className="mb-2">Task da eliminare definitivamente:</h6>
              <Card className="bg-light">
                <div className="card-body">
                  <h6 className="card-title text-danger">{taskToAction.title}</h6>
                  <p className="card-text text-muted">
                    {taskToAction.description?.substring(0, 150)}
                    {taskToAction.description?.length > 150 ? '...' : ''}
                  </p>
                  <div className="d-flex gap-2">
                    <Badge 
                      style={{ 
                        backgroundColor: getPriorityColor(taskToAction.priority)
                      }}
                    >
                      {getPriorityName(taskToAction.priority)}
                    </Badge>
                    <Badge variant="danger">
                      Da {calculateDaysInTrash(taskToAction)} giorni nel cestino
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="confirmDelete"
              />
              <label className="form-check-label" htmlFor="confirmDelete">
                Confermo di voler eliminare definitivamente questo task
              </label>
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
                onClick={confirmDeletePermanently}
                disabled={!document.getElementById('confirmDelete')?.checked}
              >
                <i className="fas fa-trash-alt me-2"></i>
                Elimina Definitivamente
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeTrash;