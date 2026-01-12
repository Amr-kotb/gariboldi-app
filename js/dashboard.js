// js/dashboard.js - VERSIONE SEMPLIFICATA FUNZIONANTE
console.log('🚀 Dashboard.js caricato');

// Cache dati
let currentUser = null;
let userTasks = [];

// Inizializzazione dashboard
async function initDashboard() {
    console.log('🔐 Inizializzazione dashboard...');
    
    try {
        // 1. Controlla autenticazione
        currentUser = await checkAuthSimple();
        if (!currentUser) {
            console.log('❌ Utente non autenticato');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ Utente autenticato:', currentUser.email, 'Ruolo:', currentUser.role);
        
        // 2. Mostra informazioni utente
        updateUI();
        
        // 3. Carica dati
        await loadDashboardData();
        
        console.log('✅ Dashboard inizializzata con successo');
        
    } catch (error) {
        console.error('❌ Errore inizializzazione:', error);
        showNotification('Errore caricamento dashboard', 'error');
    }
}

// Controllo autenticazione semplice
async function checkAuthSimple() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                resolve(null);
                return;
            }
            
            try {
                // Ottieni dati da Firestore
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(user.uid)
                    .get();
                
                const userData = userDoc.exists ? userDoc.data() : {};
                
                resolve({
                    uid: user.uid,
                    email: user.email,
                    displayName: userData.displayName || user.displayName || user.email.split('@')[0],
                    role: userData.role || 'employee',
                    isAdmin: userData.role === 'admin'
                });
                
            } catch (error) {
                console.error('Errore recupero dati utente:', error);
                resolve(null);
            }
        });
    });
}

// Aggiorna UI
function updateUI() {
    // Benvenuto
    const welcomeEl = document.getElementById('welcome-message') || 
                      document.getElementById('user-name') ||
                      document.querySelector('.welcome-text');
    
    if (welcomeEl) {
        welcomeEl.textContent = `Benvenuto, ${currentUser.displayName}`;
    }
    
    // Se è admin, mostra link
    if (currentUser.role === 'admin') {
        const adminSection = document.getElementById('admin-section');
        if (adminSection) {
            adminSection.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-crown"></i> Sei un amministratore
                    <a href="admin-dashboard.html" class="btn btn-sm btn-primary ms-3">
                        Vai alla Dashboard Admin
                    </a>
                </div>
            `;
        }
    }
}

// Carica dati dashboard
async function loadDashboardData() {
    try {
        console.log('📊 Caricamento dati dashboard...');
        
        // 1. Carica statistiche
        await loadStats();
        
        // 2. Carica task assegnate
        await loadUserTasks();
        
        // 3. Carica notifiche
        await loadNotifications();
        
    } catch (error) {
        console.error('❌ Errore caricamento dati:', error);
    }
}

// Carica statistiche
async function loadStats() {
    try {
        const statsElement = document.getElementById('stats-container');
        if (!statsElement) return;
        
        // Task totali
        const tasksSnapshot = await firebase.firestore()
            .collection('tasks')
            .where('assignedTo', '==', currentUser.uid)
            .get();
        
        const completedTasks = tasksSnapshot.docs.filter(doc => 
            doc.data().status === 'completed'
        ).length;
        
        const pendingTasks = tasksSnapshot.docs.filter(doc => 
            doc.data().status === 'pending'
        ).length;
        
        statsElement.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${tasksSnapshot.size}</h3>
                    <p>Task Totali</p>
                </div>
                <div class="stat-card">
                    <h3>${completedTasks}</h3>
                    <p>Completate</p>
                </div>
                <div class="stat-card">
                    <h3>${pendingTasks}</h3>
                    <p>In Attesa</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Errore statistiche:', error);
    }
}

// Carica task utente
async function loadUserTasks() {
    try {
        const tasksContainer = document.getElementById('tasks-container');
        if (!tasksContainer) return;
        
        tasksContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Caricamento task...</p>';
        
        const snapshot = await firebase.firestore()
            .collection('tasks')
            .where('assignedTo', '==', currentUser.uid)
            .orderBy('dueDate', 'asc')
            .limit(10)
            .get();
        
        if (snapshot.empty) {
            tasksContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Nessuna task assegnata
                </div>
            `;
            return;
        }
        
        let tasksHTML = '<h4>📋 Le Tue Task</h4><div class="tasks-list">';
        
        snapshot.forEach(doc => {
            const task = doc.data();
            tasksHTML += `
                <div class="task-item">
                    <h5>${task.title}</h5>
                    <p>${task.description || ''}</p>
                    <small>Scadenza: ${task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'N/D'}</small>
                </div>
            `;
        });
        
        tasksHTML += '</div>';
        tasksContainer.innerHTML = tasksHTML;
        
    } catch (error) {
        console.error('❌ Errore caricamento task:', error);
        document.getElementById('tasks-container').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> Errore caricamento task
            </div>
        `;
    }
}

// Carica notifiche
async function loadNotifications() {
    // Implementa se necessario
}

// Inizializza al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Pagina dashboard caricata');
    setTimeout(() => initDashboard(), 500);
});

// Esporta per debug
window.dashboard = {
    initDashboard,
    loadUserTasks,
    loadStats
};