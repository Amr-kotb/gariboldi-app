// js/admin.js - VERSIONE SEMPLIFICATA
console.log('👑 Admin semplice caricato');

// Ottieni tutti gli utenti
async function getAllUsers() {
    try {
        const snapshot = await firebase.firestore()
            .collection('users')
            .get();
        
        const users = [];
        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`📊 ${users.length} utenti caricati`);
        return users;
        
    } catch (error) {
        console.error('❌ Errore caricamento utenti:', error);
        return [];
    }
}

// Aggiungi nuovo dipendente
async function addEmployee(email, password, employeeData) {
    try {
        showNotification('Creazione dipendente...', 'info');
        
        // 1. Crea account Firebase
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // 2. Aggiorna profilo
        if (employeeData.displayName) {
            await user.updateProfile({
                displayName: employeeData.displayName
            });
        }
        
        // 3. Crea documento in Firestore
        await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .set({
                email: email,
                displayName: employeeData.displayName || email.split('@')[0],
                role: employeeData.role || 'employee',
                department: employeeData.department || 'Generale',
                phone: employeeData.phone || '',
                hiredDate: employeeData.hiredDate || new Date().toISOString(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: firebase.auth().currentUser.uid,
                isActive: true
            });
        
        console.log('✅ Dipendente creato:', email);
        showNotification(`Dipendente ${email} creato!`, 'success');
        
        return { uid: user.uid, email: email };
        
    } catch (error) {
        console.error('❌ Errore creazione dipendente:', error);
        
        let errorMessage = 'Errore creazione';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email già registrata';
        }
        
        showNotification(errorMessage, 'error');
        throw error;
    }
}

// Cambia ruolo utente
async function changeUserRole(userId, newRole) {
    try {
        await firebase.firestore()
            .collection('users')
            .doc(userId)
            .update({
                role: newRole,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: firebase.auth().currentUser.uid
            });
        
        console.log(`✅ Ruolo aggiornato per ${userId}: ${newRole}`);
        showNotification(`Ruolo aggiornato a: ${newRole}`, 'success');
        
        return true;
        
    } catch (error) {
        console.error('❌ Errore cambio ruolo:', error);
        showNotification('Errore cambio ruolo', 'error');
        return false;
    }
}

// Disabilita/abilita utente
async function toggleUserStatus(userId, disabled) {
    try {
        await firebase.firestore()
            .collection('users')
            .doc(userId)
            .update({
                isActive: !disabled,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        const status = disabled ? 'disabilitato' : 'abilitato';
        console.log(`✅ Utente ${status}: ${userId}`);
        showNotification(`Utente ${status}`, 'success');
        
        return true;
        
    } catch (error) {
        console.error('❌ Errore cambio stato:', error);
        return false;
    }
}

// Esporta
window.admin = {
    getAllUsers,
    addEmployee,
    changeUserRole,
    toggleUserStatus
};

// Verifica admin all'avvio
document.addEventListener('DOMContentLoaded', async function() {
    if (window.location.pathname.includes('admin')) {
        const user = auth.getCurrentUser();
        if (!user || user.role !== 'admin') {
            showNotification('Accesso riservato agli admin', 'error');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
        }
    }
});