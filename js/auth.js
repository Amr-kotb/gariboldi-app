// js/auth.js - VERSIONE COMPLETA FIXATA
console.log('🔐 Auth System v2.0 loaded');

let currentUserData = null;
let authStateUnsubscribe = null;
let isInitialized = false;

// ==================== SISTEMA CENTRALIZZATO ====================

// Inizializza il sistema di autenticazione
function initializeAuthSystem() {
    if (isInitialized) {
        console.log('⚠️ Auth system già inizializzato');
        return;
    }
    
    console.log('🔧 Inizializzazione sistema auth...');
    
    // Setup listener per cambiamenti di stato
    setupAuthListener();
    
    // Controlla stato corrente
    checkCurrentAuthState();
    
    isInitialized = true;
    console.log('✅ Sistema auth inizializzato');
}

// Setup listener per auth state
function setupAuthListener() {
    // Rimuovi listener precedente se esiste
    if (authStateUnsubscribe) {
        console.log('🔄 Rimozione vecchio listener...');
        authStateUnsubscribe();
    }
    
    console.log('👂 Creazione nuovo auth listener...');
    
    // Crea nuovo listener
    authStateUnsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
        console.log('🔥 Auth state changed:', firebaseUser ? `User ${firebaseUser.email}` : 'No user');
        
        if (firebaseUser) {
            await handleUserAuthenticated(firebaseUser);
        } else {
            handleUserLoggedOut();
        }
    });
}

// Gestisce utente autenticato
async function handleUserAuthenticated(firebaseUser) {
    try {
        console.log('👤 Gestione utente autenticato:', firebaseUser.uid);
        
        // Ottieni dati utente da Firestore
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();
        
        let userData = {};
        
        if (userDoc.exists) {
            // Utente esiste in Firestore
            userData = userDoc.data();
            console.log('📄 Dati Firestore trovati');
            
            // Aggiorna lastLogin
            await userDoc.ref.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Utente non esiste in Firestore - crea documento
            console.log('📝 Creazione nuovo documento utente in Firestore');
            
            userData = {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                role: 'employee',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await firebase.firestore()
                .collection('users')
                .doc(firebaseUser.uid)
                .set(userData);
        }
        
        // Salva in memoria
        currentUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData.displayName || firebaseUser.email.split('@')[0],
            role: userData.role || 'employee',
            isAdmin: (userData.role || 'employee') === 'admin'
        };
        
        // Salva in sessionStorage
        sessionStorage.setItem('userData', JSON.stringify(currentUserData));
        console.log('💾 Dati salvati in cache:', currentUserData.email);
        
        // Se siamo su index.html, reindirizza
        if (window.location.pathname.includes('index.html')) {
            console.log('🔄 Reindirizzamento da login page...');
            redirectBasedOnRole(currentUserData.role);
        }
        
    } catch (error) {
        console.error('❌ Errore gestione utente:', error);
        showNotification('Errore caricamento dati utente', 'error');
    }
}

