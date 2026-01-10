// Variabili globali
let currentUser = null;
let allTasks = [];
let allUsers = [];
let currentView = 'cards'; // 'cards' o 'table'
let taskToDelete = null;
let taskToComplete = null;

// Inizializzazione
document.addEventListener('DOMContentLoaded', async function() {
    // Controlla autenticazione
    try {
        const authResult = await checkAuth();
        currentUser = authResult.user;
        
        // Carica dati iniziali
        await initializeDashboard();
        
        // Configura event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Errore inizializzazione dashboard:', error);
        window.location.href = 'index.html';
    }
});

// Inizializza dashboard
async function initializeDashboard() {
    try {
        // Mostra info utente
        displayUserInfo();
        
        // Carica task e utenti
        await loadDashboardData();
        
        // Inizializza dati demo se necessario
        await initializeDemoData();
        
    } catch (error) {
        console.error('Errore inizializzazione:', error);
        showNotification('Errore nel caricamento dei dati', 'error');
    }
}

// Carica dati dashboard
async function loadDashboardData() {
    try {
        // Carica task e utenti in parallelo
        const [tasks, users] = await Promise.all([
            loadAllTasks(),
            loadUsers()
        ]);
        
        allTasks = tasks;
        allUsers = users;
        
        // Calcola e mostra statistiche
        displayStats();
        
        // Mostra task
        renderTasks();
        
    } catch (error) {
        console.error('Errore caricamento dati:', error);
        showNotification('Errore nel caricamento dei dati', 'error');
    }
}

// Mostra info utente
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || '';
    const userName = user.displayName || userEmail.split('@')[0];
    const userRole = user.role || 'employee';
    
    // Aggiorna sidebar
    const sidebarUser = document.getElementById('sidebar-user');
    if (sidebarUser) {
        const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        sidebarUser.innerHTML = `
            <div class="user-avatar">${initials}</div>
            <div class="user-info">
                <h4>${userName}</h4>
                <p>${userEmail}</p>
                <span class="user-role ${userRole}">${userRole === 'admin' ? 'Amministratore' : 'Dipendente'}</span>
            </div>
        `;
    }
    
    // Mostra link admin se l'utente è admin
    if (userRole === 'admin') {
        const adminLinks = document.getElementById('admin-links');
        if (adminLinks) {
            adminLinks.style.display = 'block';
        }
    }
}

// Calcola e mostra statistiche
async function displayStats() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || '';
    
    try {
        const stats = await getUserStats(userEmail);
        
        const statsCards = document.getElementById('stats-cards');
        if (statsCards) {
            statsCards.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(67, 97, 238, 0.1); color: var(--primary);">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.total}</h3>
                        <p>Task Totali</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(76, 201, 240, 0.1); color: var(--success);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.completed}</h3>
                        <p>Completate</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(248, 150, 30, 0.1); color: var(--warning);">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.inProgress}</h3>
                        <p>In Corso</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(247, 37, 133, 0.1); color: var(--danger);">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.overdue}</h3>
                        <p>In Ritardo</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(114, 9, 183, 0.1); color: var(--secondary);">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.completionRate}%</h3>
                        <p>Tasso Completamento</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Errore caricamento statistiche:', error);
    }
}

