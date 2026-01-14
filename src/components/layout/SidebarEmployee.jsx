import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const SidebarEmployee = ({ children }) => {
  const menuItems = [
    { path: ROUTES.EMPLOYEE.DASHBOARD, icon: '📊', label: 'Dashboard' },
    { path: ROUTES.EMPLOYEE.MY_TASKS, icon: '✅', label: 'I Miei Task' },
    { path: ROUTES.EMPLOYEE.HISTORY, icon: '🕒', label: 'Cronologia' },
    { path: ROUTES.EMPLOYEE.PROFILE, icon: '👤', label: 'Profilo' },
    { path: ROUTES.EMPLOYEE.TRASH, icon: '🗑️', label: 'Cestino' }
  ];

  return (
    <div className="employee-layout">
      <aside className="sidebar">
        <div className="sidebar-header"><h3>Area Dipendente</h3></div>
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

export default SidebarEmployee;