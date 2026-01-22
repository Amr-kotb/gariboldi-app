import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

// Import pagine pubbliche
import Home from './pages/public/Home.jsx';
import Login from './pages/auth/Login.jsx';

// Import pagine admin
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminTasks from './pages/admin/Tasks.jsx';
import AdminStatistics from './pages/admin/Statistics.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import AdminHistory from './pages/admin/History.jsx';
import AdminAssignTask from './pages/admin/AssignTask.jsx';
import AdminActivity from './pages/admin/Activity.jsx';
import AdminTrash from './pages/admin/Trash.jsx';

// Import pagine employee
import EmployeeDashboard from './pages/employee/Dashboard.jsx';
import EmployeeMyTasks from './pages/employee/MyTasks.jsx';
import EmployeeReports from './pages/employee/Reports.jsx';
import EmployeeMessages from './pages/employee/Messages.jsx';
import EmployeeProfile from './pages/employee/Profile.jsx';
import EmployeeHistory from './pages/employee/History.jsx';
import EmployeeTrash from './pages/employee/Trash.jsx';

// Import componenti
import LoginRedirect from './components/LoginRedirect.jsx';

// Componente ProtectedRoute
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  
  console.log('🛡️ [ProtectedRoute] Controllo accesso:', {
    user: user ? `${user.email} (${user.role})` : 'null',
    requiredRole,
    match: user?.role === requiredRole,
    loading
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
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ [ProtectedRoute] Utente non autenticato, reindirizzo a /login');
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    console.log(`🚫 [ProtectedRoute] Accesso negato: ${user.role} ≠ ${requiredRole}`);
    
    // Reindirizza alla dashboard corretta
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'dipendente') {
      return <Navigate to="/employee/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  console.log('✅ [ProtectedRoute] Accesso autorizzato per:', user.email);
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ==================== */}
          {/* ROUTE PUBBLICHE */}
          {/* ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/redirect" element={<LoginRedirect />} />
          
          {/* ==================== */}
          {/* ROUTE ADMIN */}
          {/* ==================== */}
          
          {/* Dashboard Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Gestione Utenti */}
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          
          {/* Gestione Task */}
          <Route path="/admin/tasks" element={
            <ProtectedRoute requiredRole="admin">
              <AdminTasks />
            </ProtectedRoute>
          } />
          
          {/* Assegnazione Task */}
          <Route path="/admin/assign-task" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAssignTask />
            </ProtectedRoute>
          } />
          
          {/* Statistiche */}
          <Route path="/admin/stats" element={
            <ProtectedRoute requiredRole="admin">
              <AdminStatistics />
            </ProtectedRoute>
          } />
          
          {/* Report */}
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <AdminReports />
            </ProtectedRoute>
          } />
          
          {/* Impostazioni */}
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          
          {/* Cronologia */}
          <Route path="/admin/history" element={
            <ProtectedRoute requiredRole="admin">
              <AdminHistory />
            </ProtectedRoute>
          } />
          
          {/* Attività */}
          <Route path="/admin/activity" element={
            <ProtectedRoute requiredRole="admin">
              <AdminActivity />
            </ProtectedRoute>
          } />
          
          {/* Cestino */}
          <Route path="/admin/trash" element={
            <ProtectedRoute requiredRole="admin">
              <AdminTrash />
            </ProtectedRoute>
          } />
          
          {/* ==================== */}
          {/* ROUTE DIPENDENTE */}
          {/* ==================== */}
          
          {/* Dashboard Dipendente */}
          <Route path="/employee/dashboard" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          {/* I miei Task */}
          <Route path="/employee/tasks" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeMyTasks />
            </ProtectedRoute>
          } />
          
          {/* I miei Report */}
          <Route path="/employee/reports" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeReports />
            </ProtectedRoute>
          } />
          
          {/* Messaggi */}
          <Route path="/employee/messages" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeMessages />
            </ProtectedRoute>
          } />
          
          {/* Profilo */}
          <Route path="/employee/profile" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeProfile />
            </ProtectedRoute>
          } />
          
          {/* Cronologia Dipendente */}
          <Route path="/employee/history" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeHistory />
            </ProtectedRoute>
          } />
          
          {/* Cestino Dipendente */}
          <Route path="/employee/trash" element={
            <ProtectedRoute requiredRole="dipendente">
              <EmployeeTrash />
            </ProtectedRoute>
          } />
          
          {/* ==================== */}
          {/* 404 & REDIRECTS */}
          {/* ==================== */}
          
          {/* Redirect per admin che accede a route employee */}
          <Route path="/employee/*" element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />
          
          {/* Redirect per dipendente che accede a route admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="dipendente">
              <Navigate to="/employee/dashboard" replace />
            </ProtectedRoute>
          } />
          
          {/* 404 - Pagina non trovata */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              backgroundColor: '#f8fafc'
            }}>
              <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
              <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>
                Pagina non trovata
              </p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Torna alla Home
              </button>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Stili globali
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  * {
    box-sizing: border-box;
  }
  
  .mb-4 {
    margin-bottom: 20px;
  }
  
  .page-header {
    margin-bottom: 30px;
  }
  
  .page-header h1 {
    font-size: 28px;
    color: #1f2937;
    margin: 0 0 10px 0;
  }
  
  .page-header p {
    color: #6b7280;
    margin: 0;
  }
`;
document.head.appendChild(style);

export default App; 