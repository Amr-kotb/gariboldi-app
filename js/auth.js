// auth.js - SESSIONI ISOLATE PER TAB
// ================================================

// Cache in memoria PER QUESTA TAB
let sessionCache = {
    user: null,
    role: null,
    tabId: null,
    lastUpdate: null
};

// Genera ID unico per questa tab
function generateTabId() {
    if (!sessionStorage.getItem('tabId')) {
        const tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('tabId', tabId);
        console.log('📱 ID Tab generato:', tabId);
    }
    return sessionStorage.getItem('tabId');
}

// Verifica se questa tab ha una sessione valida
function hasValidSession() {
    const tabId = sessionStorage.getItem('tabId');
    const userData = sessionStorage.getItem('userData');
    
    return tabId && userData;
}

// Login con gestione sessioni per tab
async function loginUser(email, password) {
    try {
        console.log('🔐 Tentativo login per:', email);
        showNotification('Accesso in corso...', 'info');
        
        // Genera nuovo ID tab per questa sessione
        const tabId = generateTabId();
        
        // Login Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Login Firebase riuscito, tab:', tabId);
        
        // Ottieni dati da Firestore
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();
        
        let userData = {};
        if (userDoc.exists) {
            userData = userDoc.data();
        } else {
            // Crea documento se non esiste
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .set({
                    email: user.email,
                    displayName: user.email.split('@')[0],
                    role: 'employee',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            userData = { role: 'employee' };
        }
        
        // Salva dati SPECIFICI PER QUESTA TAB
        const userSessionData = {
            uid: user.uid,
            email: user.email,
            displayName: userData.displayName || user.email.split('@')[0],
            role: userData.role || 'employee',
            tabId: tabId,
            loginTime: Date.now()
        };
        
        // Salva in sessionStorage (ISOLATO per tab)
        sessionStorage.setItem('userData', JSON.stringify(userSessionData));
        sessionStorage.setItem('tabId', tabId);
        sessionStorage.setItem('authTimestamp', Date.now().toString());
        
        // Salva in cache memoria
        sessionCache = {
            user: userSessionData,
            role: userData.role || 'employee',
            tabId: tabId,
            lastUpdate: Date.now()
        };
        
        showNotification(`Benvenuto ${sessionCache.user.displayName}!`, 'success');
        
        // Reindirizza alla dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return userSessionData;
        
    } catch (error) {
        console.error('❌ ERRORE LOGIN:', error);
        
        let errorMessage = 'Errore durante l\'accesso';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Utente non trovato';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Password errata';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email non valida';
                break;
            default:
                errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        throw error;
    }
}

// Logout SOLO per questa tab
function logoutUser() {
    const currentTabId = sessionStorage.getItem('tabId');
    console.log('🚪 Logout per tab:', currentTabId);
    
    // Pulisci SOLO questa tab
    sessionCache = { user: null, role: null, tabId: null, lastUpdate: null };
    sessionStorage.clear(); // Pulisci solo sessionStorage di questa tab
    
    // Segnala che questa tab ha fatto logout
    localStorage.setItem(`tab_${currentTabId}_logout`, Date.now().toString());
    
    // Logout Firebase (questo influenzerà tutte le tab)
    firebase.auth().signOut().then(() => {
        showNotification('Logout effettuato.', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }).catch((error) => {
        console.error('Errore logout:', error);
        showNotification('Errore durante il logout.', 'error');
    });
}

// Controlla autenticazione CON VERIFICA TAB
async function checkAuth() {
    const currentTabId = generateTabId();
    
    return new Promise((resolve, reject) => {
        // Timeout per evitare blocchi
        const authCheckTimeout = setTimeout(() => {
            unsubscribe();
            reject(new Error('Timeout controllo autenticazione'));
        }, 5000);
        
        const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
            clearTimeout(authCheckTimeout);
            
            // Prima verifica: controllo rapido se abbiamo già una sessione valida in questa tab
            const existingSession = sessionStorage.getItem('userData');
            if (existingSession && !firebaseUser) {
                console.log('⚠ Sessione locale trovata ma Firebase non autenticato');
                // Abbiamo una sessione locale ma Firebase dice che non siamo loggati
                // Potrebbe essere un cambio utente in un'altra tab
                sessionStorage.clear();
                sessionCache = { user: null, role: null, tabId: null, lastUpdate: null };
                window.location.href = 'index.html';
                return;
            }
            
            if (!firebaseUser) {
                console.log('❌ Nessun utente Firebase autenticato');
                // Pulisci sessione locale
                sessionStorage.removeItem('userData');
                sessionCache = { user: null, role: null, tabId: null, lastUpdate: null };
                
                // Reindirizza al login
                window.location.href = 'index.html';
                reject(new Error('Utente non autenticato'));
                return;
            }
            
            try {
                // Verifica se abbiamo già i dati per questo utente in questa tab
                const sessionData = sessionStorage.getItem('userData');
                if (sessionData) {
                    const parsedData = JSON.parse(sessionData);
                    if (parsedData.uid === firebaseUser.uid && parsedData.tabId === currentTabId) {
                        console.log('✅ Sessione locale valida trovata per tab:', currentTabId);
                        sessionCache = {
                            user: parsedData,
                            role: parsedData.role,
                            tabId: currentTabId,
                            lastUpdate: Date.now()
                        };
                        resolve({
                            user: parsedData,
                            role: parsedData.role
                        });
                        return;
                    }
                }
                
                // Se non abbiamo una sessione valida, ottieni i dati da Firestore
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(firebaseUser.uid)
                    .get();
                
                if (!userDoc.exists) {
                    console.log('⚠ Documento utente non trovato');
                    await logoutUser();
                    reject(new Error('Profilo non trovato'));
                    return;
                }
                
                const userData = userDoc.data();
                
                // Crea nuova sessione per questa tab
                const userSessionData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: userData.displayName || firebaseUser.email.split('@')[0],
                    role: userData.role || 'employee',
                    tabId: currentTabId,
                    loginTime: Date.now()
                };
                
                // Salva in sessionStorage
                sessionStorage.setItem('userData', JSON.stringify(userSessionData));
                sessionStorage.setItem('tabId', currentTabId);
                
                // Salva in cache
                sessionCache = {
                    user: userSessionData,
                    role: userData.role || 'employee',
                    tabId: currentTabId,
                    lastUpdate: Date.now()
                };
                
                console.log('✅ Nuova sessione creata per tab:', currentTabId);
                resolve({
                    user: userSessionData,
                    role: userData.role || 'employee'
                });
                
            } catch (error) {
                console.error('❌ Errore checkAuth:', error);
                // Pulisci sessione locale
                sessionStorage.removeItem('userData');
                sessionCache = { user: null, role: null, tabId: null, lastUpdate: null };
                window.location.href = 'index.html';
                reject(error);
            }
        });
    });
}