// Gestisce logout utente
function handleUserLoggedOut() {
    console.log('👋 Utente disconnesso');
    
    // Pulisci dati
    currentUserData = null;
    sessionStorage.removeItem('userData');
    
    // Se siamo in una pagina protetta, reindirizza al login
    if (isProtectedPage()) {
        console.log('🚫 Pagina protetta senza login, redirect...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// ==================== FUNZIONI PRINCIPALI ====================

// Login con email/password
async function loginUser(email, password) {
    try {
        console.log('🔑 Tentativo login:', email);
        showNotification('Accesso in corso...', 'info');
        
        // Effettua login con Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('✅ Login Firebase completato');
        
        // Il listener onAuthStateChanged gestirà il resto
        return userCredential.user;
        
    } catch (error) {
        console.error('❌ Errore login:', error);
        
        let errorMessage = 'Errore durante il login';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Utente non trovato';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Password errata';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Troppi tentativi, riprova più tardi';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Account disabilitato';
                break;
        }
        
        showNotification(errorMessage, 'error');
        throw error;
    }
}

// Logout immediato
async function logoutUser() {
    try {
        console.log('🚪 Richiesta logout...');
        showNotification('Disconnessione in corso...', 'info');
        
        // Rimuovi listener per evitare loop
        if (authStateUnsubscribe) {
            authStateUnsubscribe();
            authStateUnsubscribe = null;
        }
        
        // Effettua logout Firebase
        await firebase.auth().signOut();
        console.log('✅ Logout Firebase completato');
        
        // Pulisci cache
        currentUserData = null;
        sessionStorage.clear();
        
        // Reindirizza immediatamente
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
        
    } catch (error) {
        console.error('❌ Errore logout:', error);
        // Forza reindirizzamento comunque
        window.location.href = 'index.html';
    }
}

// Verifica autenticazione per pagine protette
async function checkAuth() {
    return new Promise((resolve) => {
        const user = getCurrentUser();
        const firebaseUser = firebase.auth().currentUser;
        
        if (user && firebaseUser) {
            console.log('✅ Utente autenticato:', user.email);
            resolve(user);
        } else if (isProtectedPage() && !firebaseUser) {
            console.log('❌ Pagina protetta senza autenticazione');
            showNotification('Accesso richiesto', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            resolve(null);
        } else {
            console.log('⚠️ Stato autenticazione: indeterminato');
            resolve(null);
        }
    });
}

// ==================== UTILITY FUNCTIONS ====================

// Ottieni utente corrente
function getCurrentUser() {
    // Prima controlla in memoria
    if (currentUserData) return currentUserData;
    
    // Poi controlla sessionStorage
    try {
        const saved = sessionStorage.getItem('userData');
        if (saved) {
            currentUserData = JSON.parse(saved);
            return currentUserData;
        }
    } catch (e) {
        console.error('Errore lettura userData:', e);
    }
    
    return null;
}

// Controlla se è admin
function isAdmin() {
    const user = getCurrentUser();
    return user ? user.role === 'admin' : false;
}

// Controlla se la pagina è protetta
function isProtectedPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = [
        'dashboard.html',
        'admin-dashboard.html',
        'my-tasks.html',
        'profile.html',
        'add-task.html',
        'admin-stats.html',
        'admin-trash.html'
    ];
    
    return protectedPages.includes(currentPage);
}

// Reindirizza in base al ruolo
function redirectBasedOnRole(role) {
    console.log('📍 Reindirizzamento per ruolo:', role);
    
    if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

// Controlla stato auth corrente
function checkCurrentAuthState() {
    const firebaseUser = firebase.auth().currentUser;
    const cachedUser = getCurrentUser();
    
    console.log('🔍 Controllo stato auth:');
    console.log('  - Firebase user:', firebaseUser ? 'Presente' : 'Assente');
    console.log('  - Cached user:', cachedUser ? 'Presente' : 'Assente');
    
    // Se c'è discrepanza, risincronizza
    if (firebaseUser && !cachedUser) {
        console.log('🔄 Sincronizzazione necessaria...');
        handleUserAuthenticated(firebaseUser);
    } else if (!firebaseUser && cachedUser) {
        console.log('🔄 Pulizia cache...');
        currentUserData = null;
        sessionStorage.removeItem('userData');
    }
}

// ==================== INIZIALIZZAZIONE ====================

// Setup quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM caricato, inizializzazione auth...');
    
    // Aspetta che Firebase sia pronto
    if (firebase.apps.length > 0) {
        initializeAuthSystem();
    } else {
        console.warn('⚠️ Firebase non inizializzato, ritento...');
        setTimeout(initializeAuthSystem, 1000);
    }
});

// Esporta funzioni globalmente
window.auth = {
    // Funzioni principali
    loginUser,
    logoutUser,
    checkAuth,
    
    // Utility
    getCurrentUser,
    isAdmin,
    
    // Debug
    _getCurrentUserData: () => currentUserData,
    _forceLogout: logoutUser
};

console.log('✅ Auth System ready');