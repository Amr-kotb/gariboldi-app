import { useState, useEffect, useCallback } from 'react';
import { taskService, userService, statsService } from '../services/firebase/firestore.js';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica tutti i task (admin)
  const loadAllTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 [useTasks] Caricamento task con filtri:', filters);
      const allTasks = await taskService.getAll(filters);
      setTasks(allTasks);
      return allTasks;
    } catch (err) {
      console.error('❌ [useTasks] Errore caricamento task:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Carica task per utente corrente
  const loadUserTasks = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👤 [useTasks] Caricamento task per utente:', userId);
      const userTasks = await taskService.getByUser(userId);
      setTasks(userTasks);
      return userTasks;
    } catch (err) {
      console.error('❌ [useTasks] Errore caricamento task utente:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Crea nuovo task
  const createTask = useCallback(async (taskData) => {
    setError(null);
    
    try {
      console.log('➕ [useTasks] Creazione task:', taskData.title);
      const taskId = await taskService.create(taskData);
      
      // Ricarica la lista
      await loadAllTasks();
      
      return { success: true, taskId };
    } catch (err) {
      console.error('❌ [useTasks] Errore creazione task:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadAllTasks]);

  // Aggiorna task
  const updateTask = useCallback(async (taskId, updates) => {
    setError(null);
    
    try {
      console.log('✏️ [useTasks] Aggiornamento task:', taskId);
      await taskService.update(taskId, updates);
      
      // Aggiorna lo stato locale
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
      
      return { success: true };
    } catch (err) {
      console.error('❌ [useTasks] Errore aggiornamento task:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Elimina task (soft delete)
  const deleteTask = useCallback(async (taskId) => {
    setError(null);
    
    try {
      console.log('🗑️ [useTasks] Eliminazione task:', taskId);
      await taskService.delete(taskId);
      
      // Rimuovi dallo stato locale
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      return { success: true };
    } catch (err) {
      console.error('❌ [useTasks] Errore eliminazione task:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Carica task al mount
  useEffect(() => {
    console.log('🎯 [useTasks] Hook inizializzato');
  }, []);

  return {
    tasks,
    loading,
    error,
    loadAllTasks,
    loadUserTasks,
    createTask,
    updateTask,
    deleteTask,
    refresh: loadAllTasks
  };
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica tutti gli utenti
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👥 [useUsers] Caricamento utenti');
      const allUsers = await userService.getAll();
      setUsers(allUsers);
      return allUsers;
    } catch (err) {
      console.error('❌ [useUsers] Errore caricamento utenti:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Carica solo dipendenti
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👨‍💼 [useUsers] Caricamento dipendenti');
      const employees = await userService.getEmployees();
      setUsers(employees);
      return employees;
    } catch (err) {
      console.error('❌ [useUsers] Errore caricamento dipendenti:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Aggiorna utente
  const updateUser = useCallback(async (userId, updates) => {
    setError(null);
    
    try {
      console.log('✏️ [useUsers] Aggiornamento utente:', userId);
      await userService.update(userId, updates);
      
      // Aggiorna lo stato locale
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      
      return { success: true };
    } catch (err) {
      console.error('❌ [useUsers] Errore aggiornamento utente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    console.log('🎯 [useUsers] Hook inizializzato');
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    loadEmployees,
    updateUser
  };
}

export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica statistiche dashboard
  const loadDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 [useStats] Caricamento statistiche');
      const dashboardStats = await statsService.getDashboardStats();
      setStats(dashboardStats);
      return dashboardStats;
    } catch (err) {
      console.error('❌ [useStats] Errore caricamento statistiche:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carica statistiche utente
  const loadUserStats = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👤 [useStats] Caricamento statistiche utente:', userId);
      const userStats = await statsService.getUserStats(userId);
      return userStats;
    } catch (err) {
      console.error('❌ [useStats] Errore caricamento statistiche utente:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🎯 [useStats] Hook inizializzato');
  }, []);

  return {
    stats,
    loading,
    error,
    loadDashboardStats,
    loadUserStats
  };
}