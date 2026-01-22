import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [settings, setSettings] = React.useState({
    notifications: true,
    emailAlerts: true,
    autoSave: false,
    darkMode: false,
    language: 'it'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    alert('Impostazioni salvate!');
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
            Impostazioni Sistema
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            Configura le preferenze dell'applicazione
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
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
            ← Indietro
          </button>
          <button
            onClick={handleSave}
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
            💾 Salva
          </button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#1f1f1f', marginBottom: '20px', fontSize: '20px' }}>
            Impostazioni Notifiche
          </h2>
          
          {[
            { key: 'notifications', label: 'Notifiche push', description: 'Ricevi notifiche in tempo reale' },
            { key: 'emailAlerts', label: 'Avvisi via email', description: 'Ricevi riepiloghi giornalieri' },
            { key: 'autoSave', label: 'Salvataggio automatico', description: 'Salva automaticamente le modifiche' }
          ].map((item) => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <div style={{ fontWeight: '500', color: '#1f1f1f' }}>{item.label}</div>
                <div style={{ color: '#8c8c8c', fontSize: '13px', marginTop: '5px' }}>{item.description}</div>
              </div>
              <div
                onClick={() => handleToggle(item.key)}
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: settings[item.key] ? '#1890ff' : '#d9d9d9',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: settings[item.key] ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#1f1f1f', marginBottom: '20px', fontSize: '20px' }}>
            Preferenze Visualizzazione
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: '500', color: '#1f1f1f', marginBottom: '10px' }}>Lingua</div>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderTop: '1px solid #f0f0f0'
          }}>
            <div>
              <div style={{ fontWeight: '500', color: '#1f1f1f' }}>Modalità Scura</div>
              <div style={{ color: '#8c8c8c', fontSize: '13px', marginTop: '5px' }}>Attiva il tema scuro</div>
            </div>
            <div
              onClick={() => handleToggle('darkMode')}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: settings.darkMode ? '#1890ff' : '#d9d9d9',
                borderRadius: '12px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '2px',
                left: settings.darkMode ? '22px' : '2px',
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'all 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}