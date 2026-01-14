// AGGIUNGI questi console.log:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoginError('');
  console.log('🔄 [Login] Tentativo di login con:', email);

  const result = await signIn(email, password);
  console.log('✅ [Login] Risultato:', result.success ? 'SUCCESS' : 'FAILED', result);

  if (result.success) {
    const userRole = result.user?.role || 'employee';
    console.log('🎯 [Login] Ruolo utente:', userRole);
    console.log('📍 [Login] Reindirizzamento a:', 
      userRole === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.EMPLOYEE.DASHBOARD);
    
    // Piccolo delay prima del reindirizzamento
    setTimeout(() => {
      navigate(userRole === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.EMPLOYEE.DASHBOARD);
    }, 100);
  } else {
    console.error('❌ [Login] Errore:', result.error);
    setLoginError(result.error || 'Errore durante il login');
  }
};