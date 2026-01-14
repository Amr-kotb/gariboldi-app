import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TaskList from '../../components/task/TaskList';
import TaskFilters from '../../components/task/TaskFilters';

const AdminTasks = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  
  const mockTasks = [
    { 
      id: 1, 
      title: 'Report Mensile Marketing', 
      description: 'Preparare report attività marketing del mese', 
      assignedTo: '1',
      assignedToName: 'Mario Rossi',
      priority: 'high', 
      status: 'in_progress', 
      dueDate: '2024-01-20',
      createdAt: '2024-01-10'
    },
    { 
      id: 2, 
      title: 'Aggiornamento Database Clienti', 
      description: 'Sincronizzare database clienti con nuovi contatti', 
      assignedTo: '2',
      assignedToName: 'Luigi Verdi',
      priority: 'medium', 
      status: 'pending', 
      dueDate: '2024-01-18',
      createdAt: '2024-01-12'
    },
    { 
      id: 3, 
      title: 'Manutenzione Server', 
      description: 'Manutenzione ordinaria server aziendale', 
      assignedTo: '3',
      assignedToName: 'Anna Bianchi',
      priority: 'urgent', 
      status: 'completed', 
      dueDate: '2024-01-15',
      createdAt: '2024-01-05'
    },
    { 
      id: 4, 
      title: 'Presentazione Progetto X', 
      description: 'Preparare presentazione per meeting investitori', 
      assignedTo: '4',
      assignedToName: 'Giulia Neri',
      priority: 'high', 
      status: 'in_progress', 
      dueDate: '2024-01-22',
      createdAt: '2024-01-14'
    }
  ];

  const mockUsers = [
    { id: 1, name: 'Mario Rossi' },
    { id: 2, name: 'Luigi Verdi' },
    { id: 3, name: 'Anna Bianchi' },
    { id: 4, name: 'Giulia Neri' }
  ];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    console.log('Filtri applicati:', newFilters);
  };

  return (
    <div className="admin-tasks" style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1>📋 Gestione Task</h1>
        <p>Visualizza e gestisci tutti i task del team</p>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <Button 
          variant="primary" 
          onClick={() => navigate(ROUTES.ADMIN.ASSIGN_TASK)}
        >
          ➕ Assegna Nuovo Task
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
        >
          ← Torna alla Dashboard
        </Button>
      </div>

      <TaskFilters 
        onFilterChange={handleFilterChange}
        users={mockUsers}
      />

      <Card title={`Task Totali (${mockTasks.length})`} style={{ marginTop: '20px' }}>
        <TaskList 
          tasks={mockTasks}
          loading={false}
          emptyMessage="Nessun task disponibile"
          onEditTask={(task) => console.log('Modifica task:', task)}
          onDeleteTask={(task) => {
            if (window.confirm(`Eliminare il task "${task.title}"?`)) {
              console.log('Task eliminato:', task.id);
            }
          }}
          onStatusChange={(taskId, newStatus) => {
            console.log(`Cambiato stato task ${taskId} a ${newStatus}`);
          }}
          showActions={true}
        />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <Card title="📊 Statistiche Task">
          <div style={{ padding: '15px' }}>
            <p><strong>Totali:</strong> {mockTasks.length}</p>
            <p><strong>In corso:</strong> {mockTasks.filter(t => t.status === 'in_progress').length}</p>
            <p><strong>Completati:</strong> {mockTasks.filter(t => t.status === 'completed').length}</p>
            <p><strong>In attesa:</strong> {mockTasks.filter(t => t.status === 'pending').length}</p>
          </div>
        </Card>

        <Card title="⚡ Azioni Rapide">
          <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="outline" size="small">
              📥 Esporta Task (CSV)
            </Button>
            <Button variant="outline" size="small">
              📧 Notifica Scadenze
            </Button>
            <Button variant="outline" size="small">
              🔄 Aggiorna Tutti
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminTasks;