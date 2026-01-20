import React from 'react';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const navigate = useNavigate();
  
  console.log('🧪 [Test] Pagina di test caricata');
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🧪 Pagina di Test</h1>
      <p>Se vedi questa pagina, il routing funziona!</p>
      <button onClick={() => navigate('/')}>Torna alla Home</button>
      <button onClick={() => navigate('/login')}>Vai a Login</button>
    </div>
  );
};

export default Test;