import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          color: '#1f2937', 
          marginBottom: '20px',
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🚀 TaskG
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280', 
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Sistema di gestione task per team. Organizza, assegna e monitora le attività 
          del tuo team in modo semplice ed efficiente.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link
            to="/login"
            style={{
              padding: '15px 30px',
              backgroundColor: '#4f46e5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#4338ca';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4f46e5';
              e.target.style.transform = 'translateY(0)';
            }}
          >
             Accedi al Sistema
          </Link>
          
        </div>
        
        <div style={{ 
          marginTop: '50px', 
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '10px',
          fontSize: '14px'
        }}>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;