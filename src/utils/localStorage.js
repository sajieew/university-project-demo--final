// localStorage keys
export const KEYS = {
  STUDENTS:      'uniportal_students',
  USERS:         'uniportal_users',
  NOTIFICATIONS: 'uniportal_notifications',
  AUTH:          'uniportal_auth',
  STAGE1_VERIFICATION: 'uniportal_stage1_verification',
  PROVISIONAL_ALLOTMENTS: 'uniportal_provisional_allotments',
  ENTRANCE_EXAMINATION_TICKETS: 'uniportal_entrance_examination_tickets',
  RANK_STATEMENTS: 'uniportal_rank_statements',
  VERIFICATION_ASSIGNMENTS: 'uniportal_verification_assignments',
  DUPLICATE_OVERRIDES: 'uniportal_duplicate_overrides',
};

export const VERIFICATION_UPDATED_EVENT = 'uniportal-verification-updated';
export const ADMISSION_DRAFT_UPDATED_EVENT = 'uniportal-admission-draft-updated';

const notifyVerificationUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(VERIFICATION_UPDATED_EVENT));
  }
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

export const recordDuplicateOverride = (override) => {
  if (getAuth()?.role !== 'Admin') {
    throw new Error('Only an administrator can record a duplicate override.');
  }
  if (!override?.reason?.trim()) {
    throw new Error('An explanation is required for a duplicate override.');
  }
  const history = getItem(KEYS.DUPLICATE_OVERRIDES) || [];
  setItem(KEYS.DUPLICATE_OVERRIDES, [...history, override]);
};

export const getProvisionalAllotments = () => getItem(KEYS.PROVISIONAL_ALLOTMENTS) || [];

export const saveProvisionalAllotment = (allotment, role) => {
  if (role !== 'Faculty') {
    throw new Error('Only faculty can save provisional allotments.');
  }

  const allotments = getProvisionalAllotments();
  const updated = allotments.some(item => item.studentId === allotment.studentId)
    ? allotments.map(item => item.studentId === allotment.studentId ? allotment : item)
    : [...allotments, allotment];

  localStorage.setItem(KEYS.PROVISIONAL_ALLOTMENTS, JSON.stringify(updated));
  return updated;
};

export const getEntranceExaminationTickets = () =>
  getItem(KEYS.ENTRANCE_EXAMINATION_TICKETS) || [];

export const saveEntranceExaminationTicket = (ticket, role) => {
  if (role !== 'Faculty') {
    throw new Error('Only faculty can save entrance examination hall tickets.');
  }

  const tickets = getEntranceExaminationTickets();
  const updated = tickets.some(item => item.studentId === ticket.studentId)
    ? tickets.map(item => item.studentId === ticket.studentId ? ticket : item)
    : [...tickets, ticket];

  localStorage.setItem(KEYS.ENTRANCE_EXAMINATION_TICKETS, JSON.stringify(updated));
  return updated;
};

export const getRankStatements = () => getItem(KEYS.RANK_STATEMENTS) || [];

export const saveRankStatement = (statement, role) => {
  if (role !== 'Faculty') {
    throw new Error('Only faculty can save rank statements.');
  }

  const statements = getRankStatements();
  const updated = statements.some(item => item.studentId === statement.studentId)
    ? statements.map(item => item.studentId === statement.studentId ? statement : item)
    : [...statements, statement];

  localStorage.setItem(KEYS.RANK_STATEMENTS, JSON.stringify(updated));
  return updated;
};

export const normalizeVerificationStages = (stages = {}) => {
  if (Object.prototype.hasOwnProperty.call(stages, 'removedCommunityCertificateStage')) return stages;

  const usesEarlierNumbering = Object.prototype.hasOwnProperty.call(stages, '8')
    || Object.prototype.hasOwnProperty.call(stages, '9');
  const usesCurrentNumbering = Object.prototype.hasOwnProperty.call(stages, '7');
  if (!usesEarlierNumbering && !usesCurrentNumbering) return stages;

  const normalized = {
    ...stages,
    1: stages[1],
    2: stages[2],
    3: stages[3],
    4: usesEarlierNumbering ? stages[7] : stages[5],
    5: usesEarlierNumbering ? stages[8] : stages[6],
    6: usesEarlierNumbering ? stages[9] : stages[7],
    removedCommunityCertificateStage: stages[4],
  };
  delete normalized[7];
  delete normalized[8];
  delete normalized[9];
  return normalized;
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
  if (notification.eventKey && list.some(item => item.eventKey === notification.eventKey)) return;
  list.unshift({
    ...notification,
    id: notification.eventKey || Date.now().toString(),
    read: false,
    createdAt: new Date().toISOString(),
  });
  if (list.length > 50) list.pop();
  saveNotifications(list);
  notifyVerificationUpdated();
};

