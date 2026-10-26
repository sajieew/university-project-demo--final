// localStorage keys
export const KEYS = {
  STUDENTS:      'uniportal_students',
  USERS:         'uniportal_users',
  NOTIFICATIONS: 'uniportal_notifications',
  AUTH:          'uniportal_auth',
  STAGE1_VERIFICATION: 'uniportal_stage1_verification',
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

export const normalizeVerificationStages = (stages = {}) => {
  if (!stages[8] && !stages[9]) return stages;

  return {
    1: stages[1],
    2: stages[2],
    3: stages[3],
    4: stages[4],
    5: stages[7],
    6: stages[8],
    7: stages[9],
  };
};

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

export const getStage1Verification = () => getItem(KEYS.STAGE1_VERIFICATION) || {};
export const saveStage1Verification = (verification) =>
  localStorage.setItem(KEYS.STAGE1_VERIFICATION, JSON.stringify(verification));

export const getStage2Verification = (studentId) =>
  getItem(`uniportal_stage2_verification_${studentId}`) || {};
export const saveStage2Verification = (studentId, verification) =>
  localStorage.setItem(`uniportal_stage2_verification_${studentId}`, JSON.stringify(verification));

const LEGACY_STAGE_IDS = { 5: 7, 6: 8, 7: 9 };

const studentStageVerificationKey = (studentId, stageId) =>
  stageId === '3' || stageId === '4'
    ? `uniportal_stage${stageId}_verification_${studentId}`
    : `uniportal_stage_verification_v2_${studentId}_${stageId}`;

export const getStudentStageVerification = (studentId, stageId) => {
  const current = getItem(studentStageVerificationKey(studentId, stageId));
  if (current) return current;

  const legacyStageId = LEGACY_STAGE_IDS[stageId];
  return legacyStageId
    ? getItem(`uniportal_stage${legacyStageId}_verification_${studentId}`) || {}
    : {};
};

export const saveStudentStageVerification = (studentId, stageId, verification) =>
  localStorage.setItem(
    studentStageVerificationKey(studentId, stageId),
    JSON.stringify(verification)
  );
