// localStorage keys
export const KEYS = {
  STUDENTS:      'uniportal_students',
  USERS:         'uniportal_users',
  NOTIFICATIONS: 'uniportal_notifications',
  AUTH:          'uniportal_auth',
};

// Generic helpers
export const getItem = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write error', e);
  }
};

// Students
export const getStudents = () => getItem(KEYS.STUDENTS) || [];
export const saveStudents = (list) => setItem(KEYS.STUDENTS, list);

export const addStudent = (student) => {
  const list = getStudents();
  list.unshift(student);
  saveStudents(list);
};

export const updateStudent = (id, updates) => {
  const list = getStudents().map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s);
  saveStudents(list);
};

export const deleteStudent = (id) => {
  const list = getStudents().filter(s => s.id !== id);
  saveStudents(list);
};

export const findStudent = (id) => getStudents().find(s => s.id === id) || null;

// Users
export const getUsers = () => getItem(KEYS.USERS) || [];
export const saveUsers = (list) => setItem(KEYS.USERS, list);

export const addUser = (user) => {
  const list = getUsers();
  list.push(user);
  saveUsers(list);
};

export const updateUser = (id, updates) => {
  const list = getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
  saveUsers(list);
};

export const deleteUser = (id) => {
  const list = getUsers().filter(u => u.id !== id);
  saveUsers(list);
};

// Notifications
export const getNotifications = () => getItem(KEYS.NOTIFICATIONS) || [];
export const saveNotifications = (list) => setItem(KEYS.NOTIFICATIONS, list);

export const addNotification = (notification) => {
  const list = getNotifications();
  list.unshift({ ...notification, id: Date.now().toString(), read: false, createdAt: new Date().toISOString() });
  if (list.length > 50) list.pop();
  saveNotifications(list);
};

export const markAllRead = () => {
  const list = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(list);
};

// Auth
export const getAuth = () => getItem(KEYS.AUTH);
export const setAuth = (auth) => setItem(KEYS.AUTH, auth);
export const clearAuth = () => localStorage.removeItem(KEYS.AUTH);
