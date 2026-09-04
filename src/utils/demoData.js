import { saveStudents, saveUsers, saveNotifications, getStudents, getUsers, KEYS } from './localStorage';

// Certificate checklists extracted from the PDF
export const UG_CERTIFICATES = [
  { id: 'ug_sslc',       name: 'SSLC / 10th Standard Mark Sheet & Certificate' },
  { id: 'ug_hsc',        name: 'HSC / 12th Standard Mark Sheet & Certificate' },
  { id: 'ug_tc',         name: 'Transfer Certificate (TC)' },
  { id: 'ug_conduct',    name: 'Conduct Certificate' },
  { id: 'ug_community',  name: 'Community Certificate' },
  { id: 'ug_nativity',   name: 'Nativity Certificate' },
  { id: 'ug_income',     name: 'Income Certificate' },
  { id: 'ug_migration',  name: 'Migration Certificate (if applicable)' },
  { id: 'ug_counselling',name: 'TNEA / JEE / Board Counselling Letter' },
  { id: 'ug_allotment',  name: 'Allotment Order / Provisional Allotment Letter' },
  { id: 'ug_medical',    name: 'Medical Fitness Certificate' },
  { id: 'ug_photos',     name: 'Passport Size Photographs (4 Nos.)' },
  { id: 'ug_aadhar',     name: 'Aadhar Card (Self-attested Copy)' },
  { id: 'ug_antiragging',name: 'Anti-Ragging Undertaking (Signed by Student & Parent)' },
];

export const PG_CERTIFICATES = [
  { id: 'pg_marksheets', name: 'B.E./B.Tech./Degree Mark Sheets (All Semesters)' },
  { id: 'pg_degree',     name: 'Degree Certificate / Provisional Certificate' },
  { id: 'pg_tc',         name: 'Transfer Certificate (TC)' },
  { id: 'pg_conduct',    name: 'Conduct Certificate' },
  { id: 'pg_community',  name: 'Community Certificate' },
  { id: 'pg_entrance',   name: 'TANCET / GATE / CAT Score Card' },
  { id: 'pg_counselling',name: 'Counselling Letter / Allotment Order' },
  { id: 'pg_migration',  name: 'Migration Certificate (if applicable)' },
  { id: 'pg_medical',    name: 'Medical Fitness Certificate' },
  { id: 'pg_experience', name: 'Experience Certificate (if applicable)' },
  { id: 'pg_photos',     name: 'Passport Size Photographs (4 Nos.)' },
  { id: 'pg_aadhar',     name: 'Aadhar Card (Self-attested Copy)' },
  { id: 'pg_antiragging',name: 'Anti-Ragging Undertaking (Signed by Student & Parent)' },
];

export const VERIFICATION_STAGES = [
  { id: 1, name: 'Application & Student Details Verification' },
  { id: 2, name: 'Academic Qualification Verification' },
  { id: 3, name: 'Original Certificate Verification' },
  { id: 4, name: 'Community / Category Verification' },
  { id: 5, name: 'Eligibility Verification' },
  { id: 6, name: 'Entrance / Counselling Document Verification' },
  { id: 7, name: 'Transfer / Migration Certificate Verification' },
  { id: 8, name: 'Fee Payment Verification' },
  { id: 9, name: 'Admission Approval' },
];

export const ELIGIBILITY_PARAMETERS = [
  { id: 'minQualification',  label: 'Minimum Academic Qualification Satisfied' },
  { id: 'requiredSubjects',  label: 'Required Subjects Studied' },
  { id: 'minMarks',          label: 'Minimum Marks / CGPA Requirement Satisfied' },
  { id: 'categoryEligible',  label: 'Category / Reservation Eligibility Verified' },
  { id: 'entranceSatisfied', label: 'Entrance / Counselling Requirement Satisfied' },
  { id: 'docsGenuine',       label: 'Documents Genuine and Valid' },
  { id: 'allCertsSubmitted', label: 'All Required Certificates Submitted' },
];

const makeCertChecklist = (list) =>
  list.reduce((acc, cert) => {
    acc[cert.id] = { originalProduced: false, photocopySubmitted: false, verified: false, remarks: '' };
    return acc;
  }, {});

