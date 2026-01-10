// employee-tasks.js - Gestione task specifica per dipendenti

// Carica task personali (dashboard personale)
async function loadPersonalTasks(userEmail) {
    try {
        const snapshot = await db.collection('tasks')
            .where('assignedTo', '==', userEmail)
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
            
        const tasks = [];
        snapshot.forEach(doc => {
            const task = doc.data();
            task.id = doc.id;
            tasks.push(task);
        });
        
        return tasks;
    } catch (error) {
        console.error('Errore caricamento task personali:', error);
        throw error;
    }
}

// Crea nuova task personale
async function createPersonalTask(taskData, userEmail) {
    try {
        const newTask = {
            ...taskData,
            assignedTo: userEmail,
            createdBy: userEmail,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            isDeleted: false,
            status: 'pending'
        };
        
        const docRef = await db.collection('tasks').add(newTask);
        console.log('✅ Task personale creata:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Errore creazione task personale:', error);
        throw error;
    }
}

// Aggiorna task (solo se proprietario)
async function updatePersonalTask(taskId, updates, userEmail) {
    try {
        // Verifica che la task appartenga all'utente
        const taskDoc = await db.collection('tasks').doc(taskId).get();
        if (!taskDoc.exists) {
            throw new Error('Task non trovata');
        }
        
        const task = taskDoc.data();
        if (task.assignedTo !== userEmail) {
            throw new Error('Non hai i permessi per modificare questa task');
        }
        
        // Aggiorna
        await db.collection('tasks').doc(taskId).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Task personale aggiornata:', taskId);
        return true;
    } catch (error) {
        console.error('Errore aggiornamento task:', error);
        throw error;
    }
}

// Elimina task nel cestino personale
async function moveToPersonalTrash(taskId, userEmail) {
    try {
        // Verifica proprietà
        const taskDoc = await db.collection('tasks').doc(taskId).get();
        if (!taskDoc.exists) {
            throw new Error('Task non trovata');
        }
        
        const task = taskDoc.data();
        if (task.assignedTo !== userEmail) {
            throw new Error('Non hai i permessi per eliminare questa task');
        }
        
        // Sposta nel cestino (soft delete)
        await db.collection('tasks').doc(taskId).update({
            isDeleted: true,
            deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
            deletedBy: userEmail,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Task spostata nel cestino personale:', taskId);
        return true;
    } catch (error) {
        console.error('Errore eliminazione task:', error);
        throw error;
    }
}

// Ripristina task dal cestino
async function restoreFromPersonalTrash(taskId, userEmail) {
    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();
        if (!taskDoc.exists) {
            throw new Error('Task non trovata');
        }
        
        const task = taskDoc.data();
        if (task.assignedTo !== userEmail) {
            throw new Error('Non hai i permessi per ripristinare questa task');
        }
        
        await db.collection('tasks').doc(taskId).update({
            isDeleted: false,
            restoredAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Task ripristinata dal cestino:', taskId);
        return true;
    } catch (error) {
        console.error('Errore ripristino task:', error);
        throw error;
    }
}

// Pulisci cestino automaticamente (da chiamare periodicamente)
async function cleanupPersonalTrash(userEmail, days = 30) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const snapshot = await db.collection('tasks')
            .where('assignedTo', '==', userEmail)
            .where('isDeleted', '==', true)
            .where('deletedAt', '<', cutoffDate)
            .get();
            
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ Cestino pulito: ${snapshot.size} task eliminate`);
        return snapshot.size;
    } catch (error) {
        console.error('Errore pulizia cestino:', error);
        throw error;
    }
}

// Esporta funzioni
window.employeeTasks = {
    loadPersonalTasks,
    createPersonalTask,
    updatePersonalTask,
    moveToPersonalTrash,
    restoreFromPersonalTrash,
    cleanupPersonalTrash
};