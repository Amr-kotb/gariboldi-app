import React, { useState, useEffect, createContext, useContext } from 'react';

// Crea il context
const AuthContext = createContext();

// Hook personalizzato - DEVE essere esportato
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
}

// Provider - DEVE essere esportato
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 [AuthProvider] Inizializzato');

  // Carica utente dal localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('taskg_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ Utente caricato:', parsedUser.email);
        setUser(parsedUser);
      } catch (error) {
        console.error('Errore parsing utente:', error);
      }
    }
    setLoading(false);
  }, []);

  // Login semplice per test
  const signIn = async (email, password) => {
    console.log('🔑 Tentativo login:', email);
    
    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Crea utente di test
      const userData = {
        uid: `user-${Date.now()}`,
        email: email,
        name: email.split('@')[0].replace('.', ' '),
        role: email.includes('admin') ? 'admin' : 'dipendente',
        department: 'Dipartimento',
        avatar: '👤',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Salva
      localStorage.setItem('taskg_user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Login riuscito');
      return { success: true, user: userData };
      
    } catch (error) {
      console.error('❌ Errore login:', error);
      return { success: false, error: 'Errore di connessione' };
    }
  };

  const logout = () => {
    localStorage.removeItem('taskg_user');
    setUser(null);
    return { success: true };
  };

  const value = {
    user,
    loading,
    signIn,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'dipendente',
    department: user?.department
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Export default per compatibilità
export default { useAuth, AuthProvider };