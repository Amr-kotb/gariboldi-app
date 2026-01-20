import React, { useState, useEffect } from 'react';
import { useTasks, useUsers } from '../../hooks/useTasks.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';

const AdminTasks = () => {
  const { tasks, loading, error, loadAllTasks, deleteTask, updateTask } = useTasks();
  const { users, loadEmployees } = useUsers();
  const { user: currentUser } = useAuth();
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  console.log('📋 [AdminTasks] Pagina caricata');

  // Carica task e utenti al mount
  useEffect(() => {
    loadAllTasks(filters);
    loadEmployees();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo task?')) {
      await deleteTask(taskId);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  // Formatta data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString('it-IT');
  };

  // Ottieni nome utente da ID
  const getUserName = (userId) => {
    if (!userId) return 'Non assegnato';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Utente sconosciuto';
  };

  // Colori per status
  const statusColors = {
    assegnato: 'bg-blue-100 text-blue-800',
    'in corso': 'bg-yellow-100 text-yellow-800',
    completato: 'bg-green-100 text-green-800'
  };

  // Colori per priorità
  const priorityColors = {
    alta: 'bg-red-100 text-red-800',
    media: 'bg-orange-100 text-orange-800',
    bassa: 'bg-green-100 text-green-800'
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestione Task</h1>
          <p className="text-gray-600">Gestisci tutti i task del team</p>
        </div>
        <Link
          to="/admin/assign-task"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuovo Task
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtri */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti gli stati</option>
            <option value="assegnato">Assegnato</option>
            <option value="in corso">In corso</option>
            <option value="completato">Completato</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutte le priorità</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="bassa">Bassa</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assegnato a</label>
          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti gli utenti</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ status: '', priority: '', assignedTo: '' })}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset Filtri
          </button>
        </div>
      </div>

      {/* Tabella Task */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Nessun task trovato</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assegnato a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scadenza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description?.substring(0, 60)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getUserName(task.assignedTo)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-sm px-3 py-1 rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        <option value="assegnato">Assegnato</option>
                        <option value="in corso">In corso</option>
                        <option value="completato">Completato</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {task.dueDate ? formatDate(task.dueDate) : 'Nessuna scadenza'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* Modifica */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiche */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">Task Totali</h3>
          <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">Completati</h3>
          <p className="text-3xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'completato').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800">In Corso</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {tasks.filter(t => t.status === 'in corso').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTasks;