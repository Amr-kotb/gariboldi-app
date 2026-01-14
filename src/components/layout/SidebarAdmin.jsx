import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const SidebarAdmin = ({ children }) => {
  const menuItems = [
    { path: ROUTES.ADMIN.DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.ADMIN.TASKS, icon: '✅', label: 'Gestione Task' },
    { path: ROUTES.ADMIN.ASSIGN_TASK, icon: '📝', label: 'Assegna Task' },
    { path: ROUTES.ADMIN.USERS, icon: '👥', label: 'Utenti' },
    { path: ROUTES.ADMIN.STATISTICS, icon: '📈', label: 'Statistiche' },
    { path: ROUTES.ADMIN.HISTORY, icon: '🕒', label: 'Cronologia' },
    { path: ROUTES.ADMIN.TRASH, icon: '🗑️', label: 'Cestino' }
  ];

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header"><h3>Amministrazione</h3></div>
        <nav className="sidebar-menu">
          <ul>{menuItems.map(item => (
            <li key={item.path}>
              <NavLink to={item.path} className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            </li>
          ))}</ul>
        </nav>
      </aside>
      <div className="sidebar-content">{children}</div>
    </div>
  );
};

export default SidebarAdmin;