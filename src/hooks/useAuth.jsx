// RIMPIAZZA l'intero useAuth.jsx con:
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 AuthProvider initialized - User:', user ? 'Logged in' : 'Not logged');

  // Funzione login memorizzata
  const signIn = useCallback(async (email, password) => {
    console.log('🔑 Attempting login with:', email);
    
    try {
      // Simula ritardo API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockUser = {
        uid: 'test-123',
        email: email,
        displayName: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'employee'
      };
      
      console.log('✅ Login successful, user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 Logging out');
    setUser(null);
    localStorage.removeItem('user');
    return { success: true };
  }, []);

  useEffect(() => {
    console.log('🔄 Running auth check...');
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('📦 Found saved user:', parsedUser.email);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log('📭 No saved user found');
    }
    
    // Piccolo delay per evitare flash
    setTimeout(() => {
      setLoading(false);
      console.log('✅ Auth check completed, loading:', false);
    }, 100);
  }, []);

  const value = {
    user,
    loading,
    signIn,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}