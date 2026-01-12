// js/auth.js - VERSIONE SEMPLIFICATA GRATUITA
console.log('🔐 Auth semplice caricato');

let currentUserData = null;

// Login semplice
async function loginUser(email, password) {
    try {
        showNotification('Accesso in corso...', 'info');
        
        // 1. Login Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Login riuscito:', email);
        
        // 2. Ottieni ruolo da Firestore
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();
        
        let role = 'employee';
        let displayName = user.displayName || email.split('@')[0];
        
        if (userDoc.exists) {
            const data = userDoc.data();
            role = data.role || 'employee';
            displayName = data.displayName || displayName;
        } else {
            // Se non esiste documento, crea uno default
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .set({
                    email: email,
                    displayName: displayName,
                    role: 'employee',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
        }
        
        // Salva dati in sessionStorage
        currentUserData = {
            uid: user.uid,
            email: email,
            displayName: displayName,
            role: role,
            isAdmin: role === 'admin'
        };
        
        sessionStorage.setItem('userData', JSON.stringify(currentUserData));
        
        showNotification(`Benvenuto ${displayName}!`, 'success');
        
        // Reindirizza
setTimeout(() => {
    if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';  // ← PER ADMIN
    } else {
        window.location.href = 'dashboard.html';         // ← PER DIPENDENTI
    }
}, 1500);
        
        return currentUserData;
        
    } catch (error) {
        console.error('❌ ERRORE LOGIN:', error);
        
        let errorMessage = 'Errore accesso';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Email o password errati';
        }
        
        showNotification(errorMessage, 'error');
        throw error;
    }
}

// Logout
async function logoutUser() {
    try {
        await firebase.auth().signOut();
        currentUserData = null;
        sessionStorage.removeItem('userData');
        
        showNotification('Logout effettuato', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
        
    } catch (error) {
        console.error('❌ Errore logout:', error);
    }
}

// Controlla autenticazione
async function checkAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'index.html';
                reject('Utente non autenticato');
                return;
            }
            
            // Ottieni dati utente
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .get();
            
            const data = userDoc.exists ? userDoc.data() : {};
            
            currentUserData = {
                uid: user.uid,
                email: user.email,
                displayName: data.displayName || user.displayName || user.email.split('@')[0],
                role: data.role || 'employee',
                isAdmin: data.role === 'admin'
            };
            
            sessionStorage.setItem('userData', JSON.stringify(currentUserData));
            
            console.log('✅ Utente autenticato:', currentUserData.email, 'ruolo:', currentUserData.role);
            resolve(currentUserData);
        });
    });
}

// Funzioni helper
function getCurrentUser() {
    if (currentUserData) return currentUserData;
    
    const saved = sessionStorage.getItem('userData');
    if (saved) {
        currentUserData = JSON.parse(saved);
        return currentUserData;
    }
    
    return null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user ? user.role === 'admin' : false;
}

// Setup iniziale
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Sistema auth pronto');
});

// Esporta
window.auth = {
    loginUser,
    logoutUser,
    checkAuth,
    getCurrentUser,
    isAdmin
};