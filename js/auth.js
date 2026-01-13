// js/auth.js - AUTH SYSTEM v4.0 (STABLE)
console.log('🔐 Auth System v4.0 loaded');

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.authListeners = [];
    this.maxRetries = 3;
    this.retryCount = 0;
  }

  // ==================== PUBLIC API ====================

  async login(email, password) {
    try {
      console.log('🔑 Login attempt:', email);
      utils.Notify.show('Accesso in corso...', 'info');
      
      // Validazione
      if (!utils.Validator.email(email)) {
        throw new Error('Email non valida');
      }
      
      if (!utils.Validator.password(password)) {
        throw new Error('Password troppo corta (min 6 caratteri)');
      }
      
      // Login Firebase
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase login successful:', user.uid);
      
      // Ottieni/Crea dati utente
      const userData = await this.getOrCreateUserData(user);
      
      // Salva in storage
      this.saveUserData(userData);
      
      // Aggiorna stato corrente
      this.currentUser = userData;
      
      utils.Notify.show(`Benvenuto ${userData.displayName}!`, 'success', 2000);
      
      // Prepara redirect
      await this.prepareRedirect(userData);
      
      return userData;
      
    } catch (error) {
      console.error('❌ Login error:', error);
      utils.ErrorHandler.handle(error, 'login');
      throw error;
    }
  }

  async logout() {
    try {
      console.log('🚪 Logout requested');
      utils.Notify.show('Disconnessione...', 'info');
      
      // 1. Pulisci tutto prima del logout
      this.clearUserData();
      
      // 2. Logout Firebase
      await firebase.auth().signOut();
      
      // 3. Redirect immediato (senza attendere)
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 300);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Forza redirect comunque
      window.location.href = 'index.html';
    }
  }

  async checkAuth(required = true) {
    return new Promise((resolve) => {
      console.log('🔍 Checking authentication...');
      
      // 1. Controlla cache locale
      const cachedUser = this.getCachedUser();
      if (cachedUser) {
        console.log('✅ User from cache:', cachedUser.email);
        this.currentUser = cachedUser;
        resolve(cachedUser);
        return;
      }
      
      // 2. Usa onAuthStateChanged per attendere Firebase
      const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
        unsubscribe();
        
        if (!firebaseUser) {
          console.log('❌ No Firebase user found');
          if (required) this.redirectToLogin();
          resolve(null);
          return;
        }
        
        try {
          // 3. Carica dati utente
          const userData = await this.getOrCreateUserData(firebaseUser);
          
          // 4. Salva in cache
          this.saveUserData(userData);
          this.currentUser = userData;
          
          console.log('✅ User authenticated:', userData.email);
          resolve(userData);
          
        } catch (error) {
          console.error('❌ Auth check error:', error);
          if (required) this.redirectToLogin();
          resolve(null);
        }
      });
      
      // Timeout di sicurezza
      setTimeout(() => {
        if (!this.currentUser && required) {
          console.warn('⚠️ Auth check timeout');
          this.redirectToLogin();
        }
        resolve(this.currentUser);
      }, 5000);
    });
  }

  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    const cached = this.getCachedUser();
    if (cached) {
      this.currentUser = cached;
      return cached;
    }
    
    return null;
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }

  // ==================== PRIVATE METHODS ====================

  async getOrCreateUserData(firebaseUser) {
    console.log('📋 Loading user data for:', firebaseUser.uid);
    
    try {
      // Prova a leggere da Firestore
      const userDoc = await firebase.firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .get();
      
      if (userDoc.exists) {
        const data = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: data.displayName || firebaseUser.email.split('@')[0],
          role: data.role || 'employee',
          department: data.department || 'Generale',
          isAdmin: data.role === 'admin',
          lastLogin: new Date().toISOString()
        };
      } else {
        // Crea nuovo documento
        console.log('📝 Creating new user document');
        const defaultData = {
          email: firebaseUser.email,
          displayName: firebaseUser.email.split('@')[0],
          role: 'employee',
          department: 'Generale',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebase.firestore()
          .collection('users')
          .doc(firebaseUser.uid)
          .set(defaultData);
        
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: defaultData.displayName,
          role: 'employee',
          department: 'Generale',
          isAdmin: false,
          lastLogin: new Date().toISOString()
        };
      }
      
    } catch (error) {
      console.warn('⚠️ Firestore error, using fallback:', error);
      // Fallback a dati base
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.email.split('@')[0],
        role: 'employee',
        department: 'Generale',
        isAdmin: false,
        lastLogin: new Date().toISOString()
      };
    }
  }

  saveUserData(userData) {
    console.log('💾 Saving user data:', userData.email);
    
    // Salva in storage multipli
    utils.Storage.set('user', userData);
    localStorage.setItem('lastUserEmail', userData.email);
    localStorage.setItem('lastLogin', new Date().toISOString());
    
    // Salva anche in variabile globale
    window.__USER_DATA = userData;
  }

  getCachedUser() {
    // Prova in ordine: memory → sessionStorage → localStorage
    if (window.__USER_DATA) return window.__USER_DATA;
    
    const sessionUser = utils.Storage.get('user');
    if (sessionUser) {
      window.__USER_DATA = sessionUser;
      return sessionUser;
    }
    
    return null;
  }

  clearUserData() {
    console.log('🧹 Clearing user data');
    
    this.currentUser = null;
    delete window.__USER_DATA;
    
    utils.Storage.remove('user');
    localStorage.removeItem('lastUserEmail');
    localStorage.removeItem('lastLogin');
    
    // Rimuovi tutti i dati di sessione
    sessionStorage.clear();
  }

  async prepareRedirect(userData) {
    console.log('📍 Preparing redirect...');
    
    // Salva flag di redirect in corso
    utils.Storage.set('redirecting', true);
    localStorage.setItem('redirectTarget', userData.isAdmin ? 'admin' : 'dashboard');
    
    // Breve attesa per garantire salvataggio
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Esegui redirect
    const target = userData.isAdmin ? 'admin-dashboard.html' : 'dashboard.html';
    console.log('🚀 Redirecting to:', target);
    
    window.location.href = target;
  }

  redirectToLogin() {
    if (window.location.pathname.includes('index.html')) return;
    
    console.log('🔀 Redirecting to login');
    this.clearUserData();
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 100);
  }

  // ==================== INITIALIZATION ====================

  init() {
    if (this.isInitialized) {
      console.warn('⚠️ Auth already initialized');
      return;
    }
    
    console.log('🔧 Initializing auth system...');
    
    // Controlla se c'è un redirect in corso
    const wasRedirecting = utils.Storage.get('redirecting');
    if (wasRedirecting) {
      console.log('🔄 Resuming from redirect...');
      utils.Storage.remove('redirecting');
    }
    
    this.isInitialized = true;
    console.log('✅ Auth system initialized');
  }
}

// ==================== GLOBAL INSTANCE ====================

const auth = new AuthSystem();

// Inizializza al caricamento
document.addEventListener('DOMContentLoaded', () => {
  auth.init();
});

// Export globale
window.auth = {
  // Metodi principali
  login: (email, password) => auth.login(email, password),
  logout: () => auth.logout(),
  checkAuth: (required) => auth.checkAuth(required),
  getCurrentUser: () => auth.getCurrentUser(),
  isAdmin: () => auth.isAdmin(),
  
  // Per debug
  _instance: auth
};

console.log('✅ Auth System v4.0 ready');  