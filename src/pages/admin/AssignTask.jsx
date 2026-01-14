import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import DatePicker from '../../components/forms/DatePicker';

const AdminAssignTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });

  const mockUsers = [
    { id: '1', name: 'Mario Rossi' },
    { id: '2', name: 'Luigi Verdi' },
    { id: '3', name: 'Anna Bianchi' },
    { id: '4', name: 'Giulia Neri' }
  ];

  const priorities = [
    { value: 'low', label: '🟢 Bassa' },
    { value: 'medium', label: '🟡 Media' },
    { value: 'high', label: '🟠 Alta' },
    { value: 'urgent', label: '🔴 Urgente' }
  ];

  const statuses = [
    { value: 'pending', label: '⏳ In attesa' },
    { value: 'in_progress', label: '🔄 In corso' },
    { value: 'completed', label: '✅ Completato' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Task da creare:', formData);
    
    // Simula invio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('✅ Task assegnato con successo!');
    navigate(ROUTES.ADMIN.TASKS);
    setLoading(false);
  };

  return (
    <div className="admin-assign-task" style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1>📝 Assegna Nuovo Task</h1>
        <p>Crea e assegna un nuovo task a un membro del team</p>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <Button 
          variant="outline" 
          onClick={() => navigate(ROUTES.ADMIN.TASKS)}
        >
          ← Torna a Gestione Task
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
        >
          🏠 Dashboard
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <Input
            label="Titolo Task"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Inserisci titolo del task"
            required
            disabled={loading}
          />
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Descrizione
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrivi il task..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '100px'
              }}
              disabled={loading}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <Select
              label="Assegna a"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              options={mockUsers.map(user => ({ value: user.id, label: user.name }))}
              placeholder="Seleziona dipendente"
              required
              disabled={loading}
            />
            
            <Select
              label="Priorità"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorities}
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <DatePicker
              label="Scadenza"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              disabled={loading}
            />
            
            <Select
              label="Stato iniziale"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statuses}
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN.TASKS)}
              disabled={loading}
            >
              Annulla
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {loading ? 'Assegnazione in corso...' : 'Assegna Task'}
            </Button>
          </div>
        </form>
      </Card>

      <div style={{ marginTop: '20px' }}>
        <Card title="💡 Suggerimenti">
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Scegli la priorità in base all'urgenza del task</li>
            <li>Assegna task in base alle competenze del dipendente</li>
            <li>Imposta scadenze realistiche</li>
            <li>Fornisci una descrizione chiara e dettagliata</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AdminAssignTask;