// Renderizza task con filtri applicati
function renderTasks() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';
    const userEmail = user.email || '';
    
    // Ottieni valori filtri
    const filters = {
        search: document.getElementById('search')?.value.toLowerCase() || '',
        priority: document.getElementById('priority-filter')?.value || 'all',
        status: document.getElementById('status-filter')?.value || 'all',
        dueDate: document.getElementById('due-date-filter')?.value || 'all'
    };
    
    const sortBy = document.getElementById('sort-by')?.value || 'createdAt';
    
    // Filtra e ordina task
    let filteredTasks = filterTasks(allTasks, filters);
    filteredTasks = sortTasks(filteredTasks, sortBy);
    
    // Renderizza in base alla view corrente
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) return;
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>Nessuna task trovata</h3>
                <p>Crea una nuova task o modifica i filtri di ricerca</p>
            </div>
        `;
        return;
    }
    
    if (currentView === 'table') {
        tasksContainer.innerHTML = renderTasksTable(filteredTasks, isAdmin, userEmail);
    } else {
        tasksContainer.innerHTML = renderTasksCards(filteredTasks, isAdmin, userEmail);
    }
    
    // Aggiungi event listeners ai bottoni
    attachTaskButtonsListeners();
}

// Configura event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', logoutUser);
    
    // Refresh
    document.getElementById('refresh-btn')?.addEventListener('click', async () => {
        showNotification('Aggiornamento in corso...', 'info');
        await loadDashboardData();
    });
    
    // Cambio view
    document.getElementById('view-table-btn')?.addEventListener('click', () => {
        currentView = 'table';
        document.getElementById('view-table-btn').classList.add('active');
        document.getElementById('view-cards-btn').classList.remove('active');
        renderTasks();
    });
    
    document.getElementById('view-cards-btn')?.addEventListener('click', () => {
        currentView = 'cards';
        document.getElementById('view-cards-btn').classList.add('active');
        document.getElementById('view-table-btn').classList.remove('active');
        renderTasks();
    });
    
    // Filtri
    const filterElements = [
        'search', 'priority-filter', 'status-filter', 'due-date-filter', 'sort-by'
    ];
    
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', renderTasks);
        }
    });
    
    // Search con debounce
    const searchInput = document.getElementById('search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(renderTasks, 300);
        });
    }
    
    // Modali
    setupModals();
}

// Configura modali
function setupModals() {
    // Modifica task
    const editModal = document.getElementById('edit-task-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editModal.classList.remove('show');
        });
    }
    
    if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
            editModal.classList.remove('show');
        });
    }
    
    // Eliminazione
    const deleteModal = document.getElementById('confirm-delete-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDelete = document.getElementById('cancel-delete-btn');
    
    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', () => {
            deleteModal.classList.remove('show');
            taskToDelete = null;
        });
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            deleteModal.classList.remove('show');
            taskToDelete = null;
        });
    }
    
    document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
        if (taskToDelete) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await deleteTask(taskToDelete, user.email);
            deleteModal.classList.remove('show');
            taskToDelete = null;
            await loadDashboardData();
        }
    });
    
    // Completamento
    const completeModal = document.getElementById('confirm-complete-modal');
    const closeCompleteModal = document.getElementById('close-complete-modal');
    const cancelComplete = document.getElementById('cancel-complete-btn');
    
    if (closeCompleteModal) {
        closeCompleteModal.addEventListener('click', () => {
            completeModal.classList.remove('show');
            taskToComplete = null;
        });
    }
    
    if (cancelComplete) {
        cancelComplete.addEventListener('click', () => {
            completeModal.classList.remove('show');
            taskToComplete = null;
        });
    }
    
    document.getElementById('confirm-complete-btn')?.addEventListener('click', async () => {
        if (taskToComplete) {
            await updateTask(taskToComplete, { status: 'completed' });
            completeModal.classList.remove('show');
            taskToComplete = null;
            await loadDashboardData();
        }
    });
    
    // Submit modifica task
    document.getElementById('edit-task-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const taskId = document.getElementById('edit-task-id').value;
        const updates = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            assignedTo: document.getElementById('edit-assigned-to').value,
            priority: document.getElementById('edit-priority').value,
            status: document.getElementById('edit-status').value,
            dueDate: new Date(document.getElementById('edit-due-date').value)
        };
        
        const success = await updateTask(taskId, updates);
        if (success) {
            document.getElementById('edit-task-modal').classList.remove('show');
            await loadDashboardData();
        }
    });
    
    // Chiudi modali cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
            taskToDelete = null;
            taskToComplete = null;
        }
    });
}

// Aggiungi event listeners ai bottoni delle task
function attachTaskButtonsListeners() {
    // Modifica task
    document.querySelectorAll('.edit-task').forEach(button => {
        button.addEventListener('click', async (e) => {
            const taskId = e.currentTarget.dataset.id;
            const task = allTasks.find(t => t.id === taskId);
            
            if (task) {
                await openEditTaskModal(task);
            }
        });
    });
    
    // Elimina task
    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', (e) => {
            taskToDelete = e.currentTarget.dataset.id;
            document.getElementById('confirm-delete-modal').classList.add('show');
        });
    });
    
    // Completa task
    document.querySelectorAll('.complete-task').forEach(button => {
        button.addEventListener('click', (e) => {
            taskToComplete = e.currentTarget.dataset.id;
            document.getElementById('confirm-complete-modal').classList.add('show');
        });
    });
}

// Apri modal modifica task
async function openEditTaskModal(task) {
    // Popola campi del form
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-description').value = task.description;
    
    // Popola select assegnatario
    const assignedSelect = document.getElementById('edit-assigned-to');
    assignedSelect.innerHTML = createUserOptions(allUsers, task.assignedTo);
    
    // Imposta altri valori
    document.getElementById('edit-priority').value = task.priority;
    document.getElementById('edit-status').value = task.status;
    
    // Formatta data per input date
    if (task.dueDate) {
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        const formattedDate = dueDate.toISOString().split('T')[0];
        document.getElementById('edit-due-date').value = formattedDate;
    } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('edit-due-date').value = tomorrow.toISOString().split('T')[0];
    }
    
    // Mostra modal
    document.getElementById('edit-task-modal').classList.add('show');
}