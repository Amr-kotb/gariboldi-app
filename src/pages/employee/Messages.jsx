import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function EmployeeMessages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, from: 'Admin', subject: 'Nuovo task assegnato', content: 'Ti è stato assegnato un nuovo task: "Report Settimanale Vendite"', time: 'Oggi, 10:30', read: false },
    { id: 2, from: 'Mario Rossi', subject: 'Collaborazione task', content: 'Possiamo coordinare sul task di aggiornamento database?', time: 'Ieri, 15:45', read: true },
    { id: 3, from: 'Sistema', subject: 'Promemoria scadenza', content: 'Il task "Presentazione Clienti" scade tra 2 giorni', time: '20/01, 09:20', read: true },
    { id: 4, from: 'Luisa Bianchi', subject: 'Feedback positivo', content: 'Ottimo lavoro sul report di ieri!', time: '19/01, 16:30', read: true }
  ]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const markAsRead = (id) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

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
            Messaggi
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            {messages.filter(m => !m.read).length} messaggi non letti
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/employee/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Dashboard
          </button>
          <button
            onClick={() => alert('Nuovo messaggio')}
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
            ✉️ Nuovo Messaggio
          </button>
        </div>
      </div>

      <div style={{ padding: '30px', display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
        <div style={{
          flex: '0 0 350px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
            <input
              type="text"
              placeholder="Cerca messaggi..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  markAsRead(msg.id);
                }}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: selectedMessage?.id === msg.id ? '#1890ff10' : 
                                 !msg.read ? '#1890ff05' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 
                    selectedMessage?.id === msg.id ? '#1890ff10' : 
                    !msg.read ? '#1890ff05' : 'white';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '500', color: '#1f1f1f' }}>{msg.from}</div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{msg.time}</div>
                </div>
                <div style={{ 
                  fontWeight: !msg.read ? '600' : '500', 
                  color: '#1f1f1f',
                  margin: '5px 0'
                }}>
                  {msg.subject}
                </div>
                <div style={{
                  color: '#666',
                  fontSize: '13px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {msg.content}
                </div>
                {!msg.read && (
                  <div style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#1890ff',
                    borderRadius: '50%',
                    marginTop: '8px'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedMessage ? (
            <>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ color: '#1f1f1f', margin: '0 0 10px 0', fontSize: '20px' }}>
                      {selectedMessage.subject}
                    </h2>
                    <div style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>Da: <strong>{selectedMessage.from}</strong></span>
                      <span>•</span>
                      <span>{selectedMessage.time}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#ff4d4f',
                        border: '1px solid #ff4d4f',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ Elimina
                    </button>
                    <button
                      onClick={() => alert('Rispondi')}
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
                      ↩️ Rispondi
                    </button>
                  </div>
                </div>
              </div>

              <div style={{
                flex: 1,
                padding: '20px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#1f1f1f', lineHeight: '1.6' }}>
                  {selectedMessage.content}
                </p>
              </div>

              <div>
                <h3 style={{ color: '#1f1f1f', marginBottom: '15px' }}>Rispondi</h3>
                <textarea
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '15px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '15px',
                    resize: 'vertical'
                  }}
                  placeholder="Scrivi la tua risposta..."
                />
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    float: 'right'
                  }}
                >
                  Invia Risposta
                </button>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#8c8c8c'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✉️</div>
                <h3 style={{ color: '#1f1f1f', marginBottom: '10px' }}>Nessun messaggio selezionato</h3>
                <p>Seleziona un messaggio dalla lista per leggerlo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}