const makeStages = () =>
  VERIFICATION_STAGES.reduce((acc, stage) => {
    acc[stage.id] = { status: 'Pending', verifiedBy: '', date: '', remarks: '' };
    return acc;
  }, {});

const makeEligibility = () =>
  ELIGIBILITY_PARAMETERS.reduce((acc, p) => {
    acc[p.id] = 'Yes';
    return acc;
  }, {});

const DEMO_STUDENTS = [
  {
    id: 'STU001',
    applicationNo: 'APP-2024-001',
    admissionNo: 'ADM-2024-001',
    name: 'Aravind Kumar S',
    dob: '2005-06-15',
    gender: 'Male',
    programme: 'B.E.',
    branch: 'Computer Science and Engineering',
    category: 'Merit',
    mobile: '9876543210',
    email: 'aravind.kumar@example.com',
    academicYear: '2024-25',
    verificationStatus: 'Verified',
    admissionStatus: 'Approved',
    certificates: makeCertChecklist(UG_CERTIFICATES),
    stages: makeStages(),
    eligibility: { ...makeEligibility(), finalStatus: 'VERIFIED – ELIGIBLE FOR ADMISSION' },
    declaration: { name: 'Aravind Kumar S', date: '2024-08-01', signature: 'Aravind Kumar' },
    officer: { name: 'Dr. R. Meenakshi', designation: 'Asst. Professor', date: '2024-08-02', signature: 'R. Meenakshi' },
    approval: { status: 'Approved', remarks: 'All documents verified. Eligible for admission.', officer: 'Dr. S. Raman', date: '2024-08-05', signature: 'S. Raman' },
    createdAt: '2024-08-01T09:00:00.000Z',
    updatedAt: '2024-08-05T11:00:00.000Z',
  },
  {
    id: 'STU002',
    applicationNo: 'APP-2024-002',
    admissionNo: 'ADM-2024-002',
    name: 'Priya Lakshmi R',
    dob: '2005-03-22',
    gender: 'Female',
    programme: 'B.Tech.',
    branch: 'Electronics and Communication Engineering',
    category: 'Management',
    mobile: '9876543211',
    email: 'priya.lakshmi@example.com',
    academicYear: '2024-25',
    verificationStatus: 'Pending',
    admissionStatus: 'Pending',
    certificates: makeCertChecklist(UG_CERTIFICATES),
    stages: makeStages(),
    eligibility: { ...makeEligibility(), finalStatus: 'PENDING VERIFICATION' },
    declaration: { name: 'Priya Lakshmi R', date: '2024-08-02', signature: '' },
    officer: { name: '', designation: '', date: '', signature: '' },
    approval: { status: 'Pending', remarks: '', officer: '', date: '', signature: '' },
    createdAt: '2024-08-02T10:00:00.000Z',
    updatedAt: '2024-08-02T10:00:00.000Z',
  },
  {
    id: 'STU003',
    applicationNo: 'APP-2024-003',
    admissionNo: 'ADM-2024-003',
    name: 'Mohammed Farhan A',
    dob: '2001-11-08',
    gender: 'Male',
    programme: 'M.E.',
    branch: 'VLSI Design',
    category: 'Merit',
    mobile: '9876543212',
    email: 'mohammed.farhan@example.com',
    academicYear: '2024-25',
    verificationStatus: 'Verified',
    admissionStatus: 'Provisionally Approved',
    certificates: makeCertChecklist(PG_CERTIFICATES),
    stages: makeStages(),
    eligibility: { ...makeEligibility(), finalStatus: 'VERIFIED – SUBJECT TO SUBMISSION OF PENDING DOCUMENTS' },
    declaration: { name: 'Mohammed Farhan A', date: '2024-08-03', signature: 'M. Farhan' },
    officer: { name: 'Dr. K. Vijayan', designation: 'Professor', date: '2024-08-04', signature: 'K. Vijayan' },
    approval: { status: 'Provisionally Approved', remarks: 'TC pending. Provisional admission granted.', officer: 'Dr. S. Raman', date: '2024-08-06', signature: 'S. Raman' },
    createdAt: '2024-08-03T09:30:00.000Z',
    updatedAt: '2024-08-06T14:00:00.000Z',
  },
  {
    id: 'STU004',
    applicationNo: 'APP-2024-004',
    admissionNo: '',
    name: 'Deepa Sundaram N',
    dob: '2005-09-14',
    gender: 'Female',
    programme: 'MBA',
    branch: 'Human Resource Management',
    category: 'NRI',
    mobile: '9876543213',
    email: 'deepa.sundaram@example.com',
    academicYear: '2024-25',
    verificationStatus: 'Pending',
    admissionStatus: 'Rejected',
    certificates: makeCertChecklist(PG_CERTIFICATES),
    stages: makeStages(),
    eligibility: { ...makeEligibility(), minMarks: 'No', finalStatus: 'NOT ELIGIBLE' },
    declaration: { name: 'Deepa Sundaram N', date: '2024-08-04', signature: '' },
    officer: { name: '', designation: '', date: '', signature: '' },
    approval: { status: 'Rejected', remarks: 'Minimum marks requirement not satisfied.', officer: 'Dr. S. Raman', date: '2024-08-07', signature: 'S. Raman' },
    createdAt: '2024-08-04T11:00:00.000Z',
    updatedAt: '2024-08-07T09:00:00.000Z',
  },
  {
    id: 'STU005',
    applicationNo: 'APP-2024-005',
    admissionNo: 'ADM-2024-004',
    name: 'Karthik Balaji T',
    dob: '2005-01-30',
    gender: 'Male',
    programme: 'B.E.',
    branch: 'Mechanical Engineering',
    category: 'Other',
    mobile: '9876543214',
    email: 'karthik.balaji@example.com',
    academicYear: '2024-25',
    verificationStatus: 'Verified',
    admissionStatus: 'Approved',
    certificates: makeCertChecklist(UG_CERTIFICATES),
    stages: makeStages(),
    eligibility: { ...makeEligibility(), finalStatus: 'VERIFIED – ELIGIBLE FOR ADMISSION' },
    declaration: { name: 'Karthik Balaji T', date: '2024-08-05', signature: 'K. Balaji' },
    officer: { name: 'Mr. P. Suresh', designation: 'Senior Lecturer', date: '2024-08-06', signature: 'P. Suresh' },
    approval: { status: 'Approved', remarks: 'All documents in order.', officer: 'Dr. S. Raman', date: '2024-08-08', signature: 'S. Raman' },
    createdAt: '2024-08-05T08:00:00.000Z',
    updatedAt: '2024-08-08T10:00:00.000Z',
  },
];

const DEMO_USERS = [
  { id: 'USR001', name: 'Dr. Admin User',    username: 'admin',   role: 'Admin',   status: 'Active',   email: 'admin@university.edu',   password: 'admin123' },
  { id: 'USR002', name: 'Prof. Faculty User', username: 'faculty', role: 'Faculty', status: 'Active',   email: 'faculty@university.edu', password: 'faculty123' },
  { id: 'USR003', name: 'Dr. Meenakshi R',   username: 'meenakshi',role: 'Faculty', status: 'Active',   email: 'meenakshi@university.edu',password: 'meen@123' },
  { id: 'USR004', name: 'Mr. Arjun Prasad',  username: 'arjun',   role: 'Faculty', status: 'Inactive', email: 'arjun@university.edu',   password: 'arjun@123' },
];

const DEMO_NOTIFICATIONS = [
  { id: 'N1', message: 'New student Karthik Balaji T has been approved.', type: 'success', read: false, createdAt: '2024-08-08T10:00:00.000Z' },
  { id: 'N2', message: 'Verification pending for Priya Lakshmi R.', type: 'warning', read: false, createdAt: '2024-08-02T10:00:00.000Z' },
  { id: 'N3', message: 'Mohammed Farhan A admitted provisionally – TC pending.', type: 'info', read: true, createdAt: '2024-08-06T14:00:00.000Z' },
  { id: 'N4', message: 'Application of Deepa Sundaram N has been rejected.', type: 'error', read: true, createdAt: '2024-08-07T09:00:00.000Z' },
];

export const seedDemoData = () => {
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    saveStudents(DEMO_STUDENTS);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    saveUsers(DEMO_USERS);
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    saveNotifications(DEMO_NOTIFICATIONS);
  }
};

export { DEMO_USERS };
