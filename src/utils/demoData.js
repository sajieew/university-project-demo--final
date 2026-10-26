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
  { id: 4, name: 'Community Certificate Verification' },
  { id: 5, name: 'Transfer and NRI Certificate Verification' },
  { id: 6, name: 'Payment Verification' },
  { id: 7, name: 'Approval Certificate Verification' },
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

// ─── Branch Configuration (codes + SAN for Management Quota) ───────────────
// This is additive — does NOT affect existing student records.
// SAN = Sanctioned / Approved seats under Management Quota per branch.
export const BRANCH_CONFIG = [
  { code: 'CSE',  name: 'Computer Science and Engineering',          san: 60 },
  { code: 'ECE',  name: 'Electronics and Communication Engineering', san: 60 },
  { code: 'EEE',  name: 'Electrical and Electronics Engineering',    san: 30 },
  { code: 'MECH', name: 'Mechanical Engineering',                    san: 60 },
  { code: 'CIVIL',name: 'Civil Engineering',                         san: 30 },
  { code: 'IT',   name: 'Information Technology',                    san: 60 },
  { code: 'VLSI', name: 'VLSI Design',                               san: 18 },
  { code: 'SE',   name: 'Software Engineering',                      san: 18 },
  { code: 'ES',   name: 'Embedded Systems',                          san: 18 },
  { code: 'PSE',  name: 'Power Systems Engineering',                 san: 18 },
  { code: 'CS',   name: 'Communications Systems',                    san: 18 },
  { code: 'HRM',  name: 'Human Resource Management',                 san: 30 },
  { code: 'FIN',  name: 'Finance',                                   san: 30 },
  { code: 'MKT',  name: 'Marketing',                                 san: 30 },
];

// Community options for Form B & C
export const COMMUNITIES = ['OC', 'BC', 'BCM', 'MBC', 'SC', 'ST'];

// Group (qualifying exam type) options for Form B
export const GROUPS = ['HSC', 'HSC Academic', 'CBSE', 'ICSE', 'Other'];

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

// ─── Dummy Admission Data for Form A / B / C Testing ────────────────────────
// These records are ONLY appended if the flag 'uniportal_dummy_seeded_v1' is absent.
// Existing real student data is NEVER modified or removed.

const makeAllCertsVerified = (list) =>
  list.reduce((acc, cert) => {
    acc[cert.id] = { originalProduced: true, photocopySubmitted: true, verified: true, remarks: 'Verified' };
    return acc;
  }, {});

const makeAllStagesCompleted = () =>
  VERIFICATION_STAGES.reduce((acc, stage) => {
    acc[stage.id] = { status: 'Completed', verifiedBy: 'Dr. S. Raman', date: '2025-07-15', remarks: 'Completed' };
    return acc;
  }, {});

const makeAllEligible = () => ({
  ...ELIGIBILITY_PARAMETERS.reduce((acc, p) => { acc[p.id] = 'Yes'; return acc; }, {}),
  finalStatus: 'VERIFIED – ELIGIBLE FOR ADMISSION',
});

const approved = (officer = 'Dr. S. Raman') => ({
  status: 'Approved',
  remarks: 'All documents verified. Eligible for admission.',
  officer,
  date: '2025-07-20',
  signature: officer,
});

