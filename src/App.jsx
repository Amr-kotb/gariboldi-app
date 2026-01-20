import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { useAuth } from './hooks/useAuth.jsx';

// Import diretti
import Home from './pages/public/Home.jsx';
import Login from './pages/auth/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import EmployeeDashboard from './pages/employee/Dashboard.jsx';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  
  console.log('🔐 [ProtectedRoute] Stato:', { 
    user: user?.email, 
    loading, 
    requiredRole 
  });
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('🔐 [ProtectedRoute] Non autenticato, redirect a /login');
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    console.log(`🔐 [ProtectedRoute] Ruolo sbagliato: ${user.role}, richiesto: ${requiredRole}`);
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  console.log('🚀 [App] Avviata');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route pubbliche - SENZA PROTECTION */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard generica */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {() => {
                const { user } = useAuth();
                console.log('📊 [Dashboard Route] Utente:', user?.role);
                
                if (user?.role === 'admin') {
                  return <Navigate to="/admin/dashboard" replace />;
                } else {
                  return <EmployeeDashboard />;
                }
              }}
            </ProtectedRoute>
          } />
          
          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Employee */}
          <Route path="/employee/dashboard" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          {/* Route per pagine future */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Area Amministrativa</h1>
                <p>Questa sezione è in fase di sviluppo.</p>
                <button onClick={() => window.history.back()}>
                  Torna indietro
                </button>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/employee/*" element={
            <ProtectedRoute requiredRole="dipendente">
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Area Dipendente</h1>
                <p>Questa sezione è in fase di sviluppo.</p>
                <button onClick={() => window.history.back()}>
                  Torna indietro
                </button>
              </div>
            </ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="/404" element={
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              textAlign: 'center'
            }}>
              <div>
                <h1 style={{ fontSize: '48px', color: '#1f1f1f' }}>404</h1>
                <p style={{ color: '#666', margin: '20px 0' }}>Pagina non trovata</p>
                <button
                  onClick={() => window.location.href = '/'}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Torna alla Home
                </button>
              </div>
            </div>
          } />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Aggiungi gli stili globali
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8fafc;
  }
`;
document.head.appendChild(style);

export default App;