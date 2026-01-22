import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AdminActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px 30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#1f1f1f', margin: 0 }}>
            Attività del Sistema
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            Storico completo di tutte le attività
          </p>
        </div>
        
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Dashboard
        </button>
      </div>

      <div style={{ padding: '30px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#1f1f1f', marginBottom: '20px', fontSize: '20px' }}>
            Attività Recenti (Ultimi 30 giorni)
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 1, action: 'Task creato', user: 'Admin', details: 'Report Mensile Vendite', time: 'Oggi, 10:30', type: 'create' },
              { id: 2, action: 'Task completato', user: 'Mario Rossi', details: 'Aggiornamento Database', time: 'Oggi, 09:15', type: 'complete' },
              { id: 3, action: 'Utente registrato', user: 'Sistema', details: 'Nuovo dipendente: Luisa Bianchi', time: 'Ieri, 16:45', type: 'user' },
              { id: 4, action: 'Task modificato', user: 'Luisa Bianchi', details: 'Presentazione Team Meeting', time: 'Ieri, 14:20', type: 'update' },
              { id: 5, action: 'File caricato', user: 'Andrea Verdi', details: 'Documentazione progetto.pdf', time: '20/01, 11:30', type: 'upload' },
              { id: 6, action: 'Commento aggiunto', user: 'Domenico Neri', details: 'Task #1234 - Revisione design', time: '19/01, 15:45', type: 'comment' }
            ].map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '15px',
                  backgroundColor: '#fafafa',
                  borderRadius: '6px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: item.type === 'create' ? '#1890ff15' : 
                                  item.type === 'complete' ? '#52c41a15' : 
                                  item.type === 'user' ? '#722ed115' : '#fa8c1615',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.type === 'create' ? '#1890ff' : 
                        item.type === 'complete' ? '#52c41a' : 
                        item.type === 'user' ? '#722ed1' : '#fa8c16',
                  fontSize: '18px'
                }}>
                  {item.type === 'create' ? '📝' : 
                   item.type === 'complete' ? '✅' : 
                   item.type === 'user' ? '👤' : '💬'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#1f1f1f' }}>
                    {item.action}: <span style={{ color: '#666' }}>{item.details}</span>
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '5px' }}>
                    {item.time} • da <strong>{item.user}</strong>
                  </div>
                </div>
                
                <div style={{
                  padding: '4px 12px',
                  backgroundColor: item.type === 'complete' ? '#52c41a15' : '#1890ff15',
                  color: item.type === 'complete' ? '#52c41a' : '#1890ff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {item.type === 'complete' ? 'Completato' : 'Attivo'}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                color: '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Carica altre attività
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}