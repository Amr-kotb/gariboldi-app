import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useTasks, useUsers } from '../../hooks/useTasks.jsx';

const AdminAssignTask = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, loadEmployees } = useUsers();
  const { createTask } = useTasks();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'media',
    dueDate: '',
    status: 'assegnato'
  });

  // Carica dipendenti REALI al mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const priorities = [
    { value: 'bassa', label: '🟢 Bassa' },
    { value: 'media', label: '🟡 Media' },
    { value: 'alta', label: '🟠 Alta' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Array mock di utenti (solo per demo se users è vuoto)
  const mockUsers = [
    { id: '1', name: 'Andrea' },
    { id: '2', name: 'Leonardo' },
    { id: '3', name: 'Stefano' },
    { id: '4', name: 'Domenico' }
  ];

  // Usa gli utenti reali se disponibili, altrimenti quelli mock
  const displayUsers = users.length > 0 ? users : mockUsers;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Trova il nome dell'utente assegnato
      const assignedUser = displayUsers.find(u => u.id === formData.assignedTo);
      
      const taskData = {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        assignedToName: assignedUser?.name || 'Sconosciuto',
        priority: formData.priority,
        status: formData.status,
        progress: 0,
        createdBy: currentUser.uid,
        createdByName: currentUser.name,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };
      
      console.log('📝 [AssignTask] Creazione task:', taskData);
      
      const result = await createTask(taskData);
      
      if (result.success) {
        alert('✅ Task assegnato con successo!');
        navigate('/admin/tasks');
      } else {
        alert('❌ Errore: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ [AssignTask] Errore:', error);
      alert('❌ Errore nella creazione del task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '10px' }}>
          📝 Assegna Nuovo Task
        </h1>
        <p style={{ color: '#6b7280' }}>
          Crea e assegna un nuovo task a un membro del team
        </p>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/admin/tasks')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ← Torna a Gestione Task
        </button>
        
        <button 
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🏠 Dashboard
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Titolo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Titolo Task *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Inserisci titolo del task"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          
          {/* Descrizione */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Descrizione
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrivi il task..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                minHeight: '100px',
                fontSize: '16px'
              }}
              disabled={loading}
            />
          </div>
          
          {/* Assegna a & Priorità */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Assegna a *
              </label>
              <select
                name="assignedTo" 
                value={formData.assignedTo}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="">Seleziona dipendente</option>
                {displayUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Priorità *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Scadenza */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Scadenza
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          
          {/* Bottoni */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/tasks')}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Annulla
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {loading ? 'Creazione in corso...' : 'Assegna Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAssignTask;