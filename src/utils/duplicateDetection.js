const normalizeText = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
const normalizeNumber = value => String(value || '').trim();
const normalizeEmail = value => String(value || '').trim().toLocaleLowerCase();
const normalizeMobile = value => String(value || '').replace(/\D/g, '');

const normalizeDate = value => {
  const date = String(value || '').trim();
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toISOString().slice(0, 10);
};

export function findDuplicateApplications(candidate, students, excludeStudentId = '') {
  const candidateName = normalizeText(candidate.name);
  const candidateDateOfBirth = normalizeDate(candidate.dob);
  const candidateEmail = normalizeEmail(candidate.email);
  const candidateMobile = normalizeMobile(candidate.mobile);
  const candidateApplicationNo = normalizeNumber(candidate.applicationNo);
  const candidateAdmissionNo = normalizeNumber(candidate.admissionNo);

  return students
    .filter(student => student.id !== excludeStudentId)
    .map(student => {
      const reasons = [];
      if (candidateApplicationNo &&
        normalizeNumber(student.applicationNo) === candidateApplicationNo) {
        reasons.push({ field: 'Application number', type: 'blocked' });
      }
      if (candidateAdmissionNo &&
        normalizeNumber(student.admissionNo) === candidateAdmissionNo) {
        reasons.push({ field: 'Admission number', type: 'blocked' });
      }
      if (candidateEmail && normalizeEmail(student.email) === candidateEmail) {
        reasons.push({ field: 'Email address', type: 'admin-override' });
      }
      if (candidateMobile && normalizeMobile(student.mobile) === candidateMobile) {
        reasons.push({ field: 'Mobile number', type: 'admin-override' });
      }
      if (candidateName && candidateDateOfBirth &&
        normalizeText(student.name) === candidateName &&
        normalizeDate(student.dob) === candidateDateOfBirth) {
        reasons.push({ field: 'Name and date of birth', type: 'warning' });
      }

      return reasons.length ? { student, reasons } : null;
    })
    .filter(Boolean);
}
