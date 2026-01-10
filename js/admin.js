// admin.js - Funzioni specifiche per amministratori

// Gestione utenti avanzata
async function getAllUsers() {
    try {
        const usersSnapshot = await firebase.firestore().collection('users').get();
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

// Cambia ruolo utente
async function changeUserRole(userId, newRole) {
    try {
        await firebase.firestore().collection('users').doc(userId).update({
            role: newRole,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification(`Ruolo utente aggiornato a: ${newRole}`, 'success');
        return true;
    } catch (error) {
        console.error('Errore cambio ruolo:', error);
        showNotification('Errore nel cambio ruolo', 'error');
        return false;
    }
}

// Esporta dati in CSV
function exportToCSV(tasks, filename = 'tasks_export.csv') {
    if (tasks.length === 0) {
        showNotification('Nessun dato da esportare', 'warning');
        return;
    }
    
    // Intestazioni CSV
    const headers = ['ID', 'Titolo', 'Descrizione', 'Assegnata a', 'Creata da', 
                    'Data Creazione', 'Data Scadenza', 'Priorità', 'Stato'];
    
    // Dati CSV
    const rows = tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.assignedTo,
        task.createdBy,
        task.createdAt ? formatFullDate(task.createdAt) : 'N/A',
        task.dueDate ? formatFullDate(task.dueDate) : 'N/A',
        task.priority,
        task.status
    ]);
    
    // Crea contenuto CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Crea blob e scarica
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Esportazione CSV completata!', 'success');
}

// Bulk operations per admin
async function bulkDeleteTasks(taskIds) {
    if (!taskIds.length) {
        showNotification('Nessuna task selezionata', 'warning');
        return;
    }
    
    if (!confirm(`Eliminare ${taskIds.length} task selezionate?`)) {
        return;
    }
    
    try {
        const batch = firebase.firestore().batch();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        taskIds.forEach(taskId => {
            const taskRef = firebase.firestore().collection('tasks').doc(taskId);
            batch.update(taskRef, {
                isDeleted: true,
                deletedBy: user.email,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        showNotification(`${taskIds.length} task eliminate`, 'success');
        return true;
    } catch (error) {
        console.error('Errore eliminazione bulk:', error);
        showNotification('Errore nell\'eliminazione', 'error');
        return false;
    }
}

async function bulkUpdateTasks(taskIds, updates) {
    if (!taskIds.length) {
        showNotification('Nessuna task selezionata', 'warning');
        return;
    }
    
    try {
        const batch = firebase.firestore().batch();
        
        taskIds.forEach(taskId => {
            const taskRef = firebase.firestore().collection('tasks').doc(taskId);
            batch.update(taskRef, {
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        showNotification(`${taskIds.length} task aggiornate`, 'success');
        return true;
    } catch (error) {
        console.error('Errore aggiornamento bulk:', error);
        showNotification('Errore nell\'aggiornamento', 'error');
        return false;
    }
}