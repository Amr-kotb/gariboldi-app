import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config.js';

/**
 * Servizio di autenticazione per TaskGariboldi
 * Gestisce login, logout e stato utente per team di 5 persone
 */

// Cache locale per dati utente
let currentUser = null;
let userListeners = [];

/**
 * Login con email e password
 * @param {string} email - Email dell'utente
 * @param {string} password - Password
 * @returns {Promise<Object>} Dati utente
 */
export async function login(email, password) {
  try {
    console.log('🔐 Tentativo login per:', email);
    
    // 1. Autenticazione Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // 2. Recupera dati utente da Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Utente non trovato nel database. Contatta l\'amministratore.');
    }
    
    const userData = userDoc.data();
    
    // 3. Verifica che l'utente sia attivo
    if (!userData.isActive) {
      throw new Error('Account disattivato. Contatta l\'amministratore.');
    }
    
    // 4. Crea oggetto utente completo
    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: userData.name || firebaseUser.email.split('@')[0],
      role: userData.role || 'dipendente',
      isAdmin: userData.role === 'admin',
      department: userData.department || 'generale',
      avatar: userData.avatar,
      isActive: userData.isActive,
      lastLogin: new Date().toISOString()
    };
    
    // 5. Salva in localStorage per persistenza
    localStorage.setItem('taskgariboldi_user', JSON.stringify(user));
    currentUser = user;
    
    console.log('✅ Login riuscito per:', user.name, `(Ruolo: ${user.role})`);
    
    // 6. Notifica tutti gli ascoltatori
    notifyUserListeners(user);
    
    return user;
    
  } catch (error) {
    console.error('❌ Errore login:', error.code, error.message);
    
    // Mappa errori Firebase a messaggi utente-friendly
    const errorMessages = {
      'auth/user-not-found': 'Utente non trovato',
      'auth/wrong-password': 'Password errata',
      'auth/invalid-email': 'Email non valida',
      'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
      'auth/user-disabled': 'Account disabilitato'
    };
    
    throw new Error(errorMessages[error.code] || 'Errore durante il login. Riprova.');
  }
}

/**
 * Logout dell'utente
 */
export async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('taskgariboldi_user');
    currentUser = null;
    
    // Notifica tutti gli ascoltatori
    notifyUserListeners(null);
    
    console.log('✅ Logout eseguito');
    return true;
  } catch (error) {
    console.error('❌ Errore logout:', error);
    throw error;
  }
}

/**
 * Recupera l'utente corrente
 * @returns {Object|null} Utente corrente
 */
export function getCurrentUser() {
  if (currentUser) {
    return currentUser;
  }
  
  // Prova a recuperare da localStorage
  const storedUser = localStorage.getItem('taskgariboldi_user');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return currentUser;
    } catch (e) {
      localStorage.removeItem('taskgariboldi_user');
    }
  }
  
  return null;
}

/**
 * Verifica se l'utente è autenticato
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getCurrentUser();
}

/**
 * Verifica se l'utente è admin
 * @returns {boolean}
 */
export function isAdmin() {
  const user = getCurrentUser();
  return user ? user.isAdmin : false;
}

/**
 * Ascolta cambiamenti nello stato di autenticazione
 * @param {Function} callback - Funzione chiamata quando cambia l'utente
 * @returns {Function} Funzione per rimuovere l'ascoltatore
 */
export function onUserChange(callback) {
  userListeners.push(callback);
  
  // Chiama immediatamente con lo stato corrente
  if (typeof callback === 'function') {
    callback(getCurrentUser());
  }
  
  // Restituisce funzione per rimuovere l'ascoltatore
  return () => {
    userListeners = userListeners.filter(listener => listener !== callback);
  };
}

/**
 * Reimposta password via email
 * @param {string} email - Email dell'utente
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Email di reset inviata a:', email);
    return true;
  } catch (error) {
    console.error('❌ Errore reset password:', error);
    throw error;
  }
}

/**
 * Aggiorna profilo utente
 * @param {Object} updates - Campi da aggiornare
 */
export async function updateUserProfile(updates) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Utente non autenticato');
    
    await updateProfile(user, updates);
    
    // Aggiorna cache locale
    if (currentUser) {
      currentUser = { ...currentUser, ...updates };
      localStorage.setItem('taskgariboldi_user', JSON.stringify(currentUser));
      notifyUserListeners(currentUser);
    }
    
    console.log('✅ Profilo aggiornato');
    return true;
  } catch (error) {
    console.error('❌ Errore aggiornamento profilo:', error);
    throw error;
  }
}

// Funzione helper per notificare gli ascoltatori
function notifyUserListeners(user) {
  userListeners.forEach(listener => {
    try {
      listener(user);
    } catch (err) {
      console.error('❌ Errore in user listener:', err);
    }
  });
}

// Inizializza l'ascoltatore di stato Firebase
onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    // Utente disconnesso da Firebase
    if (currentUser) {
      localStorage.removeItem('taskgariboldi_user');
      currentUser = null;
      notifyUserListeners(null);
    }
    return;
  }
  
  // Se abbiamo già l'utente in cache, skip
  if (currentUser && currentUser.uid === firebaseUser.uid) {
    return;
  }
  
  // Ricarica dati utente da Firestore
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData.name || firebaseUser.email.split('@')[0],
        role: userData.role || 'dipendente',
        isAdmin: userData.role === 'admin',
        department: userData.department || 'generale',
        avatar: userData.avatar,
        isActive: userData.isActive,
        lastLogin: new Date().toISOString()
      };
      
      localStorage.setItem('taskgariboldi_user', JSON.stringify(user));
      currentUser = user;
      notifyUserListeners(user);
    }
  } catch (error) {
    console.error('❌ Errore sincronizzazione utente:', error);
  }
});

// Esporta tutto
export default {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  onUserChange,
  resetPassword,
  updateUserProfile
};