const isNotificationForUser = (notification, user) =>
  !notification.recipientIds && !notification.recipientRoles ||
  notification.recipientIds?.includes(user?.id) ||
  notification.recipientRoles?.includes(user?.role);

export const markAllRead = (user = null) => {
  const list = getNotifications().map(n =>
    isNotificationForUser(n, user) ? { ...n, read: true } : n
  );
  saveNotifications(list);
  notifyVerificationUpdated();
};

export const markNotificationRead = (notificationId) => {
  const list = getNotifications().map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(list);
  notifyVerificationUpdated();
};

// Auth
export const getAuth = () => getItem(KEYS.AUTH);
export const setAuth = (auth) => setItem(KEYS.AUTH, auth);
export const clearAuth = () => localStorage.removeItem(KEYS.AUTH);

export const getVerificationHistory = (studentId) =>
  studentId ? getItem(`uniportal_verification_history_${studentId}`) || [] : [];

const decisionValue = value => {
  if (value && typeof value === 'object') {
    return value.status || value.decision || value.value || '';
  }
  return value || '';
};

const decisionLabel = value => {
  const decision = decisionValue(value);
  if (decision === 'Yes') return 'Verified';
  if (decision === 'No' || decision === 'Rejected') return 'Rejected';
  return 'Pending';
};

const getDecisionRemarks = value =>
  value && typeof value === 'object' ? value.remarks || '' : '';

const MANDATORY_DOCUMENTS_BY_STAGE = {
  1: ['applicationFormPresent'],
  2: ['tenthMarkCertificate', 'eleventhMarkCertificate', 'twelfthMarkCertificate'],
  3: ['birthCertificate', 'aadhaarCard', 'incomeCertificate', 'nativityCertificate', 'communityCertificate'],
  4: ['transferCertificate'],
  5: ['paymentDoneCertificate'],
  6: ['approvalCertificate'],
};

const isStageComplete = (stageId, verification) =>
  MANDATORY_DOCUMENTS_BY_STAGE[stageId].every(documentId =>
    decisionValue(verification[documentId]) === 'Yes'
  );

const allMandatoryStagesComplete = (overrideStageId, overrideVerification) =>
  Object.keys(MANDATORY_DOCUMENTS_BY_STAGE).every(stageId => {
    const verification = String(stageId) === String(overrideStageId)
      ? overrideVerification
      : stageId === '1'
        ? getStage1Verification(overrideVerification.studentId)
        : stageId === '2'
          ? getStage2Verification(overrideVerification.studentId)
          : getStudentStageVerification(overrideVerification.studentId, stageId);
    return isStageComplete(stageId, verification);
  });

