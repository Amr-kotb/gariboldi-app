import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // CAMBIA QUI
import { AuthProvider } from './hooks/useAuth.jsx';
import { useAuth } from './hooks/useAuth.jsx';

// Import pagine (assicurati che esistano)
import Home from './pages/public/Home.jsx';
import Login from './pages/auth/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import EmployeeDashboard from './pages/employee/Dashboard.jsx';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
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
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router> {/* ORA USA HashRouter */}
        <Routes>
          {/* Route pubbliche */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard generica */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {() => {
                const { user } = useAuth();
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
          
          {/* 404 - Solo per percorsi sbagliati */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Aggiungi stile per l'animazione
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default App;