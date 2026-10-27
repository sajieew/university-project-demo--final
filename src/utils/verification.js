import {
  getStage1Verification,
  getStage2Verification,
  getStudentStageVerification,
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
  if (stageId === '1') return verification.applicationFormPresent?.status;
  return verification[item.id];
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
  const { completedCount, totalCount } = getStageProgress(stageId, verification);
  return totalCount > 0 && completedCount === totalCount ? 'Completed' : 'Pending';
}

export function getSavedStageStatus(stageId, studentId) {
  return getStageStatus(stageId, getStageVerification(stageId, studentId));
}
