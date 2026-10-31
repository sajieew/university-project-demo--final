import {
  getStage1Verification,
  getStage2Verification,
  getStudentStageVerification,
  findStudent,
  normalizeVerificationStages,
  getVerificationHistory,
  getVerificationAssignments,
  getUsers,
} from './localStorage.js';

export const VERIFICATION_ITEMS = {
  1: [
    { id: 'applicationFormPresent', label: 'Application Form Present?' },
  ],
  2: [
    { id: 'tenthMarkCertificate', label: '10th Mark Certificate Present?' },
    { id: 'eleventhMarkCertificate', label: '11th Mark Certificate Present?' },
    { id: 'twelfthMarkCertificate', label: '12th Mark Certificate Present?' },
  ],
  3: [
    { id: 'birthCertificate', label: 'Birth Certificate Present?' },
    { id: 'aadhaarCard', label: 'Aadhaar Card Present?' },
    { id: 'incomeCertificate', label: 'Income Certificate Present?' },
    { id: 'nativityCertificate', label: 'Nativity Certificate Present?' },
    { id: 'communityCertificate', label: 'Community Certificate Present?' },
  ],
  4: [
    { id: 'transferCertificate', label: 'Transfer Certificate Present?' },
    { id: 'nriCertificate', label: 'NRI Certificate Present?', optional: true },
    { id: 'migrationCertificate', label: 'Migration Certificate Present?', optional: true },
  ],
  5: [
    { id: 'paymentDoneCertificate', label: 'Payment Done Certificate Present?' },
  ],
  6: [
    { id: 'approvalCertificate', label: 'Approval Certificate Present?' },
  ],
};

export function getStageVerification(stageId, studentId) {
  const id = String(stageId);
  if (id === '1') return getStage1Verification(studentId);
  if (id === '2') return getStage2Verification(studentId);
  return getStudentStageVerification(studentId, id);
}

export function getPendingVerificationItems(stageId, studentId) {
  const id = String(stageId);
  const verification = getStageVerification(id, studentId);
  return (VERIFICATION_ITEMS[id] || []).filter(item =>
    !item.optional && getAnswer(id, item, verification) !== 'Yes'
  );
}

function getAnswer(stageId, item, verification) {
  const stage1Value = verification.applicationFormPresent;
  const value = stageId === '1'
    ? stage1Value && typeof stage1Value === 'object'
      ? stage1Value.status || stage1Value.decision || stage1Value.value
      : stage1Value
    : verification[item.id];
  if (value && typeof value === 'object') {
    return value.status || value.decision || value.value || '';
  }
  return value;
}

function isRejected(answer) {
  return answer === 'No' || answer === 'Rejected';
}

export function getStageProgress(stageId, verification = {}) {
  const id = String(stageId);
  const compulsoryItems = (VERIFICATION_ITEMS[id] || []).filter(item => !item.optional);
  const completedCount = compulsoryItems.filter(item =>
    getAnswer(id, item, verification) === 'Yes'
  ).length;

  return {
    completedCount,
    totalCount: compulsoryItems.length,
    percentage: compulsoryItems.length
      ? Math.round((completedCount / compulsoryItems.length) * 100)
      : 0,
  };
}

export function getStageStatus(stageId, verification = {}) {
  const id = String(stageId);
  const items = (VERIFICATION_ITEMS[id] || []).filter(item => !item.optional);
  if (items.some(item => isRejected(getAnswer(id, item, verification)))) {
    return 'Rejected';
  }

  const { completedCount, totalCount } = getStageProgress(id, verification);
  return totalCount > 0 && completedCount === totalCount ? 'Completed' : 'Pending';
}

export function getSavedStageStatus(stageId, studentId) {
  return getStageStatus(stageId, getStageVerification(stageId, studentId));
}