// 40 dummy students covering all 14 branches with varied community/gender/quota/marks
const DUMMY_STUDENTS = [
  // ── CSE (6) ──────────────────────────────────────────────────────────────
  { id:'D001', appN:'APP-2025-001', admN:'ADM-2025-001', name:'Aakeshwaran K',      dob:'2007-03-12', gender:'Male',   prog:'B.E.',    branch:'Computer Science and Engineering',          cat:'Management', mobile:'9500011001', email:'aakeshwaran@kvell.edu',    yr:'2025-26', comm:'OC',  grp:'HSC',  mo:89, po:93, co:86, fg:'No',  afw:'Yes' },
  { id:'D002', appN:'APP-2025-002', admN:'ADM-2025-002', name:'Barathi Devi S',     dob:'2007-05-20', gender:'Female', prog:'B.E.',    branch:'Computer Science and Engineering',          cat:'Management', mobile:'9500011002', email:'barathidevi@kvell.edu',    yr:'2025-26', comm:'BC',  grp:'CBSE', mo:92, po:88, co:95, fg:'Yes', afw:'No'  },
  { id:'D003', appN:'APP-2025-003', admN:'ADM-2025-003', name:'Chandru Prabhu R',   dob:'2006-11-08', gender:'Male',   prog:'B.E.',    branch:'Computer Science and Engineering',          cat:'Merit',      mobile:'9500011003', email:'chandru@kvell.edu',        yr:'2025-26', comm:'MBC', grp:'HSC',  mo:78, po:82, co:79, fg:'No',  afw:'No'  },
  { id:'D004', appN:'APP-2025-004', admN:'ADM-2025-004', name:'Divya Bharathi M',   dob:'2007-01-25', gender:'Female', prog:'B.E.',    branch:'Computer Science and Engineering',          cat:'Management', mobile:'9500011004', email:'divya@kvell.edu',          yr:'2025-26', comm:'SC',  grp:'CBSE', mo:85, po:90, co:88, fg:'Yes', afw:'No'  },
  { id:'D005', appN:'APP-2025-005', admN:'ADM-2025-005', name:'Eswaran Venkat T',   dob:'2006-09-17', gender:'Male',   prog:'B.E.',    branch:'Computer Science and Engineering',          cat:'Merit',      mobile:'9500011005', email:'eswaran@kvell.edu',        yr:'2025-26', comm:'BCM', grp:'HSC',  mo:70, po:75, co:72, fg:'No',  afw:'No'  },
  { id:'D006', appN:'APP-2025-006', admN:'ADM-2025-006', name:'Fathima Nisha B',    dob:'2007-07-04', gender:'Female', prog:'B.E.',    branch:'Computer Science and Engineering',          cat:'Management', mobile:'9500011006', email:'fathima@kvell.edu',        yr:'2025-26', comm:'BC',  grp:'HSC',  mo:95, po:92, co:97, fg:'No',  afw:'No'  },

  // ── ECE (5) ──────────────────────────────────────────────────────────────
  { id:'D007', appN:'APP-2025-007', admN:'ADM-2025-007', name:'Ganesh Kumar P',     dob:'2007-02-14', gender:'Male',   prog:'B.Tech.', branch:'Electronics and Communication Engineering', cat:'Management', mobile:'9500011007', email:'ganesh@kvell.edu',         yr:'2025-26', comm:'OC',  grp:'CBSE', mo:80, po:83, co:81, fg:'No',  afw:'No'  },
  { id:'D008', appN:'APP-2025-008', admN:'ADM-2025-008', name:'Hemamalini V',       dob:'2006-12-30', gender:'Female', prog:'B.Tech.', branch:'Electronics and Communication Engineering', cat:'Merit',      mobile:'9500011008', email:'hemamalini@kvell.edu',     yr:'2025-26', comm:'MBC', grp:'HSC',  mo:88, po:91, co:87, fg:'Yes', afw:'No'  },
  { id:'D009', appN:'APP-2025-009', admN:'ADM-2025-009', name:'Iyyappan S',         dob:'2007-04-19', gender:'Male',   prog:'B.Tech.', branch:'Electronics and Communication Engineering', cat:'Management', mobile:'9500011009', email:'iyyappan@kvell.edu',       yr:'2025-26', comm:'ST',  grp:'HSC',  mo:65, po:70, co:68, fg:'No',  afw:'No'  },
  { id:'D010', appN:'APP-2025-010', admN:'ADM-2025-010', name:'Jayasri Devi K',     dob:'2006-08-22', gender:'Female', prog:'B.Tech.', branch:'Electronics and Communication Engineering', cat:'Management', mobile:'9500011010', email:'jayasri@kvell.edu',        yr:'2025-26', comm:'BC',  grp:'CBSE', mo:91, po:89, co:93, fg:'No',  afw:'Yes' },
  { id:'D011', appN:'APP-2025-011', admN:'ADM-2025-011', name:'Kiran Raj A',        dob:'2007-06-11', gender:'Male',   prog:'B.Tech.', branch:'Electronics and Communication Engineering', cat:'Merit',      mobile:'9500011011', email:'kiranraj@kvell.edu',       yr:'2025-26', comm:'SC',  grp:'HSC',  mo:73, po:77, co:74, fg:'No',  afw:'No'  },

  // ── Civil Engineering (4) ─────────────────────────────────────────────────
  { id:'D012', appN:'APP-2025-012', admN:'ADM-2025-012', name:'Lavanya Priya D',    dob:'2007-03-28', gender:'Female', prog:'B.E.',    branch:'Civil Engineering',                         cat:'Management', mobile:'9500011012', email:'lavanya@kvell.edu',        yr:'2025-26', comm:'OC',  grp:'HSC',  mo:84, po:80, co:82, fg:'No',  afw:'No'  },
  { id:'D013', appN:'APP-2025-013', admN:'ADM-2025-013', name:'Manikandan C',       dob:'2006-10-05', gender:'Male',   prog:'B.E.',    branch:'Civil Engineering',                         cat:'Merit',      mobile:'9500011013', email:'manikandan@kvell.edu',     yr:'2025-26', comm:'MBC', grp:'CBSE', mo:76, po:79, co:77, fg:'Yes', afw:'No'  },
  { id:'D014', appN:'APP-2025-014', admN:'ADM-2025-014', name:'Nirmala Devi T',     dob:'2007-07-16', gender:'Female', prog:'B.E.',    branch:'Civil Engineering',                         cat:'Management', mobile:'9500011014', email:'nirmala@kvell.edu',        yr:'2025-26', comm:'BC',  grp:'HSC',  mo:68, po:72, co:70, fg:'No',  afw:'No'  },
  { id:'D015', appN:'APP-2025-015', admN:'ADM-2025-015', name:'Obalesh Kumar R',    dob:'2006-05-09', gender:'Male',   prog:'B.E.',    branch:'Civil Engineering',                         cat:'Merit',      mobile:'9500011015', email:'obalesh@kvell.edu',        yr:'2025-26', comm:'SC',  grp:'HSC',  mo:81, po:85, co:83, fg:'No',  afw:'No'  },

  // ── Software Engineering / Robotics equivalent (8) → SE + ES + EEE ────────
  { id:'D016', appN:'APP-2025-016', admN:'ADM-2025-016', name:'Pavithra S',         dob:'2007-01-31', gender:'Female', prog:'B.E.',    branch:'Software Engineering',                      cat:'Management', mobile:'9500011016', email:'pavithra@kvell.edu',       yr:'2025-26', comm:'OC',  grp:'CBSE', mo:93, po:91, co:94, fg:'No',  afw:'No'  },
  { id:'D017', appN:'APP-2025-017', admN:'ADM-2025-017', name:'Rajesh Kannan M',    dob:'2006-11-14', gender:'Male',   prog:'B.E.',    branch:'Software Engineering',                      cat:'Merit',      mobile:'9500011017', email:'rajesh@kvell.edu',         yr:'2025-26', comm:'BC',  grp:'HSC',  mo:77, po:80, co:78, fg:'Yes', afw:'No'  },
  { id:'D018', appN:'APP-2025-018', admN:'ADM-2025-018', name:'Saranya Devi P',     dob:'2007-04-02', gender:'Female', prog:'B.E.',    branch:'Software Engineering',                      cat:'Management', mobile:'9500011018', email:'saranya@kvell.edu',        yr:'2025-26', comm:'MBC', grp:'HSC',  mo:86, po:88, co:84, fg:'No',  afw:'No'  },
  { id:'D019', appN:'APP-2025-019', admN:'ADM-2025-019', name:'Thirumaran K',       dob:'2006-08-27', gender:'Male',   prog:'B.E.',    branch:'Embedded Systems',                          cat:'Management', mobile:'9500011019', email:'thirumaran@kvell.edu',     yr:'2025-26', comm:'BCM', grp:'CBSE', mo:72, po:74, co:71, fg:'No',  afw:'No'  },
  { id:'D020', appN:'APP-2025-020', admN:'ADM-2025-020', name:'Uma Maheswari R',    dob:'2007-06-18', gender:'Female', prog:'B.E.',    branch:'Embedded Systems',                          cat:'Merit',      mobile:'9500011020', email:'uma@kvell.edu',            yr:'2025-26', comm:'ST',  grp:'HSC',  mo:69, po:73, co:67, fg:'No',  afw:'No'  },
  { id:'D021', appN:'APP-2025-021', admN:'ADM-2025-021', name:'Vignesh Raj S',      dob:'2006-09-03', gender:'Male',   prog:'B.E.',    branch:'Embedded Systems',                          cat:'Management', mobile:'9500011021', email:'vignesh@kvell.edu',        yr:'2025-26', comm:'OC',  grp:'HSC',  mo:90, po:87, co:92, fg:'No',  afw:'No'  },
  { id:'D022', appN:'APP-2025-022', admN:'ADM-2025-022', name:'Wendy Grace A',      dob:'2007-02-22', gender:'Female', prog:'B.E.',    branch:'Electrical and Electronics Engineering',    cat:'Management', mobile:'9500011022', email:'wendy@kvell.edu',          yr:'2025-26', comm:'BC',  grp:'CBSE', mo:83, po:86, co:85, fg:'Yes', afw:'No'  },
  { id:'D023', appN:'APP-2025-023', admN:'ADM-2025-023', name:'Xavier Antony J',    dob:'2006-12-11', gender:'Male',   prog:'B.E.',    branch:'Electrical and Electronics Engineering',    cat:'Merit',      mobile:'9500011023', email:'xavier@kvell.edu',         yr:'2025-26', comm:'SC',  grp:'HSC',  mo:74, po:76, co:73, fg:'No',  afw:'No'  },

  // ── Biomedical equivalent (9) → IT + PSE + CS ─────────────────────────────
  { id:'D024', appN:'APP-2025-024', admN:'ADM-2025-024', name:'Yamini Priya C',     dob:'2007-05-07', gender:'Female', prog:'B.E.',    branch:'Information Technology',                    cat:'Management', mobile:'9500011024', email:'yamini@kvell.edu',         yr:'2025-26', comm:'MBC', grp:'HSC',  mo:87, po:84, co:89, fg:'No',  afw:'No'  },
  { id:'D025', appN:'APP-2025-025', admN:'ADM-2025-025', name:'Zahir Hussain M',    dob:'2006-07-29', gender:'Male',   prog:'B.E.',    branch:'Information Technology',                    cat:'Merit',      mobile:'9500011025', email:'zahir@kvell.edu',          yr:'2025-26', comm:'BC',  grp:'CBSE', mo:79, po:82, co:80, fg:'No',  afw:'No'  },
  { id:'D026', appN:'APP-2025-026', admN:'ADM-2025-026', name:'Anitha Kumari V',    dob:'2007-03-16', gender:'Female', prog:'B.E.',    branch:'Information Technology',                    cat:'Management', mobile:'9500011026', email:'anitha@kvell.edu',         yr:'2025-26', comm:'OC',  grp:'HSC',  mo:94, po:96, co:93, fg:'Yes', afw:'No'  },
  { id:'D027', appN:'APP-2025-027', admN:'ADM-2025-027', name:'Balakrishnan T',     dob:'2006-10-20', gender:'Male',   prog:'B.E.',    branch:'Information Technology',                    cat:'Management', mobile:'9500011027', email:'bala@kvell.edu',           yr:'2025-26', comm:'BCM', grp:'HSC',  mo:71, po:68, co:73, fg:'No',  afw:'No'  },
  { id:'D028', appN:'APP-2025-028', admN:'ADM-2025-028', name:'Chandra Mohan K',    dob:'2007-08-13', gender:'Male',   prog:'B.E.',    branch:'Power Systems Engineering',                 cat:'Merit',      mobile:'9500011028', email:'chandramohan@kvell.edu',   yr:'2025-26', comm:'ST',  grp:'CBSE', mo:66, po:70, co:64, fg:'No',  afw:'No'  },
  { id:'D029', appN:'APP-2025-029', admN:'ADM-2025-029', name:'Deepika Rani S',     dob:'2006-06-25', gender:'Female', prog:'B.E.',    branch:'Power Systems Engineering',                 cat:'Management', mobile:'9500011029', email:'deepika@kvell.edu',        yr:'2025-26', comm:'SC',  grp:'HSC',  mo:82, po:79, co:84, fg:'No',  afw:'No'  },
  { id:'D030', appN:'APP-2025-030', admN:'ADM-2025-030', name:'Elango Murugan P',   dob:'2007-04-08', gender:'Male',   prog:'B.E.',    branch:'Power Systems Engineering',                 cat:'Management', mobile:'9500011030', email:'elango@kvell.edu',         yr:'2025-26', comm:'MBC', grp:'HSC',  mo:76, po:80, co:77, fg:'Yes', afw:'No'  },
  { id:'D031', appN:'APP-2025-031', admN:'ADM-2025-031', name:'Freeda Mary J',      dob:'2006-11-30', gender:'Female', prog:'B.E.',    branch:'Communications Systems',                    cat:'Merit',      mobile:'9500011031', email:'freeda@kvell.edu',         yr:'2025-26', comm:'OC',  grp:'CBSE', mo:88, po:91, co:90, fg:'No',  afw:'No'  },
  { id:'D032', appN:'APP-2025-032', admN:'ADM-2025-032', name:'Gopalakrishnan S',   dob:'2007-01-17', gender:'Male',   prog:'B.E.',    branch:'Communications Systems',                    cat:'Management', mobile:'9500011032', email:'gopal@kvell.edu',          yr:'2025-26', comm:'BC',  grp:'HSC',  mo:75, po:78, co:76, fg:'No',  afw:'No'  },

  // ── Biotech equivalent → Mechanical + VLSI ───────────────────────────────
  { id:'D033', appN:'APP-2025-033', admN:'ADM-2025-033', name:'Haritha Lakshmi N',  dob:'2006-09-21', gender:'Female', prog:'B.E.',    branch:'Mechanical Engineering',                    cat:'Management', mobile:'9500011033', email:'haritha@kvell.edu',        yr:'2025-26', comm:'BCM', grp:'HSC',  mo:81, po:77, co:83, fg:'No',  afw:'No'  },
  { id:'D034', appN:'APP-2025-034', admN:'ADM-2025-034', name:'Ilayaraja M',        dob:'2007-07-10', gender:'Male',   prog:'B.E.',    branch:'Mechanical Engineering',                    cat:'Merit',      mobile:'9500011034', email:'ilayaraja@kvell.edu',      yr:'2025-26', comm:'SC',  grp:'CBSE', mo:72, po:75, co:70, fg:'No',  afw:'No'  },
  { id:'D035', appN:'APP-2025-035', admN:'ADM-2025-035', name:'Jasmine Fathima A',  dob:'2006-04-14', gender:'Female', prog:'B.E.',    branch:'Mechanical Engineering',                    cat:'Management', mobile:'9500011035', email:'jasmine@kvell.edu',        yr:'2025-26', comm:'ST',  grp:'HSC',  mo:67, po:71, co:65, fg:'No',  afw:'No'  },
  { id:'D036', appN:'APP-2025-036', admN:'ADM-2025-036', name:'Kamalesh Rajan T',   dob:'2007-06-05', gender:'Male',   prog:'M.E.',    branch:'VLSI Design',                               cat:'Merit',      mobile:'9500011036', email:'kamalesh@kvell.edu',       yr:'2025-26', comm:'OC',  grp:'HSC',  mo:91, po:94, co:92, fg:'No',  afw:'No'  },
  { id:'D037', appN:'APP-2025-037', admN:'ADM-2025-037', name:'Lalitha Priya S',    dob:'2002-03-28', gender:'Female', prog:'M.E.',    branch:'VLSI Design',                               cat:'Management', mobile:'9500011037', email:'lalitha@kvell.edu',        yr:'2025-26', comm:'MBC', grp:'HSC',  mo:85, po:87, co:86, fg:'Yes', afw:'No'  },

  // ── HRM / Finance / Marketing (PG variety) ────────────────────────────────
  { id:'D038', appN:'APP-2025-038', admN:'ADM-2025-038', name:'Manohar Das P',      dob:'2002-08-19', gender:'Male',   prog:'MBA',     branch:'Human Resource Management',                 cat:'Management', mobile:'9500011038', email:'manohar@kvell.edu',        yr:'2025-26', comm:'BC',  grp:'HSC',  mo:78, po:74, co:76, fg:'No',  afw:'No'  },
  { id:'D039', appN:'APP-2025-039', admN:'ADM-2025-039', name:'Nandhini Priya K',   dob:'2001-12-07', gender:'Female', prog:'MBA',     branch:'Finance',                                   cat:'Merit',      mobile:'9500011039', email:'nandhini@kvell.edu',       yr:'2025-26', comm:'OC',  grp:'CBSE', mo:83, po:86, co:82, fg:'No',  afw:'No'  },
  { id:'D040', appN:'APP-2025-040', admN:'ADM-2025-040', name:'Omkumar Selvan R',   dob:'2002-05-23', gender:'Male',   prog:'MBA',     branch:'Marketing',                                 cat:'Management', mobile:'9500011040', email:'omkumar@kvell.edu',        yr:'2025-26', comm:'BCM', grp:'HSC',  mo:74, po:77, co:75, fg:'No',  afw:'No'  },
];

