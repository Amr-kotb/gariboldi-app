import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { TasksProvider } from './hooks/useTasks.jsx';
import AppRouter from './router.jsx';
import './styles/main.css';
import './styles/variables.css';
import './styles/components.css';

function App() {
  console.log('✅ App component is mounting...');
  
  return (
    <AuthProvider>
      <TasksProvider>
        <Router>
          <div className="app-container">
            <AppRouter />
          </div>
        </Router>
      </TasksProvider>
    </AuthProvider>
  );
}

export default App;