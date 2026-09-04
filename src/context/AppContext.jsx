import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getStudents, saveStudents, addStudent, updateStudent, deleteStudent,
  getUsers, saveUsers, addUser, updateUser, deleteUser,
  getNotifications, addNotification, markAllRead
} from '../utils/localStorage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [users, setUsers]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts]     = useState([]);

  const loadStudents = useCallback(() => setStudents(getStudents()), []);
  const loadUsers    = useCallback(() => setUsers(getUsers()), []);
  const loadNotifications = useCallback(() => setNotifications(getNotifications()), []);

  useEffect(() => {
    loadStudents();
    loadUsers();
    loadNotifications();
  }, []);

  // ─── Toast ─────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Students ──────────────────────────────────────────────────────
  const createStudent = useCallback((student) => {
    addStudent(student);
    loadStudents();
    addNotification({ message: `New student ${student.name} has been added.`, type: 'success' });
    loadNotifications();
    showToast(`Student ${student.name} saved successfully.`, 'success');
  }, [loadStudents, loadNotifications, showToast]);

  const editStudent = useCallback((id, updates) => {
    updateStudent(id, updates);
    loadStudents();
    showToast('Student record updated.', 'success');
  }, [loadStudents, showToast]);

  const removeStudent = useCallback((id) => {
    deleteStudent(id);
    loadStudents();
    showToast('Student record deleted.', 'info');
  }, [loadStudents, showToast]);

  // ─── Users ─────────────────────────────────────────────────────────
  const createUser = useCallback((user) => {
    addUser(user);
    loadUsers();
    showToast(`User ${user.name} created.`, 'success');
  }, [loadUsers, showToast]);

  const editUser = useCallback((id, updates) => {
    updateUser(id, updates);
    loadUsers();
    showToast('User updated.', 'success');
  }, [loadUsers, showToast]);

  const removeUser = useCallback((id) => {
    deleteUser(id);
    loadUsers();
    showToast('User deleted.', 'info');
  }, [loadUsers, showToast]);

  // ─── Notifications ─────────────────────────────────────────────────
  const readAllNotifications = useCallback(() => {
    markAllRead();
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      students, loadStudents, createStudent, editStudent, removeStudent,
      users, loadUsers, createUser, editUser, removeUser,
      notifications, loadNotifications, readAllNotifications, unreadCount,
      toasts, showToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
