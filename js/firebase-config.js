// js/firebase-config.js
console.log('🔥 Firebase config loaded');

const firebaseConfig = {
  apiKey: "AIzaSyDpZfX3g9HxtRaHG0nrmgdQnNA4ijevLXE",
  authDomain: "taskgariboldi.firebaseapp.com",
  projectId: "taskgariboldi",
  storageBucket: "taskgariboldi.firebasestorage.app",
  messagingSenderId: "181239259608",
  appId: "1:181239259608:web:5a24dcb4073df79a4952ad"
};

// Inizializza Firebase una sola volta
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized');
    
    // Abilita persistenza per sessioni più stabili
    firebase.firestore().settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    // Forza persistenza locale
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => console.log('✅ Persistence set to LOCAL'))
      .catch(err => console.error('❌ Persistence error:', err));
      
  } catch (error) {
    console.error('❌ Firebase init error:', error);
  }
} else {
  console.log('⚠️ Firebase already initialized');
}