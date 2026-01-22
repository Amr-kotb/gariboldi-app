import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function EmployeeReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reports, setReports] = useState([
    { id: 1, name: 'Report Settimanale Produttività', period: '13-19 Gen 2026', status: 'completato', score: 8.5 },
    { id: 2, name: 'Analisi Task Completati', period: 'Dicembre 2025', status: 'completato', score: 7.8 },
    { id: 3, name: 'Report Performance Personale', period: 'Q4 2025', status: 'in revisione', score: 9.2 },
    { id: 4, name: 'Auto-valutazione Mensile', period: 'Gennaio 2026', status: 'da compilare', score: null }
  ]);

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
            I Miei Report
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            Report personali e valutazioni
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
            onClick={() => alert('Genera nuovo report')}
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
            📊 Nuovo Report
          </button>
        </div>
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
            I Miei Report
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: report.status === 'completato' ? '#52c41a15' : 
                                   report.status === 'in revisione' ? '#fa8c1615' : '#d9d9d9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: report.status === 'completato' ? '#52c41a' : 
                          report.status === 'in revisione' ? '#fa8c16' : '#8c8c8c'
                  }}>
                    📊
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f1f1f' }}>{report.name}</div>
                    <div style={{ color: '#666', fontSize: '13px', marginTop: '5px' }}>
                      Periodo: {report.period} • Status: 
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: report.status === 'completato' ? '#52c41a15' : 
                                       report.status === 'in revisione' ? '#fa8c1615' : '#d9d9d9',
                        color: report.status === 'completato' ? '#52c41a' : 
                              report.status === 'in revisione' ? '#fa8c16' : '#8c8c8c',
                        borderRadius: '12px',
                        marginLeft: '8px',
                        fontSize: '12px'
                      }}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {report.score && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
                        {report.score}/10
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Valutazione</div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
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
                      📥 Scarica
                    </button>
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: report.status === 'da compilare' ? '#52c41a' : 'transparent',
                        color: report.status === 'da compilare' ? 'white' : '#666',
                        border: report.status === 'da compilare' ? 'none' : '1px solid #d9d9d9',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {report.status === 'da compilare' ? 'Compila' : 'Dettagli'}
                    </button>
                  </div>
                </div>
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
            Statistiche Report
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Report Completati', value: reports.filter(r => r.status === 'completato').length, total: reports.length, color: '#52c41a' },
              { label: 'Valutazione Media', value: '8.2', unit: '/10', color: '#1890ff' },
              { label: 'In Revisione', value: reports.filter(r => r.status === 'in revisione').length, total: reports.length, color: '#fa8c16' },
              { label: 'Da Compilare', value: reports.filter(r => r.status === 'da compilare').length, total: reports.length, color: '#8c8c8c' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: `2px solid ${stat.color}20`
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color, marginBottom: '5px' }}>
                  {stat.value}{stat.unit || ''}
                </div>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                  {stat.label}
                </div>
                {stat.total && (
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    {Math.round((stat.value / stat.total) * 100)}% del totale
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}