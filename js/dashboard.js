// js/dashboard.js - VERSIONE COMPLETA FIXATA
console.log('🚀 Dashboard System v2.0 loaded');

let currentUser = null;
let isLoading = false;

// ==================== INIZIALIZZAZIONE ====================

// Inizializza la dashboard
async function initDashboard() {
    if (isLoading) {
        console.log('⚠️ Dashboard già in caricamento');
        return;
    }
    
    isLoading = true;
    console.log('🔧 Inizializzazione dashboard...');
    
    try {
        // 1. Verifica autenticazione
        await verifyAuthentication();
        
        // 2. Carica dati utente
        await loadUserData();
        
        // 3. Aggiorna UI
        updateUI();
        
        // 4. Carica dati dashboard
        await loadDashboardData();
        
        console.log('✅ Dashboard inizializzata con successo');
        showNotification('Dashboard caricata', 'success');
        
    } catch (error) {
        console.error('❌ Errore inizializzazione dashboard:', error);
        handleDashboardError(error);
    } finally {
        isLoading = false;
    }
}

// Verifica autenticazione
async function verifyAuthentication() {
    console.log('🔐 Verifica autenticazione...');
    
    const firebaseUser = firebase.auth().currentUser;
    if (!firebaseUser) {
        console.error('❌ Nessun utente Firebase autenticato');
        showNotification('Accesso non valido', 'error');
        window.location.href = 'index.html';
        throw new Error('User not authenticated');
    }
    
    console.log('✅ Utente Firebase presente:', firebaseUser.email);
    return true;
}

// Carica dati utente
async function loadUserData() {
    console.log('👤 Caricamento dati utente...');
    
    // Prova a ottenere da auth system
    if (window.auth && auth.getCurrentUser) {
        currentUser = auth.getCurrentUser();
    }
    
    // Se non disponibile, carica da Firestore
    if (!currentUser) {
        const firebaseUser = firebase.auth().currentUser;
        if (!firebaseUser) return;
        
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(firebaseUser.uid)
                .get();
            
            if (userDoc.exists) {
                const data = userDoc.data();
                currentUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: data.displayName || firebaseUser.email.split('@')[0],
                    role: data.role || 'employee',
                    isAdmin: data.role === 'admin'
                };
                
                // Salva in cache per uso futuro
                sessionStorage.setItem('userData', JSON.stringify(currentUser));
            }
        } catch (error) {
            console.error('❌ Errore caricamento dati utente:', error);
            // Crea dati di default
            currentUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.email.split('@')[0],
                role: 'employee',
                isAdmin: false
            };
        }
    }
    
    if (!currentUser) {
        throw new Error('Impossibile caricare dati utente');
    }
    
    console.log('✅ Dati utente caricati:', currentUser.email);
    return currentUser;
}

// ==================== UI FUNCTIONS ====================

// Aggiorna interfaccia utente
function updateUI() {
    if (!currentUser) {
        console.error('❌ currentUser non definito in updateUI');
        return;
    }
    
    console.log('🎨 Aggiornamento UI per:', currentUser.displayName);
    
    // 1. Aggiorna benvenuto
    updateWelcomeMessage();
    
    // 2. Mostra sezione admin se necessario
    updateAdminSection();
    
    // 3. Aggiorna header
    updateHeader();
}

// Aggiorna messaggio di benvenuto
function updateWelcomeMessage() {
    const elements = [
        document.getElementById('welcome-message'),
        document.getElementById('user-name'),
        document.querySelector('.welcome-text'),
        document.querySelector('h1'),
        document.querySelector('.user-greeting')
    ].filter(el => el);
    
    if (elements.length > 0) {
        elements.forEach(el => {
            el.textContent = `Benvenuto, ${currentUser.displayName}`;
        });
        console.log('✅ Messaggio benvenuto aggiornato');
    } else {
        console.warn('⚠️ Nessun elemento per il benvenuto trovato');
    }
}

// Aggiorna sezione admin
function updateAdminSection() {
    if (!currentUser.isAdmin) return;
    
    console.log('👑 Utente è admin, aggiorno sezione');
    
    const adminElements = [
        document.getElementById('admin-section'),
        document.querySelector('.admin-notice'),
        document.querySelector('.admin-panel')
    ].filter(el => el);
    
    if (adminElements.length > 0) {
        adminElements.forEach(el => {
            el.innerHTML = `
                <div class="admin-alert" style="background: #e3f2fd; border-left: 4px solid #2196f3; 
                        padding: 12px; margin: 15px 0; border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-crown" style="color: #ff9800; font-size: 1.2em;"></i>
                        <strong style="color: #1976d2;">Sei un amministratore</strong>
                        <a href="admin-dashboard.html" 
                           style="margin-left: auto; background: #2196f3; color: white; 
                                  padding: 6px 12px; border-radius: 4px; text-decoration: none;">
                            <i class="fas fa-tachometer-alt"></i> Vai alla Dashboard Admin
                        </a>
                    </div>
                </div>
            `;
        });
    }
}

