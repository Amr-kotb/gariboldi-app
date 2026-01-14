import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './services/firebase/config.js';
import './config/app.config.js';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento root non trovato! Controlla index.html');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);