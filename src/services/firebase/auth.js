import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config.js';

/**
 * Servizio di autenticazione per TaskGariboldi
 */

export const authService = {
  
  /**
   * Registra un nuovo utente
   */
  async register(email, password, userData) {
    try {
      console.log('🔄 [auth] Registrazione utente:', email);
      
      // Crea utente con Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Prepara dati utente per Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        name: userData.name || '',
        role: userData.role || 'dipendente',
        department: userData.department || 'generale',
        avatar: userData.avatar || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      // Salva profilo utente in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, userProfile);
      
      // Aggiorna profilo Firebase Auth
      if (userData.name) {
        await updateProfile(user, {
          displayName: userData.name
        });
      }
      
      console.log('✅ [auth] Utente registrato:', user.uid);
      return { success: true, user: userProfile };
      
    } catch (error) {
      console.error('❌ [auth] Errore registrazione:', error);
      let message = 'Errore durante la registrazione';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email già in uso';
          break;
        case 'auth/invalid-email':
          message = 'Email non valida';
          break;
        case 'auth/weak-password':
          message = 'Password troppo debole';
          break;
      }
      
      return { success: false, error: message };
    }
  },
  
  /**
   * Login utente
   */
  async login(email, password) {
    try {
      console.log('🔄 [auth] Login utente:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Recupera dati utente da Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('Profilo utente non trovato');
      }
      
      const userData = userDoc.data();
      
      // Aggiorna ultimo login
      await setDoc(userDocRef, {
        ...userData,
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Salva dati utente in localStorage
      const userToStore = {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role,
        department: userData.department,
        avatar: userData.avatar,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        lastLoginAt: new Date().toISOString()
      };
      
      localStorage.setItem('taskgariboldi_user', JSON.stringify(userToStore));
      
      console.log('✅ [auth] Login riuscito:', user.uid);
      return { success: true, user: userToStore };
      
    } catch (error) {
      console.error('❌ [auth] Errore login:', error);
      let message = 'Errore durante il login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Utente non trovato';
          break;
        case 'auth/wrong-password':
          message = 'Password errata';
          break;
        case 'auth/invalid-email':
          message = 'Email non valida';
          break;
        case 'auth/user-disabled':
          message = 'Account disabilitato';
          break;
      }
      
      return { success: false, error: message };
    }
  },
  
  /**
   * Logout utente
   */
  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('taskgariboldi_user');
      console.log('✅ [auth] Logout riuscito');
      return { success: true };
    } catch (error) {
      console.error('❌ [auth] Errore logout:', error);
      return { success: false, error: 'Errore durante il logout' };
    }
  },
  
  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ [auth] Email reset inviata a:', email);
      return { success: true, message: 'Email di reset inviata' };
    } catch (error) {
      console.error('❌ [auth] Errore reset password:', error);
      return { success: false, error: 'Errore durante il reset password' };
    }
  },
  
  /**
   * Ottieni utente corrente
   */
  getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        
        if (!user) {
          resolve(null);
          return;
        }
        
        try {
          // Recupera dati da Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            resolve({
              uid: user.uid,
              email: user.email,
              name: userData.name,
              role: userData.role,
              department: userData.department,
              avatar: userData.avatar,
              isActive: userData.isActive,
              createdAt: userData.createdAt,
              lastLoginAt: userData.lastLoginAt
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('❌ [auth] Errore recupero utente:', error);
          resolve(null);
        }
      });
    });
  },
  
  /**
   * Aggiorna profilo utente
   */
  async updateUserProfile(userId, updates) {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      await setDoc(userDocRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log('✅ [auth] Profilo aggiornato:', userId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [auth] Errore aggiornamento profilo:', error);
      return { success: false, error: 'Errore durante l\'aggiornamento' };
    }
  }
};