// Aggiorna header
function updateHeader() {
    const userInfoElements = [
        document.getElementById('user-info'),
        document.querySelector('.user-profile'),
        document.querySelector('.current-user')
    ].filter(el => el);
    
    if (userInfoElements.length > 0) {
        userInfoElements.forEach(el => {
            el.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 40px; background: #4caf50; 
                                border-radius: 50%; display: flex; align-items: center; 
                                justify-content: center; color: white; font-weight: bold;">
                        ${currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: bold;">${currentUser.displayName}</div>
                        <div style="font-size: 0.8em; color: #666;">${currentUser.role}</div>
                    </div>
                </div>
            `;
        });
    }
}

// ==================== DATA LOADING ====================

// Carica tutti i dati della dashboard
async function loadDashboardData() {
    console.log('📊 Caricamento dati dashboard...');
    
    try {
        // Carica statistiche
        await loadStatistics();
        
        // Carica task
        await loadUserTasks();
        
        // Carica attività recenti
        await loadRecentActivity();
        
        console.log('✅ Tutti i dati caricati');
        
    } catch (error) {
        console.error('❌ Errore caricamento dati:', error);
        throw error;
    }
}

// Carica statistiche
async function loadStatistics() {
    try {
        const statsElement = document.getElementById('stats-container');
        if (!statsElement) {
            console.warn('⚠️ Elemento stats-container non trovato');
            return;
        }
        
        console.log('📈 Caricamento statistiche...');
        
        // Query per task assegnate
        const tasksQuery = firebase.firestore()
            .collection('tasks')
            .where('assignedTo', '==', currentUser.uid);
        
        const snapshot = await tasksQuery.get();
        
        const totalTasks = snapshot.size;
        const completedTasks = snapshot.docs.filter(doc => 
            doc.data().status === 'completed'
        ).length;
        const pendingTasks = snapshot.docs.filter(doc => 
            doc.data().status === 'pending' || doc.data().status === 'in-progress'
        ).length;
        
        // Calcola percentuale completamento
        const completionRate = totalTasks > 0 ? 
            Math.round((completedTasks / totalTasks) * 100) : 0;
        
        statsElement.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card total-tasks">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${totalTasks}</h3>
                        <p>Task Totali</p>
                    </div>
                </div>
                
                <div class="stat-card completed-tasks">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${completedTasks}</h3>
                        <p>Completate</p>
                    </div>
                </div>
                
                <div class="stat-card pending-tasks">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${pendingTasks}</h3>
                        <p>In Attesa</p>
                    </div>
                </div>
                
                <div class="stat-card completion-rate">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${completionRate}%</h3>
                        <p>Tasso Completamento</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log(`✅ Statistiche caricate: ${totalTasks} task totali`);
        
    } catch (error) {
        console.error('❌ Errore caricamento statistiche:', error);
        throw error;
    }
}

// Carica task dell'utente
async function loadUserTasks() {
    try {
        const tasksContainer = document.getElementById('tasks-container');
        if (!tasksContainer) {
            console.warn('⚠️ Elemento tasks-container non trovato');
            return;
        }
        
        // Mostra loader
        tasksContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Caricamento task in corso...</p>
            </div>
        `;
        
        console.log('📋 Caricamento task utente...');
        
        // Query per task assegnate all'utente, ordinate per scadenza
        const tasksQuery = firebase.firestore()
            .collection('tasks')
            .where('assignedTo', '==', currentUser.uid)
            .orderBy('dueDate', 'asc')
            .limit(15);
        
        const snapshot = await tasksQuery.get();
        
        if (snapshot.empty) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h4>Nessuna task assegnata</h4>
                    <p>Non hai task assegnate al momento.</p>
                    <a href="add-task.html" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Crea Nuova Task
                    </a>
                </div>
            `;
            console.log('✅ Nessuna task trovata');
            return;
        }
        
        // Prepara HTML per le task
        let tasksHTML = `
            <div class="tasks-header">
                <h3>
                    <i class="fas fa-list-check"></i>
                    Le Tue Task (${snapshot.size})
                </h3>
                <a href="my-tasks.html" class="view-all-link">
                    Vedi tutte <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <div class="tasks-list">
        `;
        
        snapshot.forEach(doc => {
            const task = doc.data();
            const taskId = doc.id;
            const dueDate = task.dueDate ? 
                new Date(task.dueDate.seconds * 1000) : null;
            
            // Determina colore in base alla priorità
            let priorityColor = '#4caf50'; // Default: verde
            if (task.priority === 'high') priorityColor = '#f44336';
            else if (task.priority === 'medium') priorityColor = '#ff9800';
            else if (task.priority === 'low') priorityColor = '#2196f3';
            
            // Determina icona in base allo stato
            let statusIcon = 'fa-clock';
            if (task.status === 'completed') statusIcon = 'fa-check-circle';
            else if (task.status === 'in-progress') statusIcon = 'fa-spinner';
            
            tasksHTML += `
                <div class="task-item" data-task-id="${taskId}">
                    <div class="task-header">
                        <div class="task-title">
                            <i class="fas ${statusIcon}"></i>
                            <h4>${task.title || 'Senza titolo'}</h4>
                        </div>
                        <div class="task-priority" style="background: ${priorityColor}">
                            ${task.priority || 'normal'}
                        </div>
                    </div>
                    
                    <div class="task-body">
                        <p>${task.description || 'Nessuna descrizione'}</p>
                    </div>
                    
                    <div class="task-footer">
                        <div class="task-due">
                            <i class="far fa-calendar"></i>
                            <span>${dueDate ? dueDate.toLocaleDateString('it-IT') : 'Nessuna scadenza'}</span>
                        </div>
                        <div class="task-actions">
                            <button onclick="viewTask('${taskId}')" class="btn-view">
                                <i class="fas fa-eye"></i> Dettagli
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        tasksHTML += `</div>`;
        tasksContainer.innerHTML = tasksHTML;
        
        console.log(`✅ ${snapshot.size} task caricate`);
        
    } catch (error) {
        console.error('❌ Errore caricamento task:', error);
        document.getElementById('tasks-container').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Errore nel caricamento delle task</h4>
                <p>${error.message}</p>
                <button onclick="loadUserTasks()" class="btn btn-retry">
                    <i class="fas fa-redo"></i> Riprova
                </button>
            </div>
        `;
        throw error;
    }
}

// Carica attività recenti
async function loadRecentActivity() {
    // Implementazione base - puoi espandere
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    activityContainer.innerHTML = `
        <div class="activity-list">
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="activity-content">
                    <p>Accesso effettuato correttamente</p>
                    <span>${new Date().toLocaleTimeString('it-IT')}</span>
                </div>
            </div>
        </div>
    `;
}

// ==================== ERROR HANDLING ====================

// Gestisci errori della dashboard
function handleDashboardError(error) {
    console.error('🚨 Errore dashboard:', error);
    
    const mainContainer = document.querySelector('main') || document.body;
    
    mainContainer.innerHTML = `
        <div class="error-container" style="padding: 40px; text-align: center;">
            <div style="font-size: 4em; color: #f44336; margin-bottom: 20px;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2 style="color: #333; margin-bottom: 10px;">Errore nel caricamento della dashboard</h2>
            <p style="color: #666; margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto;">
                Si è verificato un errore durante il caricamento della dashboard.
                ${error.message ? `<br><small>${error.message}</small>` : ''}
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="location.reload()" 
                        style="background: #2196f3; color: white; border: none; 
                               padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-redo"></i> Ricarica Pagina
                </button>
                <button onclick="window.location.href='index.html'" 
                        style="background: #757575; color: white; border: none; 
                               padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-sign-out-alt"></i> Torna al Login
                </button>
            </div>
        </div>
    `;
}

// ==================== UTILITY FUNCTIONS ====================

// Visualizza dettagli task
function viewTask(taskId) {
    console.log('🔍 Visualizzazione task:', taskId);
    // Implementa la visualizzazione dettagliata della task
    showNotification('Funzionalità in sviluppo', 'info');
}

// ==================== INIZIALIZZAZIONE ====================

// Inizializza al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Dashboard DOM ready');
    
    // Aspetta un momento per assicurarsi che tutto sia caricato
    setTimeout(() => {
        initDashboard();
    }, 100);
});

// Aggiungi stili inline se non presenti
function addDashboardStyles() {
    if (!document.getElementById('dashboard-styles')) {
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            
            .stat-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .stat-icon {
                font-size: 2em;
                color: #4caf50;
            }
            
            .stat-content h3 {
                margin: 0;
                font-size: 1.8em;
                color: #333;
            }
            
            .stat-content p {
                margin: 5px 0 0 0;
                color: #666;
            }
            
            .tasks-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-top: 20px;
            }
            
            .task-item {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.08);
                border-left: 4px solid #4caf50;
            }
            
            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .task-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .task-priority {
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8em;
                font-weight: bold;
            }
            
            .loading-state {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            
            .spinner {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Aggiungi stili
addDashboardStyles();

// Esporta funzioni globalmente
window.dashboard = {
    initDashboard,
    loadUserTasks,
    viewTask,
    refreshDashboard: initDashboard
};

console.log('✅ Dashboard System ready');