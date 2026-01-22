// SOSTITUISCI TUTTO il file con:
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useTasks.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, loading, loadUsers } = useUsers();
  
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    employees: 0,
    active: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const admins = users.filter(u => u.role === 'admin').length;
      const employees = users.filter(u => u.role === 'dipendente').length;
      const active = users.filter(u => u.isActive !== false).length;
      
      setStats({
        total: users.length,
        admins,
        employees,
        active
      });
    }
  }, [users]);

  const getUserRoleLabel = (role) => {
    return role === 'admin' ? 'Amministratore' : 'Dipendente';
  };

  const getUserStatus = (user) => {
    return user.isActive === false ? 'inattivo' : 'attivo';
  };

  const getStatusColor = (status) => {
    return status === 'attivo' ? '#10b981' : '#ef4444';
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#8b5cf6' : '#3b82f6';
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>Caricamento utenti...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '10px' }}>
          👥 Gestione Utenti
        </h1>
        <p style={{ color: '#6b7280' }}>
          Gestisci {stats.total} membri del team ({stats.admins} admin + {stats.employees} dipendenti)
        </p>
      </div>

      {/* Statistiche */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '10px' }}>
            {stats.total}
          </div>
          <div style={{ color: '#6b7280' }}>Utenti Totali</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '10px' }}>
            {stats.admins}
          </div>
          <div style={{ color: '#6b7280' }}>Amministratori</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '10px' }}>
            {stats.employees}
          </div>
          <div style={{ color: '#6b7280' }}>Dipendenti</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#10b981', marginBottom: '10px' }}>
            {stats.active}
          </div>
          <div style={{ color: '#6b7280' }}>Attivi</div>
        </div>
      </div>

      {/* Tabella Utenti */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>Team Membri</h3>
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
            ← Dashboard
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>
                  Nome
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>
                  Email
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>
                  Ruolo
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>
                  Dipartimento
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>
                  Stato
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>
                  Ultimo Accesso
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const status = getUserStatus(user);
                const roleLabel = getUserRoleLabel(user.role);
                
                return (
                  <tr 
                    key={user.id} 
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      ':hover': {
                        backgroundColor: '#f9fafb'
                      }
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: getRoleColor(user.role) + '20',
                          color: getRoleColor(user.role),
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>
                            {user.name || 'Nome non disponibile'}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {user.email}
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        backgroundColor: getRoleColor(user.role) + '20',
                        color: getRoleColor(user.role),
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {roleLabel}
                      </span>
                    </td>
                    
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {user.department || 'Non specificato'}
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: getStatusColor(status),
                          borderRadius: '50%'
                        }}></div>
                        <span style={{ 
                          color: getStatusColor(status),
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {status}
                        </span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '14px' }}>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('it-IT') : 'Mai'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Azioni Rapide */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>
            📊 Statistiche Team
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Totale membri:</span>
              <span style={{ fontWeight: '600' }}>{stats.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Amministratori:</span>
              <span style={{ fontWeight: '600', color: '#8b5cf6' }}>{stats.admins}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Dipendenti:</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{stats.employees}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Attivi:</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>{stats.active}</span>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>
            ⚡ Azioni Rapide
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => alert('Funzione in sviluppo')}
              style={{
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>📧</span> Invia Notifica a Tutti
            </button>
            <button
              onClick={() => alert('Funzione in sviluppo')}
              style={{
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>📄</span> Genera Report Utenti
            </button>
            <button
              onClick={() => alert('Funzione in sviluppo')}
              style={{
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>🔄</span> Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;