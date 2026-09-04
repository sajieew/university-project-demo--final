import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { findStudent } from '../utils/localStorage';
import { generateId } from '../utils/validation';
import { UG_CERTIFICATES, PG_CERTIFICATES, VERIFICATION_STAGES, ELIGIBILITY_PARAMETERS } from '../utils/demoData';

import StudentDetailsForm from '../components/forms/StudentDetailsForm';
import CertificateChecklist from '../components/forms/CertificateChecklist';
import VerificationStepper from '../components/forms/VerificationStepper';
import EligibilityForm from '../components/forms/EligibilityForm';
import DeclarationSection from '../components/forms/DeclarationSection';
import VerificationOfficerForm from '../components/forms/VerificationOfficerForm';
import AdmissionApprovalForm from '../components/forms/AdmissionApprovalForm';

const isUG = (p) => ['B.E.', 'B.Tech.'].includes(p);

const makeCertChecklist = (list) =>
  list.reduce((acc, cert) => { acc[cert.id] = { originalProduced: false, photocopySubmitted: false, verified: false, remarks: '' }; return acc; }, {});

const makeStages = () =>
  VERIFICATION_STAGES.reduce((acc, stage) => { acc[stage.id] = { status: 'Pending', verifiedBy: '', date: '', remarks: '' }; return acc; }, {});

const makeEligibility = () => ({
  ...ELIGIBILITY_PARAMETERS.reduce((acc, p) => { acc[p.id] = 'Yes'; return acc; }, {}),
  finalStatus: 'PENDING VERIFICATION',
});

const SECTIONS = [
  'Student Details',
  'Certificate Checklist',
  'Verification Process',
  'Eligibility',
  'Declaration',
  'Verification Officer',
  'Admission Approval',
];

export default function StudentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createStudent, editStudent } = useApp();

  const methods = useForm({ mode: 'onBlur' });
  const { watch, setValue, getValues, handleSubmit } = methods;

  const [certificates, setCertificates] = useState({});
  const [stages, setStages]             = useState(makeStages());
  const [eligibility, setEligibility]   = useState(makeEligibility());
  const [declaration, setDeclaration]   = useState({ name: '', date: '', signature: '' });
  const [officer, setOfficer]           = useState({ name: '', designation: '', signature: '', date: '' });
  const [approval, setApproval]         = useState({ status: 'Pending', remarks: '', officer: '', date: '', signature: '' });
  const [openSections, setOpenSections] = useState({ 0: true, 1: true, 2: false, 3: false, 4: false, 5: false, 6: false });

  const programme = watch('programme');

  // Load existing record on edit
  useEffect(() => {
    if (isEdit) {
      const s = findStudent(id);
      if (!s) { navigate('/students'); return; }

      setValue('applicationNo', s.applicationNo);
      setValue('admissionNo', s.admissionNo);
      setValue('name', s.name);
      setValue('dob', s.dob);
      setValue('gender', s.gender);
      setValue('programme', s.programme);
      setValue('branch', s.branch);
      setValue('category', s.category);
      setValue('mobile', s.mobile);
      setValue('email', s.email);
      setValue('academicYear', s.academicYear);

      setCertificates(s.certificates || {});
      setStages(s.stages || makeStages());
      setEligibility(s.eligibility || makeEligibility());
      setDeclaration(s.declaration || { name: '', date: '', signature: '' });
      setOfficer(s.officer || { name: '', designation: '', signature: '', date: '' });
      setApproval(s.approval || { status: 'Pending', remarks: '', officer: '', date: '', signature: '' });
    }
  }, [id, isEdit]);

  // Init certificates when programme changes (on new form)
  useEffect(() => {
    if (!isEdit && programme) {
      const list = isUG(programme) ? UG_CERTIFICATES : PG_CERTIFICATES;
      setCertificates(makeCertChecklist(list));
    }
  }, [programme, isEdit]);

  const toggleSection = (idx) => setOpenSections(prev => ({ ...prev, [idx]: !prev[idx] }));

  const onSave = (data) => {
    const allVerified = Object.values(stages).every(s => s.status === 'Completed' || s.status === 'NA');
    const verificationStatus = allVerified ? 'Verified' : 'Pending';

    const record = {
      id: isEdit ? id : generateId(),
      ...data,
      certificates,
      stages,
      eligibility,
      declaration,
      officer,
      approval,
      verificationStatus,
      admissionStatus: approval.status || 'Pending',
      createdAt: isEdit ? findStudent(id)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEdit) {
      editStudent(id, record);
    } else {
      createStudent(record);
    }
    navigate('/students');
  };

  return (
    <FormProvider {...methods}>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-secondary btn-sm">
              <ArrowLeft size={13} /> Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {isEdit ? 'Edit Student Record' : 'New Admission'}
              </h1>
              <p className="text-sm text-slate-400">
                {isEdit ? `Editing: ${getValues('name') || id}` : 'Fill all sections below and save'}
              </p>
            </div>
          </div>
          <button onClick={handleSubmit(onSave)} className="btn-primary">
            <Save size={15} /> {isEdit ? 'Update Record' : 'Save Student'}
          </button>
        </div>

        {/* Section accordion */}
        <div className="space-y-4">
          {SECTIONS.map((title, idx) => (
            <div key={idx} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Section {String.fromCharCode(65 + idx)} — {title}</span>
                </div>
                {openSections[idx] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>

              {openSections[idx] && (
                <div className="border-t border-slate-100 p-6">
                  {idx === 0 && <StudentDetailsForm />}
                  {idx === 1 && <CertificateChecklist programme={programme} certificates={certificates} onChange={setCertificates} />}
                  {idx === 2 && <VerificationStepper stages={stages} onChange={setStages} />}
                  {idx === 3 && <EligibilityForm eligibility={eligibility} onChange={setEligibility} />}
                  {idx === 4 && <DeclarationSection declaration={declaration} onChange={setDeclaration} />}
                  {idx === 5 && <VerificationOfficerForm officer={officer} onChange={setOfficer} />}
                  {idx === 6 && <AdmissionApprovalForm approval={approval} onChange={setApproval} />}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom save */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit(onSave)} className="btn-primary">
            <Save size={15} /> {isEdit ? 'Update Record' : 'Save Student'}
          </button>
        </div>
      </div>
    </FormProvider>
  );
}
