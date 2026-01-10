// mock-auth.js - Sistema di autenticazione mock completo con sessioni isolate

console.log('🧪 Sistema mock-auth caricato - Modalità TESTING');

// ============================================
// CONFIGURAZIONE
// ============================================
const MOCK_CONFIG = {
    enableMock: true, // Imposta a false per disabilitare
    sessionTimeout: 30 * 60 * 1000, // 30 minuti
    autoCleanup: true, // Pulisci task scadute automaticamente
    mockDelay: 300 // Ritardo simulato per le chiamate (ms)
};

// ============================================
// DATABASE MOCK ISOLATO PER SESSIONE
// ============================================

// Funzione per creare un database isolato per ogni sessione
function createIsolatedMockDatabase() {
    const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🆕 Creata sessione mock isolata: ${sessionId}`);
    
    // Database utenti (base condivisa ma copiata per sessione)
    const baseUsers = [
        {
            uid: 'admin_001',
            email: 'admin@gariboldi.com',
            password: 'admin123!',
            displayName: 'Amministratore',
            role: 'admin',
            department: 'Management',
            createdAt: new Date('2024-01-01'),
            avatarColor: '#4361ee'
        },
        {
            uid: 'emp_001',
            email: 'andrea@gariboldi.com',
            password: 'andrea123!',
            displayName: 'Andrea Gariboldi',
            role: 'employee',
            department: 'Sviluppo',
            createdAt: new Date('2024-01-15'),
            avatarColor: '#7209b7'
        },
        {
            uid: 'emp_002',
            email: 'leonardo@gariboldi.com',
            password: 'leonardo123!',
            displayName: 'Leonardo Rossi',
            role: 'employee',
            department: 'Marketing',
            createdAt: new Date('2024-02-01'),
            avatarColor: '#f72585'
        },
        {
            uid: 'emp_003',
            email: 'domenico@gariboldi.com',
            password: 'domenico123!',
            displayName: 'Domenico Bianchi',
            role: 'employee',
            department: 'Vendite',
            createdAt: new Date('2024-02-15'),
            avatarColor: '#4cc9f0'
        },
        {
            uid: 'emp_004',
            email: 'stefano@gariboldi.com',
            password: 'stefano123!',
            displayName: 'Stefano Verdi',
            role: 'employee',
            department: 'Supporto',
            createdAt: new Date('2024-03-01'),
            avatarColor: '#f8961e'
        }
    ];
    
    // Database task (base condivisa ma copiata per sessione)
    const baseTasks = [
        {
            id: 'task_001',
            title: 'Aggiornamento software gestionale',
            description: 'Installare e configurare la nuova versione del software gestionale su tutti i PC',
            assignedTo: 'leonardo@gariboldi.com',
            assignedToName: 'Leonardo Rossi',
            createdBy: 'admin@gariboldi.com',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 giorni fa
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // tra 5 giorni
            priority: 'high',
            status: 'in-progress',
            category: 'Sviluppo',
            estimatedHours: 16,
            completedAt: null,
            isDeleted: false,
            deletedAt: null,
            notes: 'Richiede testing approfondito'
        },
        {
            id: 'task_002',
            title: 'Preparazione report trimestrale',
            description: 'Raccogliere dati e generare report performance Q1 2024',
            assignedTo: 'domenico@gariboldi.com',
            assignedToName: 'Domenico Bianchi',
            createdBy: 'admin@gariboldi.com',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            priority: 'critical',
            status: 'pending',
            category: 'Amministrazione',
            estimatedHours: 8,
            completedAt: null,
            isDeleted: false,
            deletedAt: null,
            notes: 'Includere grafici comparativi'
        },
        {
            id: 'task_003',
            title: 'Manutenzione server di produzione',
            description: 'Controllo hardware e aggiornamento firmware server',
            assignedTo: 'stefano@gariboldi.com',
            assignedToName: 'Stefano Verdi',
            createdBy: 'admin@gariboldi.com',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            priority: 'medium',
            status: 'pending',
            category: 'IT',
            estimatedHours: 12,
            completedAt: null,
            isDeleted: false,
            deletedAt: null,
            notes: 'Pianificare downtime notturno'
        },
        {
            id: 'task_004',
            title: 'Formazione nuovo personale',
            description: 'Sessioni di formazione per i 3 nuovi assunti',
            assignedTo: 'andrea@gariboldi.com',
            assignedToName: 'Andrea Gariboldi',
            createdBy: 'admin@gariboldi.com',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            priority: 'high',
            status: 'in-progress',
            category: 'HR',
            estimatedHours: 20,
            completedAt: null,
            isDeleted: false,
            deletedAt: null,
            notes: 'Preparare materiale didattico'
        },
        {
            id: 'task_005',
            title: 'Analisi competitor',
            description: 'Studio delle strategie dei principali competitor',
            assignedTo: 'leonardo@gariboldi.com',
            assignedToName: 'Leonardo Rossi',
            createdBy: 'andrea@gariboldi.com',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            priority: 'medium',
            status: 'pending',
            category: 'Marketing',
            estimatedHours: 24,
            completedAt: null,
            isDeleted: false,
            deletedAt: null,
            notes: 'Focus su pricing strategies'
        },
        {
            id: 'task_006',
            title: 'Sito web - SEO optimization',
            description: 'Miglioramento posizionamento SEO del sito aziendale',
            assignedTo: 'domenico@gariboldi.com',
            assignedToName: 'Domenico Bianchi',
            createdBy: 'stefano@gariboldi.com',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            priority: 'low',
            status: 'completed',
            category: 'Marketing',
            estimatedHours: 40,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isDeleted: false,
            deletedAt: null,
            notes: 'Completato con successo'
        }
    ];
    
    // Clona i dati per isolare la sessione
    const users = JSON.parse(JSON.stringify(baseUsers));
    const tasks = JSON.parse(JSON.stringify(baseTasks));
    
    // Database privato per questa sessione
    const sessionDB = {
        sessionId: sessionId,
        users: users,
        tasks: tasks,
        activityLog: [],
        statistics: {
            lastUpdated: new Date(),
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length
        }
    };
    
    // Salva riferimento nel sessionStorage
    sessionStorage.setItem('mockSessionId', sessionId);
    
    return sessionDB;
}

// ============================================
// GESTIONE SESSIONE MOCK
// ============================================

let currentSessionDB = null;
let mockAuthListeners = [];

// Ottieni o crea database sessione
function getSessionDB() {
    if (!currentSessionDB) {
        const sessionId = sessionStorage.getItem('mockSessionId');
        
        if (sessionId && sessionStorage.getItem(`mockDB_${sessionId}`)) {
            // Recupera sessione esistente
            try {
                const savedDB = JSON.parse(sessionStorage.getItem(`mockDB_${sessionId}`));
                // Converti stringhe date in oggetti Date
                savedDB.users.forEach(u => {
                    u.createdAt = new Date(u.createdAt);
                });
                savedDB.tasks.forEach(t => {
                    t.createdAt = new Date(t.createdAt);
                    t.dueDate = t.dueDate ? new Date(t.dueDate) : null;
                    t.completedAt = t.completedAt ? new Date(t.completedAt) : null;
                    t.deletedAt = t.deletedAt ? new Date(t.deletedAt) : null;
                });
                currentSessionDB = savedDB;
                console.log(`↩️ Sessione mock recuperata: ${sessionId}`);
            } catch (error) {
                console.error('Errore recupero sessione:', error);
                currentSessionDB = createIsolatedMockDatabase();
            }
        } else {
            // Crea nuova sessione
            currentSessionDB = createIsolatedMockDatabase();
        }
    }
    
    return currentSessionDB;
}

// Salva stato sessione
function saveSessionState() {
    if (currentSessionDB) {
        try {
            const sessionData = JSON.stringify(currentSessionDB);
            sessionStorage.setItem(`mockDB_${currentSessionDB.sessionId}`, sessionData);
            console.log(`💾 Sessione mock salvata: ${currentSessionDB.sessionId}`);
        } catch (error) {
            console.error('Errore salvataggio sessione:', error);
        }
    }
}

// Pulisci sessione
function clearMockSession() {
    if (currentSessionDB) {
        const sessionId = currentSessionDB.sessionId;
        sessionStorage.removeItem(`mockDB_${sessionId}`);
        sessionStorage.removeItem('mockSessionId');
        currentSessionDB = null;
        console.log(`🧹 Sessione mock pulita: ${sessionId}`);
    }
}

// ============================================
// MOCK FIREBASE AUTH
// ============================================

const mockAuth = {
    currentUser: null,
    authStateChangedCallbacks: [],
    
    // Simula ritardo rete
    _simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.mockDelay));
    },
    
    // Login con email/password
    signInWithEmailAndPassword: async function(email, password) {
        await this._simulateDelay();
        
        const db = getSessionDB();
        const user = db.users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw {
                code: 'auth/user-not-found',
                message: 'Credenziali errate o utente non esistente'
            };
        }
        
        this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: true,
            isAnonymous: false,
            metadata: {
                creationTime: user.createdAt.toISOString(),
                lastSignInTime: new Date().toISOString()
            }
        };
        
        // Salva info utente in sessionStorage
        sessionStorage.setItem('mockCurrentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            department: user.department
        }));
        
        // Notifica cambiamento stato
        this._triggerAuthStateChange(this.currentUser);
        
        // Registra attività
        db.activityLog.push({
            type: 'login',
            userId: user.uid,
            timestamp: new Date(),
            details: `Accesso da ${navigator.userAgent}`
        });
        saveSessionState();
        
        console.log(`✅ Mock login riuscito: ${email} (${user.role})`);
        
        return {
            user: this.currentUser,
            credential: null,
            additionalUserInfo: { isNewUser: false }
        };
    },
    
    // Logout
    signOut: async function() {
        await this._simulateDelay();
        
        // Registra attività
        if (this.currentUser) {
            const db = getSessionDB();
            db.activityLog.push({
                type: 'logout',
                userId: this.currentUser.uid,
                timestamp: new Date(),
                details: 'Logout utente'
            });
            saveSessionState();
        }
        
        this.currentUser = null;
        sessionStorage.removeItem('mockCurrentUser');
        
        // Notifica cambiamento stato
        this._triggerAuthStateChange(null);
        
        console.log('✅ Mock logout effettuato');
        return Promise.resolve();
    },
    
    // Crea nuovo utente
    createUserWithEmailAndPassword: async function(email, password) {
        await this._simulateDelay();
        
        const db = getSessionDB();
        
        // Verifica se email già esiste
        if (db.users.some(u => u.email === email)) {
            throw {
                code: 'auth/email-already-in-use',
                message: 'Email già registrata'
            };
        }
        
        // Crea nuovo utente
        const newUser = {
            uid: `emp_${Date.now()}`,
            email: email,
            password: password,
            displayName: email.split('@')[0],
            role: 'employee',
            department: 'Nuovo',
            createdAt: new Date(),
            avatarColor: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        
        db.users.push(newUser);
        saveSessionState();
        
        this.currentUser = {
            uid: newUser.uid,
            email: newUser.email,
            fdisplayName: newUser.displayName,
            emailVerified: false,
            isAnonymous: false
        };
        
        // Notifica cambiamento stato
        this._triggerAuthStateChange(this.currentUser);
        
        console.log(`✅ Mock utente creato: ${email}`);
        
        return {
            user: this.currentUser,
            credential: null,
            additionalUserInfo: { isNewUser: true }
        };
    },
    
    // Listener cambio stato autenticazione
    onAuthStateChanged: function(callback) {
        this.authStateChangedCallbacks.push(callback);
        
        // Chiama immediatamente con stato corrente
        if (callback) {
            setTimeout(() => callback(this.currentUser), 100);
        }
        
        // Restituisci funzione unsubscribe
        return () => {
            const index = this.authStateChangedCallbacks.indexOf(callback);
            if (index > -1) {
                this.authStateChangedCallbacks.splice(index, 1);
            }
        };
    },
    
    // Trigger cambio stato
    _triggerAuthStateChange: function(user) {
        this.authStateChangedCallbacks.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Errore in auth state callback:', error);
            }
        });
    },
    
    // Verifica se utente è loggato
    get isLoggedIn() {
        return !!this.currentUser;
    },
    
    // Ottieni utente corrente
    getCurrentUser: function() {
        return this.currentUser;
    },
    
    // Aggiorna profilo
    updateProfile: async function(updates) {
        await this._simulateDelay();
        
        if (!this.currentUser) {
            throw { code: 'auth/no-current-user', message: 'Nessun utente loggato' };
        }
        
        const db = getSessionDB();
        const userIndex = db.users.findIndex(u => u.uid === this.currentUser.uid);
        
        if (userIndex !== -1) {
            if (updates.displayName) {
                db.users[userIndex].displayName = updates.displayName;
                this.currentUser.displayName = updates.displayName;
            }
            
            saveSessionState();
            console.log(`✅ Profilo mock aggiornato: ${this.currentUser.email}`);
        }
        
        return Promise.resolve();
    }
};

// ============================================
// MOCK FIRESTORE
// ============================================

const mockFirestore = {
    // Collection reference
    collection: function(collectionName) {
        return {
            _collection: collectionName,
            _queryFilters: [],
            _orderByField: null,
            _orderDirection: 'asc',
            _limitValue: null,
            
            // Document reference
            doc: function(docId) {
                return {
                    _collection: this._collection,
                    _docId: docId,
                    
                    // Get document
                    get: async function() {
                        await mockAuth._simulateDelay();
                        const db = getSessionDB();
                        
                        let data = null;
                        
                        if (this._collection === 'users') {
                            data = db.users.find(u => u.uid === this._docId || u.email === this._docId);
                        } else if (this._collection === 'tasks') {
                            data = db.tasks.find(t => t.id === this._docId);
                        }
                        
                        return {
                            exists: !!data,
                            data: () => data ? { ...data } : null,
                            id: this._docId,
                            ref: this
                        };
                    },
                    
                    // Set document
                    set: async function(data, options = {}) {
                        await mockAuth._simulateDelay();
                        const db = getSessionDB();
                        
                        if (this._collection === 'users') {
                            const index = db.users.findIndex(u => u.uid === this._docId || u.email === this._docId);
                            const userData = {
                                ...data,
                                uid: this._docId,
                                updatedAt: new Date()
                            };
                            
                            if (index !== -1 && !options.merge) {
                                // Sovrascrivi
                                db.users[index] = userData;
                            } else if (index !== -1 && options.merge) {
                                // Merge
                                db.users[index] = { ...db.users[index], ...userData };
                            } else {
                                // Nuovo documento
                                if (!userData.createdAt) {
                                    userData.createdAt = new Date();
                                }
                                db.users.push(userData);
                            }
                        } else if (this._collection === 'tasks') {
                            const index = db.tasks.findIndex(t => t.id === this._docId);
                            const taskData = {
                                ...data,
                                id: this._docId,
                                updatedAt: new Date()
                            };
                            
                            if (index !== -1 && !options.merge) {
                                db.tasks[index] = taskData;
                            } else if (index !== -1 && options.merge) {
                                db.tasks[index] = { ...db.tasks[index], ...taskData };
                            } else {
                                if (!taskData.createdAt) {
                                    taskData.createdAt = new Date();
                                }
                                db.tasks.push(taskData);
                            }
                        }
                        
                        saveSessionState();
                        console.log(`✅ Mock documento ${this._collection}/${this._docId} salvato`);
                        return Promise.resolve();
                    },
                    
                    // Update document
                    update: async function(data) {
                        await mockAuth._simulateDelay();
                        const db = getSessionDB();
                        
                        if (this._collection === 'users') {
                            const index = db.users.findIndex(u => u.uid === this._docId || u.email === this._docId);
                            if (index !== -1) {
                                db.users[index] = {
                                    ...db.users[index],
                                    ...data,
                                    updatedAt: new Date()
                                };
                            }
                        } else if (this._collection === 'tasks') {
                            const index = db.tasks.findIndex(t => t.id === this._docId);
                            if (index !== -1) {
                                db.tasks[index] = {
                                    ...db.tasks[index],
                                    ...data,
                                    updatedAt: new Date()
                                };
                            }
                        }
                        
                        saveSessionState();
                        console.log(`✅ Mock documento ${this._collection}/${this._docId} aggiornato`);
                        return Promise.resolve();
                    },
                    
                    // Delete document
                    delete: async function() {
                        await mockAuth._simulateDelay();
                        const db = getSessionDB();
                        
                        if (this._collection === 'tasks') {
                            const index = db.tasks.findIndex(t => t.id === this._docId);
                            if (index !== -1) {
                                db.tasks.splice(index, 1);
                            }
                        }
                        
                        saveSessionState();
                        console.log(`🗑️ Mock documento ${this._collection}/${this._docId} eliminato`);
                        return Promise.resolve();
                    },
                    
                    // Real-time updates (mock)
                    onSnapshot: function(onNext, onError) {
                        console.log(`👁️ Mock snapshot su ${this._collection}/${this._docId}`);
                        
                        // Simula update dopo 5 secondi
                        const interval = setInterval(async () => {
                            try {
                                const doc = await this.get();
                                if (onNext) onNext(doc);
                            } catch (error) {
                                if (onError) onError(error);
                            }
                        }, 5000);
                        
                        // Funzione unsubscribe
                        return () => clearInterval(interval);
                    }
                };
            },
            
            // Add document
            add: async function(data) {
                await mockAuth._simulateDelay();
                const db = getSessionDB();
                
                let newId;
                let newDoc;
                
                if (this._collection === 'tasks') {
                    newId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    newDoc = {
                        id: newId,
                        ...data,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    db.tasks.push(newDoc);
                } else if (this._collection === 'users') {
                    newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    newDoc = {
                        uid: newId,
                        ...data,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    db.users.push(newDoc);
                }
                
                saveSessionState();
                console.log(`✅ Mock documento aggiunto a ${this._collection}: ${newId}`);
                
                return {
                    id: newId,
                    get: () => this.doc(newId).get()
                };
            },
            
            // Where clause
            where: function(field, operator, value) {
                this._queryFilters.push({ field, operator, value });
                return this;
            },
            
            // Order by
            orderBy: function(field, direction = 'asc') {
                this._orderByField = field;
                this._orderDirection = direction;
                return this;
            },
            
            // Limit
            limit: function(limit) {
                this._limitValue = limit;
                return this;
            },
            
            // Get documents
            get: async function() {
                await mockAuth._simulateDelay();
                const db = getSessionDB();
                
                let documents = [];
                
                // Seleziona collection
                if (this._collection === 'users') {
                    documents = [...db.users];
                } else if (this._collection === 'tasks') {
                    documents = [...db.tasks];
                }
                
                // Applica filtri
                this._queryFilters.forEach(filter => {
                    documents = documents.filter(doc => {
                        const docValue = doc[filter.field];
                        
                        switch (filter.operator) {
                            case '==':
                                return docValue === filter.value;
                            case '!=':
                                return docValue !== filter.value;
                            case '>':
                                return docValue > filter.value;
                            case '<':
                                return docValue < filter.value;
                            case '>=':
                                return docValue >= filter.value;
                            case '<=':
                                return docValue <= filter.value;
                            case 'array-contains':
                                return Array.isArray(docValue) && docValue.includes(filter.value);
                            default:
                                return true;
                        }
                    });
                });
                
                // Applica ordinamento
                if (this._orderByField) {
                    documents.sort((a, b) => {
                        const aVal = a[this._orderByField];
                        const bVal = b[this._orderByField];
                        
                        if (aVal < bVal) return this._orderDirection === 'asc' ? -1 : 1;
                        if (aVal > bVal) return this._orderDirection === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
                
                // Applica limite
                if (this._limitValue && this._limitValue > 0) {
                    documents = documents.slice(0, this._limitValue);
                }
                
                // Crea snapshot mock
                const docsArray = documents.map(doc => ({
                    id: doc.id || doc.uid,
                    data: () => ({ ...doc }),
                    ref: this.doc(doc.id || doc.uid)
                }));
                
                console.log(`📄 Mock query ${this._collection}: ${docsArray.length} documenti`);
                
                return {
                    docs: docsArray,
                    empty: docsArray.length === 0,
                    forEach: function(callback) {
                        docsArray.forEach(callback);
                    },
                    size: docsArray.length,
                    query: this
                };
            },
            
            // Real-time updates (collection)
            onSnapshot: function(onNext, onError) {
                console.log(`👁️ Mock collection snapshot su ${this._collection}`);
                
                // Invia dati iniziali
                setTimeout(async () => {
                    try {
                        const snapshot = await this.get();
                        if (onNext) onNext(snapshot);
                    } catch (error) {
                        if (onError) onError(error);
                    }
                }, 1000);
                
                // Simula updates periodici
                const interval = setInterval(async () => {
                    try {
                        const snapshot = await this.get();
                        if (onNext) onNext(snapshot);
                    } catch (error) {
                        if (onError) onError(error);
                    }
                }, 10000); // Update ogni 10 secondi
                
                // Funzione unsubscribe
                return () => clearInterval(interval);
            }
        };
    },
    
    // Batch operations
    batch: function() {
        const writes = [];
        
        return {
            set: function(docRef, data) {
                writes.push({ type: 'set', docRef, data });
                return this;
            },
            update: function(docRef, data) {
                writes.push({ type: 'update', docRef, data });
                return this;
            },
            delete: function(docRef) {
                writes.push({ type: 'delete', docRef });
                return this;
            },
            commit: async function() {
                await mockAuth._simulateDelay();
                const db = getSessionDB();
                
                for (const write of writes) {
                    const collection = write.docRef._collection;
                    const docId = write.docRef._docId;
                    
                    if (collection === 'tasks') {
                        const index = db.tasks.findIndex(t => t.id === docId);
                        
                        if (write.type === 'set') {
                            if (index !== -1) {
                                db.tasks[index] = { ...write.data, id: docId };
                            } else {
                                db.tasks.push({ ...write.data, id: docId });
                            }
                        } else if (write.type === 'update' && index !== -1) {
                            db.tasks[index] = { ...db.tasks[index], ...write.data };
                        } else if (write.type === 'delete' && index !== -1) {
                            db.tasks.splice(index, 1);
                        }
                    }
                }
                
                saveSessionState();
                console.log(`✅ Mock batch commit: ${writes.length} operazioni`);
                return Promise.resolve();
            }
        };
    },
    
    // Field values
    FieldValue: {
        serverTimestamp: function() {
            return new Date();
        },
        delete: function() {
            return '__DELETE_FIELD__';
        },
        increment: function(n) {
            return `__INCREMENT_${n}__`;
        }
    }
};

// ============================================
// INIZIALIZZAZIONE MOCK FIREBASE
// ============================================

// Controlla se Firebase è già inizializzato
if (MOCK_CONFIG.enableMock && !window.firebase?.apps?.length) {
    console.log('🚀 Inizializzazione Firebase Mock...');
    
    // Sostituisci Firebase globale con mock
    window.firebase = {
        apps: [{ name: '[DEFAULT]' }],
        app: function(name = '[DEFAULT]') {
            return {
                name: name,
                options: {},
                delete: () => Promise.resolve()
            };
        },
        initializeApp: function(config, name = '[DEFAULT]') {
            console.log('✅ Firebase Mock inizializzato', config);
            return this.app(name);
        },
        auth: function(app) {
            return mockAuth;
        },
        firestore: function(app) {
            return mockFirestore;
        }
    };
    
    // Inizializza app mock
    window.firebase.initializeApp({ 
        projectId: 'mock-taskgariboldi',
        appId: '1:mock:web:mock',
        apiKey: 'mock-api-key'
    });
    
    // Esporta per uso globale
    window.auth = mockAuth;
    window.db = mockFirestore;
    
    console.log('🎭 Modalità MOCK ATTIVA - Database isolato per sessione');
    
    // Auto-pulizia all'avvio
    if (MOCK_CONFIG.autoCleanup) {
        setTimeout(() => {
            const db = getSessionDB();
            const now = new Date();
            const expiredTasks = db.tasks.filter(task => 
                task.dueDate && task.dueDate < now && task.status !== 'completed'
            );
            
            if (expiredTasks.length > 0) {
                console.log(`🧹 Mock auto-cleanup: ${expiredTasks.length} task scadute`);
            }
        }, 5000);
    }
} else if (window.firebase?.apps?.length) {
    console.log('✅ Firebase reale già inizializzato - Ignoro mock');
}

// ============================================
// UTILITY FUNCTIONS PER MOCK
// ============================================

// Genera dati demo aggiuntivi
function generateMockDemoData() {
    const db = getSessionDB();
    
    // Aggiungi task completate per statistiche
    for (let i = 0; i < 15; i++) {
        const daysAgo = Math.floor(Math.random() * 60) + 1;
        const completedDaysAgo = Math.floor(Math.random() * daysAgo);
        
        db.tasks.push({
            id: `demo_task_${i}`,
            title: `Task demo ${i + 1}`,
            description: `Questa è una task demo generata automaticamente`,
            assignedTo: db.users[Math.floor(Math.random() * (db.users.length - 1)) + 1].email,
            assignedToName: db.users[Math.floor(Math.random() * (db.users.length - 1)) + 1].displayName,
            createdBy: 'admin@gariboldi.com',
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - (daysAgo - completedDaysAgo) * 24 * 60 * 60 * 1000),
            priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
            status: Math.random() > 0.3 ? 'completed' : 'pending',
            category: ['Sviluppo', 'Marketing', 'Vendite', 'Supporto'][Math.floor(Math.random() * 4)],
            estimatedHours: Math.floor(Math.random() * 40) + 1,
            completedAt: Math.random() > 0.3 ? new Date(Date.now() - completedDaysAgo * 24 * 60 * 60 * 1000) : null,
            isDeleted: Math.random() > 0.8,
            deletedAt: Math.random() > 0.8 ? new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000) : null
        });
    }
    
    saveSessionState();
    console.log(`📊 Dati demo generati: ${db.tasks.length} task totali`);
    return db.tasks.length;
}

// Reset database mock
function resetMockDatabase() {
    clearMockSession();
    getSessionDB(); // Crea nuovo database
    console.log('🔄 Database mock resettato');
}

// Ottieni statistiche mock
function getMockStats() {
    const db = getSessionDB();
    const currentUser = mockAuth.getCurrentUser();
    
    if (!currentUser) return null;
    
    const userEmail = currentUser.email;
    const userTasks = db.tasks.filter(t => t.assignedTo === userEmail);
    const completedTasks = userTasks.filter(t => t.status === 'completed');
    const overdueTasks = userTasks.filter(t => 
        t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
    );
    
    return {
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: userTasks.filter(t => t.status === 'in-progress').length,
        pendingTasks: userTasks.filter(t => t.status === 'pending').length,
        overdueTasks: overdueTasks.length,
        completionRate: userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0,
        avgCompletionDays: 0, // Calcolo più complesso
        efficiencyScore: Math.min(100, Math.round((completedTasks.length / (userTasks.length || 1)) * 100))
    };
}

// Esporta utility
window.mockUtils = {
    generateMockDemoData,
    resetMockDatabase,
    getMockStats,
    getSessionDB,
    clearMockSession,
    getCurrentSessionId: () => currentSessionDB?.sessionId
};

// ============================================
// AUTO-SALVATAGGIO E PULIZIA
// ============================================

// Auto-salva ogni minuto
setInterval(() => {
    if (currentSessionDB) {
        saveSessionState();
    }
}, 60000);

// Pulisci sessioni scadute all'avvio
window.addEventListener('load', function() {
    const now = Date.now();
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith('mockDB_')) {
            try {
                const data = JSON.parse(sessionStorage.getItem(key));
                const age = now - new Date(data.statistics?.lastUpdated).getTime();
                if (age > MOCK_CONFIG.sessionTimeout) {
                    sessionStorage.removeItem(key);
                    console.log(`🧹 Rimossa sessione mock scaduta: ${key}`);
                }
            } catch (error) {
                // Ignora errori parsing
            }
        }
    }
});

console.log('✅ Sistema mock-auth pronto con sessioni isolate');