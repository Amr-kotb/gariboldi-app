// js/firebase-config.js
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