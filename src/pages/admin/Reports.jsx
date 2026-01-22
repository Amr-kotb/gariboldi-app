import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AdminReports() {
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
            Report e Analisi
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            Analisi dettagliate e report del sistema
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#1f1f1f', marginBottom: '20px', fontSize: '20px' }}>
            Report Disponibili
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Report Produttività', icon: '📊', desc: 'Analisi produttività team', color: '#1890ff' },
              { title: 'Report Task', icon: '📋', desc: 'Stato e completamento task', color: '#52c41a' },
              { title: 'Report Utenti', icon: '👥', desc: 'Attività e performance', color: '#722ed1' },
              { title: 'Report Tempi', icon: '⏱️', desc: 'Tempi di completamento', color: '#fa8c16' }
            ].map((report, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  border: `2px solid ${report.color}20`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${report.color}10`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => alert(`Generando ${report.title}...`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: `${report.color}15`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: report.color
                  }}>
                    {report.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f1f1f' }}>{report.title}</div>
                    <div style={{ color: '#666', fontSize: '13px' }}>{report.desc}</div>
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: report.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '10px'
                  }}
                >
                  Genera Report
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#1f1f1f', marginBottom: '20px', fontSize: '20px' }}>
            Report Generati Recentemente
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: 'Report Settimanale Produttività', date: '20/01/2026', size: '2.4 MB', status: 'completato' },
              { name: 'Analisi Mensile Task', date: '15/01/2026', size: '1.8 MB', status: 'completato' },
              { name: 'Report Performance Dipendenti', date: '10/01/2026', size: '3.1 MB', status: 'completato' }
            ].map((report, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  backgroundColor: '#fafafa',
                  borderRadius: '6px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#1890ff15',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1890ff',
                    fontSize: '18px'
                  }}>
                    📄
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1f1f1f' }}>{report.name}</div>
                    <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '5px' }}>
                      {report.date} • {report.size}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📥 Download
                  </button>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#ff4d4f',
                      border: '1px solid #ff4d4f',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}