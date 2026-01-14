import { useState, createContext, useContext } from 'react';

const TasksContext = createContext();

export function useTasks() { return useContext(TasksContext); }

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Simulazione dati
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending' },
        { id: 2, title: 'Task 2', status: 'completed' }
      ];
      setTasks(mockTasks);
      return { success: true, data: mockTasks };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tasks, loading, error, loadTasks,
    addTask: () => {},
    editTask: () => {},
    removeTask: () => {}
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}   