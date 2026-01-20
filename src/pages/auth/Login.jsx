import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn } = useAuth();

  console.log('🔐 [Login] Pagina caricata');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔄 [Login] Tentativo accesso:', email);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        console.log('✅ [Login] Accesso riuscito, redirect a /dashboard');
        navigate('/dashboard');
      } else {
        console.log('❌ [Login] Accesso fallito:', result.error);
        setError(result.error || 'Credenziali non valide');
      }
    } catch (err) {
      console.error('💥 [Login] Errore:', err);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        padding: '50px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottomLeftRadius: '100%',
          opacity: 0.1
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderTopRightRadius: '100%',
          opacity: 0.1
        }}></div>

        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#667eea',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            TG
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            color: '#1f1f1f', 
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            TaskManager Pro
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '16px',
            marginBottom: '5px'
          }}>
            Accesso al sistema
          </p>
          <p style={{ 
            color: '#999', 
            fontSize: '14px'
          }}>
            Inserisci le tue credenziali aziendali
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            color: '#cf1322',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '25px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              color: '#1f1f1f',
              marginBottom: '10px',
              fontWeight: '500',
              fontSize: '15px'
            }}>
              Email Aziendale
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s',
                backgroundColor: '#fafafa'
              }}
              placeholder="nome.cognome@azienda.com"
              disabled={loading}
              onFocus={e => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#d9d9d9';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#fafafa';
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{
                display: 'block',
                color: '#1f1f1f',
                fontWeight: '500',
                fontSize: '15px'
              }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Password dimenticata?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s',
                backgroundColor: '#fafafa'
              }}
              placeholder="••••••••"
              disabled={loading}
              onFocus={e => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#d9d9d9';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#fafafa';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading 
                ? '#cccccc' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
              }
            }}
            onMouseOut={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Accesso in corso...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🔐</span>
                ACCEDI AL SISTEMA
              </div>
            )}
          </button>

          <div style={{ 
            marginTop: '30px', 
            textAlign: 'center' 
          }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                color: '#666',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <span>←</span>
              Torna alla Home
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div style={{ 
          marginTop: '40px', 
          paddingTop: '20px', 
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center',
          color: '#999',
          fontSize: '13px',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{ margin: 0 }}>
            Per assistenza contattare l'amministratore di sistema
          </p>
          <p style={{ margin: '5px 0 0 0' }}>
            accesso@taskmanager.pro
          </p>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;