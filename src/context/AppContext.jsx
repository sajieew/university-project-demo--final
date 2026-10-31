import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getStudents, saveStudents, addStudent, updateStudent, deleteStudent,
  getUsers, saveUsers, addUser, updateUser, deleteUser,
  getNotifications, addNotification, markAllRead, markNotificationRead
} from '../utils/localStorage';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
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
    const refresh = () => {
      loadStudents();
      loadUsers();
      loadNotifications();
    };
    window.addEventListener('uniportal-verification-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('uniportal-verification-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [loadStudents, loadUsers, loadNotifications]);

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
    addNotification({
      title: 'New student application',
      message: `${student.name} has been added.`,
      type: 'success',
      studentId: student.id,
      studentName: student.name,
      recipientRoles: ['Admin'],
      eventKey: `student-created:${student.id}`,
    });
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
    markAllRead(user);
    loadNotifications();
  }, [loadNotifications, user]);

  const markNotificationAsRead = useCallback((id) => {
    markNotificationRead(id);
    loadNotifications();
  }, [loadNotifications]);
  const visibleNotifications = notifications.filter(notification =>
    (!notification.recipientIds && !notification.recipientRoles) ||
    notification.recipientIds?.includes(user?.id) ||
    notification.recipientRoles?.includes(user?.role)
  );
  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      students, loadStudents, createStudent, editStudent, removeStudent,
      users, loadUsers, createUser, editUser, removeUser,
      notifications: visibleNotifications, loadNotifications, readAllNotifications, markNotificationAsRead, unreadCount,
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
