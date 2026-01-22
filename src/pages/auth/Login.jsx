import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔄 [Login] Tentativo login per:', email);
    
    // Validazione semplice
    if (!email.includes('@')) {
      setError('Inserisci un\'email valida');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      setLoading(false);
      return;
    }
    
    try {
      const result = await signIn(email, password);
      console.log('🔍 [Login] Risultato signIn:', result);
      
      if (result.success) {
        console.log('✅ [Login] Login riuscito, reindirizzamento...');
        
        // NON navigare subito! Usa la pagina di redirect
        // Questo dà tempo a Firebase di sincronizzare l'utente
        setTimeout(() => {
          navigate('/login/redirect', { replace: true });
        }, 300);
        
      } else {
        console.log('❌ [Login] Errore Firebase:', result.error);
        setError(result.error || 'Credenziali non valide');
        setLoading(false);
      }
    } catch (err) {
      console.error('💥 [Login] Errore critico:', err);
      setError('Errore di connessione al server');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
          <h1 style={{ color: '#1f2937', marginBottom: '10px', fontSize: '28px' }}>TaskG Login</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Sistema di gestione task Gariboldi</p>
        </div>
        
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#374151',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: loading ? '#f3f4f6' : 'white',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="admin@gariboldi.com"
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#374151',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: loading ? '#f3f4f6' : 'white',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              placeholder="Inserisci password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? '⏳ Autenticazione...' : '🔓 Accedi'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '25px', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'left',
            fontSize: '13px'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: '500' }}>
              Credenziali di test:
            </div>
            <div style={{ marginBottom: '5px' }}>
              <span style={{ color: '#10b981' }}>👑 Admin:</span> admin@gariboldi.com
            </div>
            <div>
              <span style={{ color: '#3b82f6' }}>👤 Dipendente:</span> dipendente@gariboldi.com
            </div>
            <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '12px' }}>
              Password: qualsiasi (minimo 6 caratteri)
            </div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
              padding: '10px'
            }}
          >
            ← Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}