const recordVerificationChanges = (studentId, stageId, previous, next) => {
  if (!studentId) return;
  const auth = getAuth();
  const history = getVerificationHistory(studentId);
  const changes = Object.keys(next).flatMap(documentId => {
    const previousValue = previous[documentId];
    const nextValue = next[documentId];
    const previousDecision = decisionValue(previousValue);
    const nextDecision = decisionValue(nextValue);
    if (previousDecision === nextDecision) return [];

    return [{
      id: `${Date.now()}-${stageId}-${documentId}-${history.length}`,
      stageId: String(stageId),
      documentId,
      previousStatus: decisionLabel(previousValue),
      updatedStatus: decisionLabel(nextValue),
      officerId: auth?.id || '',
      officerName: auth?.name || 'Unknown officer',
      occurredAt: new Date().toISOString(),
      remarks: getDecisionRemarks(nextValue) ||
        normalizeVerificationStages(findStudent(studentId)?.stages || {})[stageId]?.remarks || '',
    }];
  });
  if (!changes.length) return;

  const updatedHistory = [...history, ...changes];
  localStorage.setItem(`uniportal_verification_history_${studentId}`, JSON.stringify(updatedHistory));

  const student = findStudent(studentId);
  const assignment = getStudentOfficerAssignment(studentId);
  const recipients = [...new Set([
    ...(assignment?.officerId ? [assignment.officerId] : []),
    ...Object.values(assignment?.stageAssignments || {}),
  ])];
  const notify = (title, message, suffix, type) => addNotification({
    title,
    message,
    type,
    studentId,
    studentName: student?.name || '',
    recipientIds: recipients,
    recipientRoles: ['Admin'],
    eventKey: `verification:${studentId}:${stageId}:${suffix}:${Date.now()}`,
  });

  if (!isStageComplete(stageId, previous) && isStageComplete(stageId, next)) {
    notify('Verification stage completed', `${student?.name || 'Student'} completed Stage ${stageId}.`, `stage-completed:${stageId}`, 'success');
  }
  const stageMap = {
    1: { ...getStage1Verification(studentId), studentId },
    2: { ...getStage2Verification(studentId), studentId },
    3: { ...getStudentStageVerification(studentId, '3'), studentId },
    4: { ...getStudentStageVerification(studentId, '4'), studentId },
    5: { ...getStudentStageVerification(studentId, '5'), studentId },
    6: { ...getStudentStageVerification(studentId, '6'), studentId },
  };
  const previouslyFullyVerified = allMandatoryStagesComplete(stageId, {
    ...stageMap[stageId],
    ...previous,
    studentId,
  });
  const fullyVerified = Object.entries(stageMap).every(([id, verification]) =>
    isStageComplete(id, String(id) === String(stageId) ? next : verification)
  );
  if (!previouslyFullyVerified && fullyVerified) {
    notify('Student fully verified', `${student?.name || 'Student'} has completed all mandatory verification stages.`, 'fully-verified', 'success');
  }

  changes.forEach(change => {
    if (change.updatedStatus === 'Rejected') {
      notify('Document rejected', `${student?.name || 'Student'}: ${change.documentId} was rejected.`, `rejected:${change.documentId}`, 'error');
    } else if (change.previousStatus === 'Rejected') {
      notify('Document resubmitted', `${student?.name || 'Student'}: ${change.documentId} was updated after rejection.`, `resubmitted:${change.documentId}`, 'info');
    }
  });
  notifyVerificationUpdated();
};

const assignmentKeyForStage = stageId => stageId == null ? 'officerId' : String(stageId);

export const getVerificationAssignments = () => getItem(KEYS.VERIFICATION_ASSIGNMENTS) || [];

export const getStudentOfficerAssignment = studentId =>
  getVerificationAssignments().find(assignment => assignment.studentId === studentId) || null;

export const getAssignedOfficerId = (studentId, stageId) => {
  const assignment = getStudentOfficerAssignment(studentId);
  return assignment?.stageAssignments?.[String(stageId)] || assignment?.officerId || '';
};

export const isVerificationStageAssignedToUser = (studentId, stageId, user = getAuth()) => {
  if (user?.role === 'Admin') return true;
  if (user?.role !== 'Faculty') return false;
  if (!studentId) return false;
  if (!findStudent(studentId)) return true;
  return getAssignedOfficerId(studentId, stageId) === user.id;
};

export const getStudentsAssignedToOfficer = officerId =>
  getVerificationAssignments()
    .filter(assignment =>
      assignment.officerId === officerId ||
      Object.values(assignment.stageAssignments || {}).includes(officerId)
    )
    .map(assignment => assignment.studentId);

