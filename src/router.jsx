import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ROUTES, ROLES } from './constants/routes';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/SidebarAdmin';
import EmployeeLayout from './components/layout/SidebarEmployee';

import Login from './pages/auth/Login';
import Home from './pages/public/Home';

import AdminDashboard from './pages/admin/Dashboard';
import AdminTasks from './pages/admin/Tasks';
import AdminAssignTask from './pages/admin/AssignTask';
import AdminUsers from './pages/admin/Users';
import AdminStatistics from './pages/admin/Statistics';
import AdminHistory from './pages/admin/History';
import AdminTrash from './pages/admin/Trash';

import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeTasks from './pages/employee/MyTasks';
import EmployeeHistory from './pages/employee/History';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeTrash from './pages/employee/Trash';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ [ProtectedRoute] Checking access...');
  console.log('👤 User:', user ? user.email : 'null');
  console.log('⏳ Loading:', loading);
  console.log('🎭 Required role:', requiredRole);

  if (loading) {
    console.log('⏳ [ProtectedRoute] Still loading...');
    return <div className="loading-container">Caricamento...</div>;
  }

  if (!user) {
    console.log('❌ [ProtectedRoute] No user, redirecting to login');
    return <Navigate to={ROUTES.LOGIN} />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`🚫 [ProtectedRoute] Wrong role. User: ${user.role}, Required: ${requiredRole}`);
    if (user.role === ROLES.ADMIN) {
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} />;
    } else {
      return <Navigate to={ROUTES.EMPLOYEE.DASHBOARD} />;
    }
  }

  console.log('✅ [ProtectedRoute] Access granted');
  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      
      <Route path={ROUTES.ADMIN.ROOT} element={
        <ProtectedRoute requiredRole={ROLES.ADMIN}>
          <AdminLayout>
            <Layout>
              <Routes>
                <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
                <Route path={ROUTES.ADMIN.TASKS} element={<AdminTasks />} />
                <Route path={ROUTES.ADMIN.ASSIGN_TASK} element={<AdminAssignTask />} />
                <Route path={ROUTES.ADMIN.USERS} element={<AdminUsers />} />
                <Route path={ROUTES.ADMIN.STATISTICS} element={<AdminStatistics />} />
                <Route path={ROUTES.ADMIN.HISTORY} element={<AdminHistory />} />
                <Route path={ROUTES.ADMIN.TRASH} element={<AdminTrash />} />
                <Route path="" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} />} />
              </Routes>
            </Layout>
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path={ROUTES.EMPLOYEE.ROOT} element={
        <ProtectedRoute requiredRole={ROLES.EMPLOYEE}>
          <EmployeeLayout>
            <Layout>
              <Routes>
                <Route path={ROUTES.EMPLOYEE.DASHBOARD} element={<EmployeeDashboard />} />
                <Route path={ROUTES.EMPLOYEE.MY_TASKS} element={<EmployeeTasks />} />
                <Route path={ROUTES.EMPLOYEE.HISTORY} element={<EmployeeHistory />} />
                <Route path={ROUTES.EMPLOYEE.PROFILE} element={<EmployeeProfile />} />
                <Route path={ROUTES.EMPLOYEE.TRASH} element={<EmployeeTrash />} />
                <Route path="" element={<Navigate to={ROUTES.EMPLOYEE.DASHBOARD} />} />
              </Routes>
            </Layout>
          </EmployeeLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
    </Routes>
  );
};

export default AppRouter;