import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  console.log('🏠 [Home] Pagina caricata, navigate disponibile:', typeof navigate === 'function');

  const handleLoginClick = (e) => {
    if (e) e.preventDefault();
    
    console.log('🖱️ [Home] Cliccato login');
    console.log('📍 Navigazione a /login');
    
    // Usa SOLO navigate di React Router
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#1890ff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            TG
          </div>
          <div>
            <h1 style={{ fontSize: '24px', color: '#1f1f1f', margin: 0 }}>
              TaskManager Pro
            </h1>
            <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
              Sistema di gestione task aziendale
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: '700px' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Gestione Task Intelligente
          </h1>
          
          <p style={{
            fontSize: '1.3rem',
            marginBottom: '40px',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Sistema completo per la gestione delle attività aziendali.
            Assegna, monitora e completa i task in modo efficiente con il tuo team.
          </p>
          
          {/* CTA Button */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <button
              onClick={handleLoginClick}
              style={{
                padding: '18px 45px',
                backgroundColor: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={e => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
              }}
              onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
            >
              <span style={{ fontSize: '20px' }}>🔐</span>
              ACCEDI AL SISTEMA
            </button>
            
            <p style={{
              fontSize: '14px',
              opacity: 0.8,
              marginTop: '10px'
            }}>
              Clicca per accedere con le tue credenziali aziendali
            </p>
          </div>
        </div>
      </main>

      {/* Features */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            color: '#1f1f1f',
            marginBottom: '50px'
          }}>
            Funzionalità Principali
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                icon: '📋',
                title: 'Gestione Task',
                description: 'Crea, assegna e monitora tutte le attività del team'
              },
              {
                icon: '📊',
                title: 'Report Avanzati',
                description: 'Statistiche dettagliate e report personalizzati'
              },
              {
                icon: '👥',
                title: 'Collaborazione',
                description: 'Comunicazione in tempo reale tra team members'
              },
              {
                icon: '⏰',
                title: 'Scadenze',
                description: 'Notifiche e promemoria per le scadenze importanti'
              },
              {
                icon: '📱',
                title: 'Mobile Friendly',
                description: 'Accessibile da qualsiasi dispositivo'
              },
              {
                icon: '🔒',
                title: 'Sicurezza',
                description: 'Dati protetti e accesso controllato'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '30px',
                  backgroundColor: '#fafafa',
                  borderRadius: '12px',
                  transition: 'transform 0.3s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#1f1f1f',
                  marginBottom: '15px'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1890ff'
          }}>
            TaskManager Pro
          </div>
          
          <p style={{
            color: '#999',
            marginBottom: '30px',
            fontSize: '16px'
          }}>
            Sistema professionale per la gestione delle attività aziendali
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <button
              onClick={handleLoginClick}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Accedi
            </button>
            <button
              onClick={() => navigate('/test')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#1890ff',
                border: '1px solid #1890ff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Pagina Test
            </button>
          </div>
          
          <div style={{
            borderTop: '1px solid #333',
            paddingTop: '20px',
            color: '#777',
            fontSize: '14px'
          }}>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} TaskManager Pro. Tutti i diritti riservati.
            </p>
            <p style={{ margin: '5px 0 0 0' }}>
              Versione 2.0 • Sistema per uso aziendale interno
            </p>
          </div>
        </div>
      </footer>

      {/* Debug Console */}
      <script>
        {`
          console.log('%c🏠 TaskManager Home', 'color: #1890ff; font-weight: bold; font-size: 14px');
          console.log('✅ React Router attivo');
          console.log('📍 Path corrente: ${window.location.pathname}');
          console.log('🔄 Hot reload attivo');
        `}
      </script>
    </div>
  );
};

export default Home;