export const saveStudentOfficerAssignment = (studentId, stageId, officerId) => {
  const auth = getAuth();
  if (auth?.role !== 'Admin') {
    throw new Error('Only administrators can assign verification officers.');
  }
  if (stageId != null && !['1', '2', '3', '4', '5', '6'].includes(String(stageId))) {
    throw new Error('Choose one of the six verification stages.');
  }
  const officer = officerId && getUsers().find(user =>
    user.id === officerId && user.role === 'Faculty' && user.status === 'Active'
  );
  if (officerId && !officer) {
    throw new Error('Assignments require an active Faculty officer.');
  }
  if (!findStudent(studentId)) {
    throw new Error('Cannot assign an officer to a missing student record.');
  }

  const assignments = getVerificationAssignments();
  const existing = assignments.find(item => item.studentId === studentId);
  const updated = existing
    ? { ...existing, stageAssignments: { ...(existing.stageAssignments || {}) } }
    : { studentId, officerId: '', stageAssignments: {}, history: [] };
  const assignmentKey = assignmentKeyForStage(stageId);
  const previousOfficerId = assignmentKey === 'officerId'
    ? updated.officerId
    : updated.stageAssignments[assignmentKey] || '';
  if (previousOfficerId === officerId) return updated;

  if (assignmentKey === 'officerId') updated.officerId = officerId || '';
  else if (officerId) updated.stageAssignments[assignmentKey] = officerId;
  else delete updated.stageAssignments[assignmentKey];

  const changedAt = new Date().toISOString();
  updated.history = [
    ...(updated.history || []),
    {
      stageId: stageId == null ? null : String(stageId),
      previousOfficerId,
      officerId: officerId || '',
      changedBy: auth.id,
      changedAt,
    },
  ];
  const nextAssignments = existing
    ? assignments.map(item => item.studentId === studentId ? updated : item)
    : [...assignments, updated];
  localStorage.setItem(KEYS.VERIFICATION_ASSIGNMENTS, JSON.stringify(nextAssignments));

  const student = findStudent(studentId);
  if (officer) {
    const reassigned = Boolean(previousOfficerId);
    addNotification({
      title: reassigned ? 'Verification officer reassigned' : 'Verification officer assigned',
      message: `${officer.name} ${reassigned ? 'was assigned to' : 'is now assigned to'} ${student.name}${stageId == null ? '' : ` — Stage ${stageId}`}.`,
      type: 'info',
      studentId,
      studentName: student.name,
      recipientIds: [...new Set([officerId, ...(previousOfficerId ? [previousOfficerId] : [])])],
      recipientRoles: ['Admin'],
      eventKey: `assignment:${studentId}:${assignmentKey}:${changedAt}`,
    });
  }
  notifyVerificationUpdated();
  return updated;
};

const studentStage1VerificationKey = (studentId) =>
  `uniportal_stage1_verification_${studentId}`;

export const getStage1Verification = (studentId) => {
  if (!studentId) return getItem(KEYS.STAGE1_VERIFICATION) || {};
  return getItem(studentStage1VerificationKey(studentId))
    || {};
};
export const saveStage1Verification = (verification, studentId) => {
  if (!isVerificationStageAssignedToUser(studentId, '1')) {
    throw new Error('You are not assigned to verify Stage 1 for this student.');
  }
  const previous = getStage1Verification(studentId);
  localStorage.setItem(
    studentId ? studentStage1VerificationKey(studentId) : KEYS.STAGE1_VERIFICATION,
    JSON.stringify(verification)
  );
  recordVerificationChanges(studentId, '1', previous, verification);
  notifyVerificationUpdated();
};

export const getStage2Verification = (studentId) =>
  getItem(`uniportal_stage2_verification_${studentId}`) || {};
export const saveStage2Verification = (studentId, verification) => {
  if (!isVerificationStageAssignedToUser(studentId, '2')) {
    throw new Error('You are not assigned to verify Stage 2 for this student.');
  }
  const previous = getStage2Verification(studentId);
  localStorage.setItem(`uniportal_stage2_verification_${studentId}`, JSON.stringify(verification));
  recordVerificationChanges(studentId, '2', previous, verification);
  notifyVerificationUpdated();
};

const LEGACY_STAGE_IDS = { 5: 7, 6: 8, 7: 9 };
const PREVIOUS_STAGE_IDS = { 4: 5, 5: 6, 6: 7 };

const studentStageVerificationKey = (studentId, stageId) =>
  stageId === '3'
    ? `uniportal_stage3_verification_${studentId}`
    : `uniportal_stage_verification_v3_${studentId}_${stageId}`;

export const getStudentStageVerification = (studentId, stageId) => {
  const current = getItem(studentStageVerificationKey(studentId, stageId));
  if (current) return current;

  const previousStageId = PREVIOUS_STAGE_IDS[stageId];
  if (!previousStageId) return {};

  const previousVersion = getItem(
    `uniportal_stage_verification_v2_${studentId}_${previousStageId}`
  );
  if (previousVersion) return previousVersion;

  const legacyStageId = LEGACY_STAGE_IDS[previousStageId];
  return legacyStageId
    ? getItem(`uniportal_stage${legacyStageId}_verification_${studentId}`) || {}
    : {};
};

export const saveStudentStageVerification = (studentId, stageId, verification) => {
  if (!isVerificationStageAssignedToUser(studentId, stageId)) {
    throw new Error(`You are not assigned to verify Stage ${stageId} for this student.`);
  }
  const previous = getStudentStageVerification(studentId, stageId);
  localStorage.setItem(
    studentStageVerificationKey(studentId, stageId),
    JSON.stringify(verification)
  );
  recordVerificationChanges(studentId, stageId, previous, verification);
  notifyVerificationUpdated();
};
