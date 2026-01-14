import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Configurazione Firebase con variabili d'ambiente
 * Le variabili VITE_ vengono caricate da .env
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/**
 * Inizializza Firebase solo una volta
 * Controlla se è già stata inizializzata per evitare errori
 */
let firebaseApp;
let auth;
let db;
let storage;

try {
  // Inizializza l'app Firebase
  firebaseApp = initializeApp(firebaseConfig);
  
  // Inizializza i servizi Firebase
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  
  console.log('✅ Firebase inizializzato correttamente');
  console.log('📊 Configurazione:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    env: import.meta.env.VITE_APP_ENV
  });
  
} catch (error) {
  console.error('❌ ERRORE inizializzazione Firebase:', error);
  console.error('⚠️  Controlla le variabili d\'ambiente in .env');
  console.error('⚠️  File .env presente?', import.meta.env.VITE_FIREBASE_API_KEY ? 'SI' : 'NO');
  
  // In sviluppo, mostra errore dettagliato
  if (import.meta.env.VITE_APP_ENV === 'development') {
    alert(`ERRORE Firebase: ${error.message}\nControlla la console per dettagli.`);
  }
}

// Esporta i servizi
export { firebaseApp, auth, db, storage };

// Helper per verificare se Firebase è configurato
export const isFirebaseConfigured = () => {
  return !!firebaseApp && !!auth && !!db;
};

// Helper per ottenere la configurazione (senza valori sensibili)
export const getFirebaseConfigInfo = () => {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    appId: firebaseConfig.appId ? '***' + firebaseConfig.appId.slice(-4) : 'N/A',
    env: import.meta.env.VITE_APP_ENV,
    teamSize: import.meta.env.VITE_ADMIN_USERS + ' admin + ' + import.meta.env.VITE_EMPLOYEE_USERS + ' dipendenti'
  };
};