export function getVerificationBreakdown(studentId) {
  const student = findStudent(studentId);
  const savedStages = normalizeVerificationStages(student?.stages || {});

  return Object.keys(VERIFICATION_ITEMS).map(stageId => {
    const verification = getStageVerification(stageId, studentId);
    const stageItems = VERIFICATION_ITEMS[stageId].map(item => {
      const value = stageId === '1'
        ? verification.applicationFormPresent
        : verification[item.id];
      const decision = getAnswer(stageId, item, verification);
      const itemStatus = isRejected(decision)
        ? 'Rejected'
        : decision === 'Yes'
          ? 'Verified'
          : 'Pending';
      const savedRemarks = verification.rejectionRemarks?.[item.id]
        || verification.remarks?.[item.id]
        || (typeof verification.remarks === 'string' ? verification.remarks : '');

      return {
        ...item,
        mandatory: !item.optional,
        decision,
        status: itemStatus,
        remarks: (value && typeof value === 'object' ? value.remarks : '') || savedRemarks,
      };
    });

    return {
      id: stageId,
      status: getStageStatus(stageId, verification),
      verifiedBy: savedStages[stageId]?.verifiedBy || '',
      date: savedStages[stageId]?.date || '',
      remarks: savedStages[stageId]?.remarks || '',
      items: stageItems,
    };
  });
}

export function getOverallVerificationStatus(studentId) {
  const stages = getVerificationBreakdown(studentId);
  if (stages.some(stage =>
    stage.status === 'Rejected' ||
    stage.items.some(item => item.mandatory && item.status === 'Rejected')
  )) {
    return 'Action Required';
  }
  if (stages.length > 0 && stages.every(stage => stage.status === 'Completed')) {
    return 'Verified';
  }
  return stages.some(stage => stage.status === 'Completed')
    ? 'In Progress'
    : 'Not Verified';
}

export function getAdmissionStatus(student) {
  return student?.approval?.status || student?.admissionStatus || 'Pending';
}

export function getVerificationProgress(studentId) {
  const stages = getVerificationBreakdown(studentId);
  const mandatoryItems = stages.flatMap(stage => stage.items.filter(item => item.mandatory));
  const verifiedCount = mandatoryItems.filter(item => item.status === 'Verified').length;
  return {
    verifiedCount,
    totalCount: mandatoryItems.length,
    percentage: mandatoryItems.length
      ? Math.round((verifiedCount / mandatoryItems.length) * 100)
      : 0,
    completedStageCount: stages.filter(stage => stage.status === 'Completed').length,
    totalStageCount: stages.length,
    stages,
  };
}

export function getVerificationHistoryDetails(studentId) {
  return getVerificationHistory(studentId)
    .map((entry, historyIndex) => ({
      ...entry,
      documentName: VERIFICATION_ITEMS[entry.stageId]?.find(item => item.id === entry.documentId)?.label
        || entry.documentId,
      historyIndex,
    }))
    .sort((a, b) =>
      new Date(b.occurredAt) - new Date(a.occurredAt) ||
      b.historyIndex - a.historyIndex
    )
    .map(({ historyIndex: _historyIndex, ...entry }) => entry);
}

export function getOfficerWorkloads(students) {
  const users = getUsers().filter(user => user.role === 'Faculty');
  const assignments = getVerificationAssignments();
  const workloadById = new Map(users.map(user => [user.id, {
    ...user,
    studentIds: new Set(),
    pendingTasks: 0,
    completedTasks: 0,
    rejectedDocuments: 0,
  }]));

  students.forEach(student => {
    const assignment = assignments.find(item => item.studentId === student.id);
    if (!assignment) return;
    const stageBreakdown = getVerificationBreakdown(student.id);
    stageBreakdown.forEach(stage => {
      const officerId = assignment.stageAssignments?.[stage.id] || assignment.officerId;
      const officer = workloadById.get(officerId);
      if (!officer) return;
      officer.studentIds.add(student.id);
      if (stage.status === 'Completed') officer.completedTasks += 1;
      else officer.pendingTasks += 1;
      officer.rejectedDocuments += stage.items.filter(item =>
        item.mandatory && item.status === 'Rejected'
      ).length;
    });
  });

  return [...workloadById.values()].map(officer => {
    const totalTasks = officer.pendingTasks + officer.completedTasks;
    return {
      ...officer,
      assignedStudents: officer.studentIds.size,
      totalTasks,
      completionPercentage: totalTasks
        ? Math.round((officer.completedTasks / totalTasks) * 100)
        : 0,
      studentIds: [...officer.studentIds],
    };
  });
}

export function getAssignedStudentIdsForOfficer(officerId) {
  return getVerificationAssignments()
    .filter(assignment =>
      assignment.officerId === officerId ||
      Object.values(assignment.stageAssignments || {}).includes(officerId)
    )
    .map(assignment => assignment.studentId);
}
