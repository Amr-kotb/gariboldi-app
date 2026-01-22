// src/hooks/useAuth.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('🔐 [AuthProvider] Inizializzato');

  // Ascolta cambiamenti autenticazione
  useEffect(() => {
    console.log('🔍 [AuthProvider] Setup ascoltatore auth...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('👤 [AuthProvider] Stato autenticazione:', firebaseUser ? `Loggato: ${firebaseUser.email}` : 'Non loggato');
      
      if (firebaseUser) {
        try {
          // Ottieni dati utente da Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Determina ruolo
          let role = userData.role;
          if (!role) {
            const email = firebaseUser.email.toLowerCase();
            console.log('🔍 [AuthProvider] Controllo ruolo per:', email);
            
            const isAdmin = 
              email.includes('admin') || 
              email.includes('administrator') ||
              email.includes('amministratore') ||
              email === 'admin@gariboldi.com' ||
              email === 'admin@taskg.com' ||
              email === 'admin@test.com';
            
            // ⭐⭐ CAMBIA QUESTA RIGA ⭐⭐
            role = isAdmin ? 'admin' : 'dipendente';  // ← "dipendente" invece di "employee"
            console.log(`🎯 [AuthProvider] Ruolo assegnato: ${role.toUpperCase()}`);
            
            // Salva il ruolo in Firestore
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                role: role,
                email: firebaseUser.email,
                name: firebaseUser.email.split('@')[0],
                lastLogin: new Date().toISOString()
              }, { merge: true });
            } catch (firestoreError) {
              console.warn('⚠️ [AuthProvider] Errore salvataggio ruolo:', firestoreError);
            }
          }
          
          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || firebaseUser.email.split('@')[0],
            role: role,
            department: userData.department || 'Generale',
            photoURL: firebaseUser.photoURL,
            isActive: userData.isActive !== false,
            lastLogin: userData.lastLogin || new Date().toISOString()
          };
          
          console.log('✅ [AuthProvider] Utente caricato:', userObj);
          setUser(userObj);
          
        } catch (error) {
          console.error('❌ [AuthProvider] Errore caricamento dati utente:', error);
          setUser(null);
        }
      } else {
        console.log('🚪 [AuthProvider] Nessun utente loggato');
        setUser(null);
      }
      
      setLoading(false);
      setError('');
    });

    return unsubscribe;
  }, []);

  // Login con Firebase
  const signIn = async (email, password) => {
    console.log('🔑 [AuthProvider] Tentativo login:', email);
    setError('');
    
    if (!email || !password) {
      const err = 'Inserisci email e password';
      setError(err);
      return { success: false, error: err };
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ [AuthProvider] Login Firebase riuscito per:', email);
      
      return { 
        success: true, 
        user: userCredential.user,
        email: email
      };
      
    } catch (error) {
      let errorMessage = 'Errore di autenticazione';
      
      switch (error.code) {
        case 'auth/invalid-email': errorMessage = 'Email non valida'; break;
        case 'auth/user-not-found': errorMessage = 'Utente non trovato'; break;
        case 'auth/wrong-password': errorMessage = 'Password errata'; break;
        case 'auth/too-many-requests': errorMessage = 'Troppi tentativi falliti'; break;
        default: errorMessage = error.message || 'Errore sconosciuto';
      }
      
      console.log('❌ [AuthProvider] Login fallito:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    console.log('🚪 [AuthProvider] Logout');
    try {
      await signOut(auth);
      console.log('✅ [AuthProvider] Logout riuscito');
      return { success: true };
    } catch (error) {
      const errorMessage = 'Errore durante il logout';
      console.error('❌ [AuthProvider] Errore logout:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    logout,
    isAuthenticated: !!user,
    // ⭐⭐ AGGIORNA ANCHE QUESTI ⭐⭐
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'dipendente'  // ← anche qui "dipendente"
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;