// Build a full approved student record from the compact dummy row
function buildDummyRecord(d) {
  const isUGProg = ['B.E.', 'B.Tech.'].includes(d.prog);
  const certList = isUGProg ? UG_CERTIFICATES : PG_CERTIFICATES;
  const mo = d.mo, po = d.po, co = d.co;
  const totalObt = mo + po + co;
  const percentage = parseFloat(((totalObt / 300) * 100).toFixed(2));

  return {
    id: d.id,
    applicationNo: d.appN,
    admissionNo:   d.admN,
    registerNo:    d.admN.replace('ADM', 'REG'),   // e.g. REG-2025-001
    name:          d.name,
    dob:           d.dob,
    gender:        d.gender,
    programme:     d.prog,
    branch:        d.branch,
    category:      d.cat,
    mobile:        d.mobile,
    email:         d.email,
    academicYear:  d.yr,
    nationality:   'Indian',
    community:     d.comm,
    group:         d.grp,
    mathsObt:      mo,
    mathsMax:      100,
    physicsObt:    po,
    physicsMax:    100,
    chemObt:       co,
    chemMax:       100,
    totalObt,
    totalMax:      300,
    percentage,
    fg:            d.fg,
    afw:           d.afw,
    verificationStatus: 'Verified',
    admissionStatus:    'Approved',
    certificates:  makeAllCertsVerified(certList),
    stages:        makeAllStagesCompleted(),
    eligibility:   makeAllEligible(),
    declaration:   { name: d.name, date: '2025-07-10', signature: d.name.split(' ')[0] },
    officer:       { name: 'Dr. R. Meenakshi', designation: 'Asst. Professor', date: '2025-07-12', signature: 'R. Meenakshi' },
    approval:      approved(),
    createdAt:     '2025-07-01T08:00:00.000Z',
    updatedAt:     '2025-07-20T10:00:00.000Z',
  };
}

const DUMMY_SEED_FLAG = 'uniportal_dummy_seeded_v1';

export const seedDummyAdmissions = () => {
  // Guard: only inject once; existing real data is never touched
  if (localStorage.getItem(DUMMY_SEED_FLAG)) return;

  const existing = getStudents();
  const existingIds = new Set(existing.map(s => s.id));

  const toAdd = DUMMY_STUDENTS
    .filter(d => !existingIds.has(d.id))
    .map(buildDummyRecord);

  if (toAdd.length > 0) {
    // Append to the end so existing records stay at the top
    const merged = [...existing, ...toAdd];
    saveStudents(merged);
  }

  localStorage.setItem(DUMMY_SEED_FLAG, '1');
};

export { DEMO_USERS };
