import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const MyTasks = () => {
  const { tasks, loading, error, loadUserTasks, updateTask } = useTasks();
  const { user } = useAuth();
  
  const [selectedStatus, setSelectedStatus] = useState('tutti');

  console.log('👤 [MyTasks] Pagina task dipendente caricata');

  // Carica task dell'utente al mount
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
    }
  }, [user]);

  // Filtra task per status
  const filteredTasks = tasks.filter(task => {
    if (selectedStatus === 'tutti') return true;
    return task.status === selectedStatus;
  });

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleProgressChange = async (taskId, progress) => {
    await updateTask(taskId, { progress });
  };

  // Formatta data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      return date.toLocaleDateString('it-IT');
    } catch {
      return 'N/D';
    }
  };

  // Calcola giorni rimanenti
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

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">I Miei Task</h1>
        <p className="text-gray-600">Gestisci i task assegnati a te</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtri status */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setSelectedStatus('tutti')}
          className={`px-4 py-2 rounded-lg ${selectedStatus === 'tutti' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Tutti ({tasks.length})
        </button>
        <button
          onClick={() => setSelectedStatus('assegnato')}
          className={`px-4 py-2 rounded-lg ${selectedStatus === 'assegnato' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Assegnati ({tasks.filter(t => t.status === 'assegnato').length})
        </button>
        <button
          onClick={() => setSelectedStatus('in corso')}
          className={`px-4 py-2 rounded-lg ${selectedStatus === 'in corso' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          In Corso ({tasks.filter(t => t.status === 'in corso').length})
        </button>
        <button
          onClick={() => setSelectedStatus('completato')}
          className={`px-4 py-2 rounded-lg ${selectedStatus === 'completato' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Completati ({tasks.filter(t => t.status === 'completato').length})
        </button>
      </div>

      {/* Grid Task */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">Nessun task trovato</p>
            <p className="text-gray-400 mt-2">Non ci sono task {selectedStatus !== 'tutti' ? `con stato "${selectedStatus}"` : 'assegnati a te'}</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const daysRemaining = getDaysRemaining(task.dueDate);
            
            return (
              <div key={task.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
                {/* Header task */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'alta' ? 'bg-red-100 text-red-800' :
                        task.priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      {daysRemaining !== null && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          daysRemaining < 0 ? 'bg-red-100 text-red-800' :
                          daysRemaining < 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {daysRemaining < 0 ? `In ritardo di ${Math.abs(daysRemaining)} giorni` :
                           daysRemaining === 0 ? 'Scade oggi' :
                           `Scade tra ${daysRemaining} giorni`}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="text-sm px-3 py-1 border rounded-lg"
                  >
                    <option value="assegnato">Assegnato</option>
                    <option value="in corso">In corso</option>
                    <option value="completato">Completato</option>
                  </select>
                </div>

                {/* Descrizione */}
                <p className="text-gray-600 mb-4 text-sm">
                  {task.description || 'Nessuna descrizione'}
                </p>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{task.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-center mt-2 space-x-1">
                    {[0, 25, 50, 75, 100].map(value => (
                      <button
                        key={value}
                        onClick={() => handleProgressChange(task.id, value)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                  <div>
                    <span>Creato: {formatDate(task.createdAt)}</span>
                    {task.dueDate && (
                      <div className="mt-1">
                        <span>Scadenza: {formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {/* Dettagli */}}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Dettagli
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Statistiche personali */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Le Tue Statistiche</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Task Totali</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completato').length}
            </div>
            <div className="text-sm text-gray-600">Completati</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t.status === 'in corso').length}
            </div>
            <div className="text-sm text-gray-600">In Corso</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter(t => t.status === 'assegnato').length}
            </div>
            <div className="text-sm text-gray-600">Da Iniziare</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;