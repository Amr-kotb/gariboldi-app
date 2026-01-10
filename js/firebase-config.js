const firebaseConfig = {
  apiKey: "AIzaSyDpZfX3g9HxtRaHG0nrmgdQnNA4ijevLXE",
  authDomain: "taskgariboldi.firebaseapp.com",
  projectId: "taskgariboldi",
  storageBucket: "taskgariboldi.firebasestorage.app",
  messagingSenderId: "181239259608",
  appId: "1:181239259608:web:5a24dcb4073df79a4952ad"
};

// Inizializza Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Riferimenti ai servizi
const auth = firebase.auth();
const db = firebase.firestore();

// Impostazioni Firestore
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// 🚫 RIMUOVI TUTTA QUESTA PARTE CHE FA SIGN OUT AUTOMATICO 🚫
// NON fare clearPreviousSession() automaticamente

// Esporta per uso globale
window.auth = auth;
window.db = db;