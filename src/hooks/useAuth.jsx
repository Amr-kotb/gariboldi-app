const signIn = async (email, password) => {
  console.log('Login dipendente:', email);
  
  try {
    // SIMULAZIONE - Sostituire con Firebase
    if (!email || !password) {
      return { success: false, error: 'Email e password obbligatorie' };
    }
    
    // Qui normalmente chiameresti Firebase Auth
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Dati utente di esempio (senza demo)
    const userData = {
      uid: `user-${Date.now()}`,
      email: email,
      name: email.split('@')[0].replace('.', ' '),
      role: 'dipendente',
      department: 'Dipendente',
      avatar: '👤',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    // Salva
    localStorage.setItem('taskg_user', JSON.stringify(userData));
    setUser(userData);
    
    return { success: true, user: userData };
    
  } catch (error) {
    console.error('Errore login:', error);
    return { success: false, error: 'Errore di connessione' };
  }
};