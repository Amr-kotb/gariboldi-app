// Mostra notifica
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) {
        // Crea elemento notifica se non esiste
        const newNotification = document.createElement('div');
        newNotification.id = 'notification';
        newNotification.className = 'notification';
        document.body.appendChild(newNotification);
    }
    
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;
    notificationElement.className = `notification ${type}`;
    notificationElement.classList.add('show');
    
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 3000);
}

// Formatta data
function formatDate(date) {
    if (!date) return 'N/A';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Oggi';
    } else if (diffDays === 1) {
        return 'Ieri';
    } else if (diffDays < 7) {
        return `${diffDays} giorni fa`;
    } else {
        return d.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Formatta data completa
function formatFullDate(date) {
    if (!date) return 'N/A';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Ottieni badge per priorità
function getPriorityBadge(priority) {
    const badges = {
        low: '<span class="badge badge-priority-low">Bassa</span>',
        medium: '<span class="badge badge-priority-medium">Media</span>',
        high: '<span class="badge badge-priority-high">Alta</span>',
        critical: '<span class="badge badge-priority-critical">Critica</span>'
    };
    return badges[priority] || badges.medium;
}

// Ottieni badge per stato
function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-status-pending">In attesa</span>',
        'in-progress': '<span class="badge badge-status-in-progress">In corso</span>',
        completed: '<span class="badge badge-status-completed">Completata</span>'
    };
    return badges[status] || badges.pending;
}

// Controlla se la task è in ritardo
function isTaskOverdue(dueDate) {
    if (!dueDate) return false;
    
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    const now = new Date();
    
    // Rimuove l'orario per confrontare solo le date
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    return due < now;
}

// Ottieni colore task in base alla priorità
function getTaskColorClass(priority) {
    const colors = {
        low: 'low',
        medium: 'medium',
        high: 'high',
        critical: 'critical'
    };
    return colors[priority] || 'medium';
}

// Carica dati utenti
async function loadUsers() {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        
        usersSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return users;
    } catch (error) {
        console.error('Errore caricamento utenti:', error);
        return [];
    }
}

// Crea opzioni select per utenti
function createUserOptions(users, selectedEmail = '') {
    let options = '<option value="">Seleziona assegnatario</option>';
    
    users.forEach(user => {
        const selected = user.email === selectedEmail ? 'selected' : '';
        options += `<option value="${user.email}" ${selected}>${user.displayName} (${user.email})</option>`;
    });
    
    return options;
}

// Filtra task
function filterTasks(tasks, filters) {
    return tasks.filter(task => {
        // Filtro per testo
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const matchesSearch = 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.assignedTo.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) return false;
        }
        
        // Filtro per priorità
        if (filters.priority && filters.priority !== 'all') {
            if (task.priority !== filters.priority) return false;
        }
        
        // Filtro per stato
        if (filters.status && filters.status !== 'all') {
            if (task.status !== filters.status) return false;
        }
        
        // Filtro per scadenza
        if (filters.dueDate && task.dueDate) {
            const due = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
            const now = new Date();
            
            switch (filters.dueDate) {
                case 'today':
                    if (!isSameDay(due, now)) return false;
                    break;
                case 'this-week':
                    if (!isThisWeek(due)) return false;
                    break;
                case 'overdue':
                    if (!isTaskOverdue(task.dueDate)) return false;
                    break;
            }
        }
        
        return true;
    });
}

// Confronta se due date sono lo stesso giorno
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Controlla se una data è questa settimana
function isThisWeek(date) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    return date >= startOfWeek && date <= endOfWeek;
}

// Ordina task
function sortTasks(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
        switch (sortBy) {
            case 'dueDate':
                return (a.dueDate?.seconds || 0) - (b.dueDate?.seconds || 0);
            case 'priority':
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'createdAt':
            default:
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
    });
}