// Ottieni utente corrente per questa tab
function getCurrentUser() {
    // Prima controlla cache in memoria
    if (sessionCache.user && sessionCache.tabId === sessionStorage.getItem('tabId')) {
        const cacheAge = Date.now() - sessionCache.lastUpdate;
        if (cacheAge < 5 * 60 * 1000) { // 5 minuti
            return sessionCache.user;
        }
    }
    
    // Fallback su sessionStorage
    const sessionData = sessionStorage.getItem('userData');
    const currentTabId = sessionStorage.getItem('tabId');
    
    if (sessionData && currentTabId) {
        const parsedData = JSON.parse(sessionData);
        if (parsedData.tabId === currentTabId) {
            // Aggiorna cache
            sessionCache = {
                user: parsedData,
                role: parsedData.role,
                tabId: currentTabId,
                lastUpdate: Date.now()
            };
            return parsedData;
        }
    }
    
    return null;
}

// Verifica se l'utente è admin (per questa tab)
function isAdmin() {
    const user = getCurrentUser();
    return user ? user.role === 'admin' : false;
}

// Ottieni ruolo corrente
function getCurrentRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

// Ascolta cambiamenti in altre tab (per gestire cambio utente)
function setupCrossTabListener() {
    // Solo in dashboard e pagine protette
    if (!window.location.pathname.includes('index.html')) {
        window.addEventListener('storage', function(event) {
            if (event.key && event.key.startsWith('tab_') && event.key.endsWith('_logout')) {
                const loggedOutTabId = event.key.replace('tab_', '').replace('_logout', '');
                const currentTabId = sessionStorage.getItem('tabId');
                
                if (loggedOutTabId !== currentTabId) {
                    console.log('⚠ Rilevato logout in altra tab:', loggedOutTabId);
                    // Verifica se siamo ancora autenticati
                    firebase.auth().currentUser?.reload().then(() => {
                        const currentFirebaseUser = firebase.auth().currentUser;
                        if (!currentFirebaseUser) {
                            console.log('🔄 Utente disconnesso in tutte le tab');
                            logoutUser();
                        }
                    });
                }
            }
        });
    }
}

// Inizializza al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    setupCrossTabListener();
    
    // Auto-logout dopo inattività (30 minuti) - SOLO per questa tab
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            console.log('⚠ Auto-logout per inattività, tab:', sessionStorage.getItem('tabId'));
            showNotification('Sessione scaduta per inattività', 'warning');
            logoutUser();
        }, 30 * 60 * 1000); // 30 minuti
    }
    
    // Rileva attività utente
    ['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });
    
    resetInactivityTimer();
});