// tasks.js - Gestione task con permessi per ruolo

// Carica tutte le task non eliminate
async function loadAllTasks() {
    try {
        const tasksSnapshot = await firebase.firestore()
            .collection('tasks')
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .get();
        
        const tasks = [];
        tasksSnapshot.forEach(doc => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return tasks;
    } catch (error) {
        console.error('Errore caricamento task:', error);
        showNotification('Errore nel caricamento delle task', 'error');
        return [];
    }
}

// Carica task dell'utente corrente
async function loadUserTasks(userEmail) {
    try {
        const tasksSnapshot = await firebase.firestore()
            .collection('tasks')
            .where('assignedTo', '==', userEmail)
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .get();
        
        const tasks = [];
        tasksSnapshot.forEach(doc => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return tasks;
    } catch (error) {
        console.error('Errore caricamento task utente:', error);
        showNotification('Errore nel caricamento delle tue task', 'error');
        return [];
    }
}

// Carica tutte le task eliminate (cestino globale - SOLO ADMIN)
async function loadAllDeletedTasks() {
    try {
        const tasksSnapshot = await firebase.firestore()
            .collection('tasks')
            .where('isDeleted', '==', true)
            .orderBy('deletedAt', 'desc')
            .get();
        
        const tasks = [];
        tasksSnapshot.forEach(doc => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return tasks;
    } catch (error) {
        console.error('Errore caricamento task eliminate globali:', error);
        showNotification('Errore nel caricamento del cestino globale', 'error');
        return [];
    }
}

// ⭐ Renderizza task come card con permessi basati sul ruolo
function renderTasksCards(tasks, currentUserEmail = '', currentUserRole = 'employee') {
    if (tasks.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>Nessuna task trovata</h3>
                <p>Crea una nuova task o modifica i filtri di ricerca</p>
            </div>
        `;
    }
    
    let html = '<div class="task-cards">';
    
    tasks.forEach(task => {
        // ⭐ PERMESSI BASATI SU RUOLO:
        // Admin può fare TUTTO
        // Dipendente può fare solo azioni sulle proprie task
        
        const isAdmin = currentUserRole === 'admin';
        const canEdit = isAdmin || 
                       task.createdBy === currentUserEmail || 
                       task.assignedTo === currentUserEmail;
        
        const canDelete = isAdmin || task.createdBy === currentUserEmail;
        const canComplete = isAdmin || task.assignedTo === currentUserEmail;
        
        const isOverdue = isTaskOverdue(task.dueDate);
        const priorityClass = getTaskColorClass(task.priority);
        
        html += `
            <div class="task-card ${priorityClass}">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    ${getPriorityBadge(task.priority)}
                    ${isAdmin ? `<span class="badge" style="background: #7209b7; color: white;">Admin</span>` : ''}
                </div>
                
                <p class="task-description">${task.description}</p>
                
                <div class="task-meta">
                    <div class="task-assigned">
                        <i class="fas fa-user"></i>
                        <span>Assegnata a: ${task.assignedTo}</span>
                    </div>
                    
                    <div class="task-creator">
                        <i class="fas fa-user-plus"></i>
                        <span>Creata da: ${task.createdBy}</span>
                    </div>
                    
                    <div class="task-status">
                        ${getStatusBadge(task.status)}
                    </div>
                </div>
                
                <div class="task-footer">
                    <div class="task-date ${isOverdue && task.status !== 'completed' ? 'overdue' : ''}">
                        <i class="fas fa-calendar-alt"></i>
                        ${task.dueDate ? formatDate(task.dueDate) : 'Nessuna scadenza'}
                        ${isOverdue && task.status !== 'completed' ? ' (In ritardo!)' : ''}
                    </div>
                    
                    <div class="action-buttons">
                        ${canEdit ? `
                            <button class="btn btn-icon btn-edit edit-task" data-id="${task.id}" title="Modifica">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        
                        ${canComplete && task.status !== 'completed' ? `
                            <button class="btn btn-icon btn-complete complete-task" data-id="${task.id}" title="Completa">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        
                        ${canDelete ? `
                            <button class="btn btn-icon btn-delete delete-task" data-id="${task.id}" title="Elimina">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    return html;
}

// ⭐ Renderizza task come tabella (per admin dashboard)
function renderAdminTasksTable(tasks) {
    if (tasks.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>Nessuna task trovata</h3>
                <p>Non ci sono task nel sistema</p>
            </div>
        `;
    }
    
    let html = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Titolo</th>
                        <th>Assegnata a</th>
                        <th>Creata da</th>
                        <th>Priorità</th>
                        <th>Stato</th>
                        <th>Scadenza</th>
                        <th>Azioni Admin</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    tasks.forEach(task => {
        const isOverdue = isTaskOverdue(task.dueDate);
        
        html += `
            <tr>
                <td><strong>${task.title}</strong></td>
                <td>${task.assignedTo}</td>
                <td>${task.createdBy}</td>
                <td>${getPriorityBadge(task.priority)}</td>
                <td>${getStatusBadge(task.status)}</td>
                <td class="${isOverdue && task.status !== 'completed' ? 'task-date overdue' : 'task-date'}">
                    ${task.dueDate ? formatDate(task.dueDate) : 'N/A'}
                    ${isOverdue && task.status !== 'completed' ? '<br><small>In ritardo!</small>' : ''}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon btn-edit edit-task-admin" data-id="${task.id}" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-delete delete-task-admin" data-id="${task.id}" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${task.status !== 'completed' ? `
                            <button class="btn btn-icon btn-complete complete-task-admin" data-id="${task.id}" title="Completa">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-icon btn-assign assign-task-admin" data-id="${task.id}" title="Ri-assigna">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Funzioni CRUD (rimangono uguali)
async function createTask(taskData, createdBy) {
    try {
        const newTask = {
            ...taskData,
            createdBy: createdBy,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            isDeleted: false
        };
        
        await firebase.firestore().collection('tasks').add(newTask);
        
        showNotification('Task creata con successo!', 'success');
        return true;
    } catch (error) {
        console.error('Errore creazione task:', error);
        showNotification('Errore nella creazione della task', 'error');
        return false;
    }
}

async function updateTask(taskId, updates) {
    try {
        await firebase.firestore().collection('tasks').doc(taskId).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Task aggiornata con successo!', 'success');
        return true;
    } catch (error) {
        console.error('Errore aggiornamento task:', error);
        showNotification('Errore nell\'aggiornamento della task', 'error');
        return false;
    }
}

async function deleteTask(taskId, deletedBy) {
    try {
        await firebase.firestore().collection('tasks').doc(taskId).update({
            isDeleted: true,
            deletedBy: deletedBy,
            deletedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Task spostata nel cestino', 'success');
        return true;
    } catch (error) {
        console.error('Errore eliminazione task:', error);
        showNotification('Errore nell\'eliminazione della task', 'error');
        return false;
    }
}

async function restoreTask(taskId) {
    try {
        await firebase.firestore().collection('tasks').doc(taskId).update({
            isDeleted: false,
            deletedBy: null,
            deletedAt: null
        });
        
        showNotification('Task ripristinata con successo!', 'success');
        return true;
    } catch (error) {
        console.error('Errore ripristino task:', error);
        showNotification('Errore nel ripristino della task', 'error');
        return false;
    }
}

async function permanentlyDeleteTask(taskId) {
    try {
        await firebase.firestore().collection('tasks').doc(taskId).delete();
        
        showNotification('Task eliminata definitivamente', 'success');
        return true;
    } catch (error) {
        console.error('Errore eliminazione definitiva task:', error);
        showNotification('Errore nell\'eliminazione definitiva della task', 'error');
        return false;
    }
}

// ⭐ Funzioni statistiche avanzate (per admin)
async function getCompanyStats() {
    try {
        const allTasks = await loadAllTasks();
        const usersSnapshot = await firebase.firestore().collection('users').get();
        const users = [];
        
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        
        const stats = {
            totalTasks: allTasks.length,
            completedTasks: allTasks.filter(t => t.status === 'completed').length,
            inProgressTasks: allTasks.filter(t => t.status === 'in-progress').length,
            pendingTasks: allTasks.filter(t => t.status === 'pending').length,
            overdueTasks: allTasks.filter(t => 
                t.status !== 'completed' && isTaskOverdue(t.dueDate)
            ).length,
            totalUsers: users.length,
            adminUsers: users.filter(u => u.role === 'admin').length,
            employeeUsers: users.filter(u => u.role === 'employee').length
        };
        
        return stats;
    } catch (error) {
        console.error('Errore statistiche aziendali:', error);
        return null;
    }
}