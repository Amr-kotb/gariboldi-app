import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users] = useState([
    { id: 1, name: 'Mario Rossi', email: 'mario@azienda.com', role: 'dipendente', tasks: 3, status: 'attivo' },
    { id: 2, name: 'Luigi Verdi', email: 'luigi@azienda.com', role: 'dipendente', tasks: 5, status: 'attivo' },
    { id: 3, name: 'Anna Bianchi', email: 'anna@azienda.com', role: 'dipendente', tasks: 2, status: 'attivo' },
    { id: 4, name: 'Giulia Neri', email: 'giulia@azienda.com', role: 'dipendente', tasks: 4, status: 'inattivo' },
    { id: 5, name: 'Admin System', email: 'admin@taskmanager.com', role: 'admin', tasks: 0, status: 'attivo' }
  ]);

  return (
    <div className="admin-users">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1>👥 Gestione Utenti</h1>
        <p>Gestisci i 5 membri del team (1 admin + 4 dipendenti)</p>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <Button variant="primary" onClick={() => navigate(ROUTES.ADMIN.ASSIGN_TASK)}>
          ➕ Assegna Task
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}>
          ← Torna alla Dashboard
        </Button>
      </div>

      <Card title="Team Membri" className="mb-4">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Ruolo</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Task Attivi</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Stato</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: user.role === 'admin' ? '#d4edda' : '#d1ecf1',
                      color: user.role === 'admin' ? '#155724' : '#0c5460',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {user.role === 'admin' ? 'Amministratore' : 'Dipendente'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <strong>{user.tasks}</strong> task
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      color: user.status === 'attivo' ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {user.status === 'attivo' ? '✅ Attivo' : '⏸️ Inattivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Button 
                      size="small" 
                      variant="outline"
                      onClick={() => navigate(`${ROUTES.ADMIN.USERS}/${user.id}`)}
                    >
                      Dettagli
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="📊 Statistiche Team">
          <div>
            <p>Totale membri: <strong>5</strong></p>
            <p>Amministratori: <strong>1</strong></p>
            <p>Dipendenti: <strong>4</strong></p>
            <p>Task totali assegnati: <strong>14</strong></p>
          </div>
        </Card>

        <Card title="⚡ Azioni Rapide">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="outline" size="small">
              📧 Invia Notifica a Tutti
            </Button>
            <Button variant="outline" size="small">
              📄 Genera Report Utenti
            </Button>
            <Button variant="outline" size="small">
              🔄 Reset Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;