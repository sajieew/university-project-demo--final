// localStorage keys
export const KEYS = {
  STUDENTS:      'uniportal_students',
  USERS:         'uniportal_users',
  NOTIFICATIONS: 'uniportal_notifications',
  AUTH:          'uniportal_auth',
  STAGE1_VERIFICATION: 'uniportal_stage1_verification',
  PROVISIONAL_ALLOTMENTS: 'uniportal_provisional_allotments',
  ENTRANCE_EXAMINATION_TICKETS: 'uniportal_entrance_examination_tickets',
  PROVISIONAL_ALLOTMENT_UPLOADS: 'uniportal_provisional_allotment_uploads',
  ENTRANCE_EXAMINATION_UPLOADS: 'uniportal_entrance_examination_uploads',
  RANK_STATEMENT_UPLOADS: 'uniportal_rank_statement_uploads',
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

const getUploadReferences = (key) => {
  const references = getItem(key);
  return Array.isArray(references) ? references : [];
};

const saveUploadReference = (key, department, academicYear, fileName) => {
  const references = getUploadReferences(key).filter(reference =>
    reference.department !== department || reference.academicYear !== academicYear
  );
  const updated = [...references, {
    department,
    academicYear,
    fileName,
    updatedAt: new Date().toISOString(),
  }];
  try {
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Unable to save uploaded file reference.', error);
    throw new Error('Unable to save the uploaded file name in this browser.');
  }
};

const UPLOAD_DATABASE = 'uniportal-module-uploads';
const UPLOAD_OBJECT_STORE = 'uploads';

const openUploadDatabase = () => new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') {
    reject(new Error('This browser does not support persistent uploaded files.'));
    return;
  }

  const request = indexedDB.open(UPLOAD_DATABASE, 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(UPLOAD_OBJECT_STORE)) {
      request.result.createObjectStore(UPLOAD_OBJECT_STORE, { keyPath: 'id' });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(new Error('Unable to open uploaded file storage.'));
});

const getUploadStorageId = (moduleKey, department, academicYear) =>
  `${moduleKey}\u0000${department}\u0000${academicYear}`;

export const saveModuleUploadFile = async (moduleKey, department, academicYear, file) => {
  const database = await openUploadDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(UPLOAD_OBJECT_STORE, 'readwrite');
      transaction.objectStore(UPLOAD_OBJECT_STORE).put({
        id: getUploadStorageId(moduleKey, department, academicYear),
        fileName: file.name,
        file,
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(new Error('Unable to save the uploaded file.'));
      transaction.onabort = () => reject(new Error('Unable to save the uploaded file.'));
    });
  } catch (error) {
    console.error('Unable to save uploaded file.', error);
    throw error instanceof Error ? error : new Error('Unable to save the uploaded file.');
  } finally {
    database.close();
  }
};

export const deleteModuleUploadFile = async (moduleKey, department, academicYear) => {
  const database = await openUploadDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(UPLOAD_OBJECT_STORE, 'readwrite');
      transaction.objectStore(UPLOAD_OBJECT_STORE).delete(
        getUploadStorageId(moduleKey, department, academicYear)
      );
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(new Error('Unable to delete the uploaded file.'));
      transaction.onabort = () => reject(new Error('Unable to delete the uploaded file.'));
    });
  } catch (error) {
    console.error('Unable to delete uploaded file.', error);
    throw error instanceof Error ? error : new Error('Unable to delete the uploaded file.');
  } finally {
    database.close();
  }
};

const getUploadReference = (key, department, academicYear) =>
  getUploadReferences(key).find(reference =>
    reference.department === department && reference.academicYear === academicYear
  ) || null;

const deleteUploadReference = (key, department, academicYear) =>
  saveUploadReference(key, department, academicYear, null);

export const getProvisionalAllotmentUpload = (department, academicYear) =>
  getUploadReference(KEYS.PROVISIONAL_ALLOTMENT_UPLOADS, department, academicYear);

export const saveProvisionalAllotmentUpload = (department, academicYear, fileName) =>
  saveUploadReference(KEYS.PROVISIONAL_ALLOTMENT_UPLOADS, department, academicYear, fileName);

export const deleteProvisionalAllotmentUpload = async (department, academicYear) => {
  await deleteModuleUploadFile(KEYS.PROVISIONAL_ALLOTMENTS, department, academicYear);
  return deleteUploadReference(KEYS.PROVISIONAL_ALLOTMENT_UPLOADS, department, academicYear);
};

export const getEntranceExaminationUpload = (department, academicYear) =>
  getUploadReference(KEYS.ENTRANCE_EXAMINATION_UPLOADS, department, academicYear);

