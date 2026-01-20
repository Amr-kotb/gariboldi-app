import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

console.log('🚀 [main.jsx] Avvio applicazione');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento root non trovato');
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ [main.jsx] React renderizzato');
} catch (error) {
  console.error('❌ [main.jsx] Errore:', error);
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <h1>Errore React</h1>
      <p>${error.message}</p>
      <button onclick="location.reload()">Ricarica</button>
    </div>
  `;
}