export const saveEntranceExaminationUpload = (department, academicYear, fileName) =>
  saveUploadReference(KEYS.ENTRANCE_EXAMINATION_UPLOADS, department, academicYear, fileName);

export const deleteEntranceExaminationUpload = async (department, academicYear) => {
  await deleteModuleUploadFile(KEYS.ENTRANCE_EXAMINATION_TICKETS, department, academicYear);
  return deleteUploadReference(KEYS.ENTRANCE_EXAMINATION_UPLOADS, department, academicYear);
};

export const getRankStatementUpload = (department, academicYear) =>
  getUploadReference(KEYS.RANK_STATEMENT_UPLOADS, department, academicYear);

export const saveRankStatementUpload = (department, academicYear, fileName) =>
  saveUploadReference(KEYS.RANK_STATEMENT_UPLOADS, department, academicYear, fileName);

export const deleteRankStatementUpload = async (department, academicYear) => {
  await deleteModuleUploadFile(KEYS.RANK_STATEMENTS, department, academicYear);
  return deleteUploadReference(KEYS.RANK_STATEMENT_UPLOADS, department, academicYear);
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

<<<<<<< HEAD
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
=======
export const getProvisionalAllotments = () => {
  const allotments = getItem(KEYS.PROVISIONAL_ALLOTMENTS);
  return Array.isArray(allotments) ? allotments : [];
};
>>>>>>> 53f1899 (Added my changes)

const writeProvisionalAllotments = (allotments) => {
  try {
    localStorage.setItem(KEYS.PROVISIONAL_ALLOTMENTS, JSON.stringify(allotments));
    return allotments;
  } catch (error) {
    console.error('Unable to save provisional allotments.', error);
    throw new Error('Unable to save provisional allotments in this browser.');
  }
};

const provisionalAllotmentKey = (allotment) =>
  `${allotment.department}\u0000${allotment.academicYear}\u0000${allotment.identityKey}`;

export const mergeProvisionalAllotments = (incoming) => {
  const allotments = getProvisionalAllotments();
  const byKey = new Map(
    allotments
      .filter(item => item.department && item.academicYear && item.identityKey)
      .map(item => [provisionalAllotmentKey(item), item])
  );
  const merged = [...allotments];

  incoming.forEach(item => {
    const key = provisionalAllotmentKey(item);
    const existing = byKey.get(key);
    const record = {
      ...existing,
      ...item,
      id: existing?.id || item.id,
      createdAt: existing?.createdAt || item.createdAt,
    };

    if (existing) {
      const index = merged.findIndex(entry => entry.id === existing.id);
      merged[index] = record;
    } else {
      merged.push(record);
    }
    byKey.set(key, record);
  });

  return writeProvisionalAllotments(merged);
};

export const updateProvisionalAllotment = (updated) => {
  const allotments = getProvisionalAllotments();
  const index = allotments.findIndex(item => item.id === updated.id);
  if (index < 0) throw new Error('This provisional allotment could not be found.');

  const next = [...allotments];
  next[index] = updated;
  return writeProvisionalAllotments(next);
};

export const insertProvisionalAllotment = (allotment, position = { type: 'end' }) => {
  const allotments = getProvisionalAllotments();
  if (allotments.some(item => item.id === allotment.id)) {
    throw new Error('This provisional allotment already exists.');
  }

  let index;
  if (position.type === 'before' || position.type === 'after') {
    const targetIndex = allotments.findIndex(item =>
      item.id === position.recordId
      && item.department === allotment.department
      && item.academicYear === allotment.academicYear
    );
    if (targetIndex < 0) throw new Error('The selected insertion position could not be found.');
    index = targetIndex + (position.type === 'after' ? 1 : 0);
  } else {
    const lastInGroup = allotments.reduce((lastIndex, item, itemIndex) =>
      item.department === allotment.department && item.academicYear === allotment.academicYear
        ? itemIndex
        : lastIndex, -1
    );
    index = lastInGroup < 0 ? allotments.length : lastInGroup + 1;
  }

  const next = [...allotments];
  next.splice(index, 0, allotment);
  return writeProvisionalAllotments(next);
};

export const deleteProvisionalAllotment = (id) => {
  const allotments = getProvisionalAllotments();
  const next = allotments.filter(item => item.id !== id);
  if (next.length === allotments.length) {
    throw new Error('This provisional allotment could not be found.');
  }
  return writeProvisionalAllotments(next);
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

export const saveEntranceExaminationRecords = (records, role) => {
  if (role !== 'Faculty' && role !== 'Admin') {
    throw new Error('Only Faculty and Admission users can upload entrance examination records.');
  }

  const savedRecords = getEntranceExaminationTickets();
  const recordKey = (record) =>
    `${record.department}\u0000${record.academicYear}\u0000${record.identityKey}`;
  const positions = new Map(
    savedRecords
      .filter(record => record.department && record.academicYear && record.identityKey)
      .map((record, index) => [recordKey(record), index])
  );
  const updatedRecords = [...savedRecords];

  records.forEach(record => {
    const key = recordKey(record);
    const index = positions.get(key);
    if (index === undefined) {
      positions.set(key, updatedRecords.length);
      updatedRecords.push(record);
    } else {
      updatedRecords[index] = {
        ...updatedRecords[index],
        ...record,
        id: updatedRecords[index].id || record.id,
        createdAt: updatedRecords[index].createdAt || record.createdAt,
      };
    }
  });

  try {
    localStorage.setItem(KEYS.ENTRANCE_EXAMINATION_TICKETS, JSON.stringify(updatedRecords));
    return updatedRecords;
  } catch (error) {
    console.error('Unable to save entrance examination records.', error);
    throw new Error('Unable to save entrance examination records in this browser.');
  }
};

export const updateEntranceExaminationRecord = (record, role) => {
  if (role !== 'Faculty' && role !== 'Admin') {
    throw new Error('Only Faculty and Admission users can edit entrance examination records.');
  }

  const savedRecords = getEntranceExaminationTickets();
  const index = savedRecords.findIndex(item => item.id === record.id);
  if (index < 0) throw new Error('This entrance examination record could not be found.');

  const updatedRecords = [...savedRecords];
  updatedRecords[index] = record;
  try {
    localStorage.setItem(KEYS.ENTRANCE_EXAMINATION_TICKETS, JSON.stringify(updatedRecords));
    return updatedRecords;
  } catch (error) {
    console.error('Unable to update entrance examination record.', error);
    throw new Error('Unable to update entrance examination records in this browser.');
  }
};

export const getRankStatements = () => getItem(KEYS.RANK_STATEMENTS) || [];

const writeRankStatements = (statements) => {
  try {
    localStorage.setItem(KEYS.RANK_STATEMENTS, JSON.stringify(statements));
    return statements;
  } catch (error) {
    console.error('Unable to save rank statement records.', error);
    throw new Error('Unable to save rank statement records in this browser.');
  }
};

const rankStatementRecordKey = (record) =>
  `${record.department}\u0000${record.academicYear}\u0000${String(record.applicationNumber || '').trim().toLowerCase()}`;

export const mergeRankStatementRecords = (incoming) => {
  const statements = getRankStatements();
  const positions = new Map(
    statements
      .filter(record => record.department && record.academicYear && record.applicationNumber)
      .map((record, index) => [rankStatementRecordKey(record), index])
  );
  const updated = [...statements];

  incoming.forEach(record => {
    const key = rankStatementRecordKey(record);
    const index = positions.get(key);
    if (index === undefined) {
      positions.set(key, updated.length);
      updated.push(record);
    } else {
      updated[index] = {
        ...updated[index],
        ...record,
        id: updated[index].id || record.id,
        createdAt: updated[index].createdAt || record.createdAt,
      };
    }
  });

  return writeRankStatements(updated);
};

export const insertRankStatementRecord = (record, afterId = null) => {
  const statements = getRankStatements();
  if (statements.some(item => item.id === record.id)) {
    throw new Error('This rank statement record already exists.');
  }
  const index = afterId
    ? statements.findIndex(item =>
      item.id === afterId
      && item.department === record.department
      && item.academicYear === record.academicYear
    ) + 1
    : statements.reduce((lastIndex, item, itemIndex) =>
      item.department === record.department && item.academicYear === record.academicYear
        ? itemIndex + 1
        : lastIndex, -1
    );
  if (afterId && index === 0) throw new Error('The selected insertion position could not be found.');

  const updated = [...statements];
  updated.splice(index < 0 ? updated.length : index, 0, record);
  return writeRankStatements(updated);
};

export const updateRankStatementRecord = (record) => {
  const statements = getRankStatements();
  const index = statements.findIndex(item => item.id === record.id);
  if (index < 0) throw new Error('This rank statement record could not be found.');
  const updated = [...statements];
  updated[index] = record;
  return writeRankStatements(updated);
};

export const deleteRankStatementRecord = (id) => {
  const statements = getRankStatements();
  const updated = statements.filter(item => item.id !== id);
  if (updated.length === statements.length) throw new Error('This rank statement record could not be found.');
  return writeRankStatements(updated);
};

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
