import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ADMISSION_DRAFT_UPDATED_EVENT,
  findStudent,
  normalizeVerificationStages,
} from '../utils/localStorage';
import { generateId } from '../utils/validation';
import { VERIFICATION_STAGES, ELIGIBILITY_PARAMETERS } from '../utils/demoData';
import { getOverallVerificationStatus, getSavedStageStatus } from '../utils/verification';

import StudentDetailsForm from '../components/forms/StudentDetailsForm';
import VerificationStepper from '../components/forms/VerificationStepper';
import EligibilityForm from '../components/forms/EligibilityForm';
import DeclarationSection from '../components/forms/DeclarationSection';
import VerificationOfficerForm from '../components/forms/VerificationOfficerForm';
import AdmissionApprovalForm from '../components/forms/AdmissionApprovalForm';

const makeStages = () =>
  VERIFICATION_STAGES.reduce((acc, stage) => { acc[stage.id] = { status: 'Pending', verifiedBy: '', date: '', remarks: '' }; return acc; }, {});

const makeEligibility = () => ({
  ...ELIGIBILITY_PARAMETERS.reduce((acc, p) => { acc[p.id] = 'Yes'; return acc; }, {}),
  finalStatus: 'PENDING VERIFICATION',
});

const SECTIONS = [
  { index: 0, title: 'Student Details' },
  { index: 2, title: 'Verification Process' },
  { index: 3, title: 'Eligibility' },
  { index: 4, title: 'Declaration' },
  { index: 5, title: 'Verification Officer' },
  { index: 6, title: 'Admission Approval' },
];

const sectionStatesByHistoryKey = new Map();
const draftIdStorageKey = (historyKey) => `admission-draft-id-${historyKey}`;

export default function StudentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const location = useLocation();
  const navigate = useNavigate();
  const { createStudent, editStudent } = useApp();

  const formDraftStorageKey = `admission-form-draft-${location.key}`;
  const [formDraft] = useState(() => {
    try {
      const saved = sessionStorage.getItem(formDraftStorageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Unable to load admission form draft.', error);
      return null;
    }
  });
  const methods = useForm({ mode: 'onBlur', defaultValues: formDraft?.formValues || {} });
  const { setValue, getValues, handleSubmit, subscribe } = methods;

  const [stages, setStages]             = useState(() => formDraft?.stages || makeStages());
  const [eligibility, setEligibility]   = useState(() => formDraft?.eligibility || makeEligibility());
  const [declaration, setDeclaration]   = useState(() => formDraft?.declaration || { name: '', date: '', signature: '' });
  const [officer, setOfficer]           = useState(() => formDraft?.officer || { name: '', designation: '', signature: '', date: '' });
  const [approval, setApproval]         = useState(() => formDraft?.approval || { status: 'Pending', remarks: '', officer: '', date: '', signature: '' });
  const [openSections, setOpenSections] = useState(() => (
    sectionStatesByHistoryKey.get(location.key) || formDraft?.openSections || {
      0: true,
      2: location.state?.openSection === 2,
      3: false,
      4: false,
      5: false,
      6: false,
    }
  ));
  const [draftId] = useState(() =>
    location.state?.recordId
    || sessionStorage.getItem(draftIdStorageKey(location.key))
    || generateId()
  );

  useEffect(() => {
    sectionStatesByHistoryKey.set(location.key, openSections);
  }, [location.key, openSections]);

  useEffect(() => {
    if (!isEdit) {
      sessionStorage.setItem(draftIdStorageKey(location.key), draftId);
      window.dispatchEvent(new Event(ADMISSION_DRAFT_UPDATED_EVENT));
    }
  }, [draftId, isEdit, location.key]);

  // Load existing record on edit
  useEffect(() => {
    if (isEdit) {
      const s = findStudent(id);
      if (!s) { navigate('/students'); return; }

      setValue('applicationNo', s.applicationNo);
      setValue('admissionNo', s.admissionNo);
      setValue('registerNo', s.registerNo || '');
      setValue('name', s.name);
      setValue('dob', s.dob);
      setValue('gender', s.gender);
      setValue('programme', s.programme);
      setValue('branch', s.branch);
      setValue('category', s.category);
      setValue('mobile', s.mobile);
      setValue('email', s.email);
      setValue('academicYear', s.academicYear);
      // New fields (safe — undefined if not set)
      setValue('nationality', s.nationality || '');
      setValue('nationalityOther', s.nationalityOther || '');
      setValue('community', s.community || '');
      setValue('group', s.group || '');
      setValue('mathsObt', s.mathsObt ?? '');
      setValue('mathsMax', s.mathsMax ?? '');
      setValue('physicsObt', s.physicsObt ?? '');
      setValue('physicsMax', s.physicsMax ?? '');
      setValue('chemObt', s.chemObt ?? '');
      setValue('chemMax', s.chemMax ?? '');
      setValue('fg', s.fg || '');
      setValue('afw', s.afw || '');

      if (formDraft?.formValues) {
        Object.entries(formDraft.formValues).forEach(([field, value]) => setValue(field, value));
      }

      setStages(formDraft?.stages || normalizeVerificationStages(s.stages || makeStages()));
      setEligibility(formDraft?.eligibility || s.eligibility || makeEligibility());
      setDeclaration(formDraft?.declaration || s.declaration || { name: '', date: '', signature: '' });
      setOfficer(formDraft?.officer || s.officer || { name: '', designation: '', signature: '', date: '' });
      setApproval(formDraft?.approval || s.approval || { status: 'Pending', remarks: '', officer: '', date: '', signature: '' });
    }
  }, [formDraft, id, isEdit, navigate, setValue]);

  useEffect(() => {
    const saveDraft = (formValues = getValues()) => {
      try {
        sessionStorage.setItem(formDraftStorageKey, JSON.stringify({
          formValues,
          stages,
          eligibility,
          declaration,
          officer,
          approval,
          openSections,
        }));
      } catch (error) {
        console.error('Unable to preserve admission form draft.', error);
      }
    };

    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => saveDraft(values),
    });
    saveDraft();
    return unsubscribe;
  }, [
    approval,
    declaration,
    eligibility,
    formDraftStorageKey,
    getValues,
    officer,
    openSections,
    stages,
    subscribe,
  ]);

  const toggleSection = (idx) => setOpenSections(prev => {
    const next = { ...prev, [idx]: !prev[idx] };
    sectionStatesByHistoryKey.set(location.key, next);
    return next;
  });

  const onSave = (data) => {
    const existingStudent = isEdit ? findStudent(id) : null;
    const savedStages = Object.fromEntries(VERIFICATION_STAGES.map(stage => [
      stage.id,
      {
        ...(stages[stage.id] || {}),
        status: getSavedStageStatus(stage.id, isEdit ? id : draftId),
      },
    ]));
    const verificationStatus = getOverallVerificationStatus(isEdit ? id : draftId);

    // Auto-calculate totals from subject marks
    const mathsObt = Number(data.mathsObt) || 0;
    const mathsMax = Number(data.mathsMax) || 0;
    const physicsObt = Number(data.physicsObt) || 0;
    const physicsMax = Number(data.physicsMax) || 0;
    const chemObt = Number(data.chemObt) || 0;
    const chemMax = Number(data.chemMax) || 0;
    const totalObt = mathsObt + physicsObt + chemObt;
    const totalMax = mathsMax + physicsMax + chemMax;
    const percentage = totalMax > 0 ? parseFloat(((totalObt / totalMax) * 100).toFixed(2)) : 0;

    const record = {
      id: isEdit ? id : draftId,
      ...data,
      // Computed marks
      mathsObt, mathsMax,
      physicsObt, physicsMax,
      chemObt, chemMax,
      totalObt, totalMax, percentage,
      ...(isEdit && existingStudent ? { certificates: existingStudent.certificates } : {}),
      stages: savedStages,
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
    try {
      sessionStorage.removeItem(formDraftStorageKey);
      sessionStorage.removeItem(draftIdStorageKey(location.key));
    } catch (error) {
      console.error('Unable to clear saved admission form draft.', error);
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
          {SECTIONS.map(({ index, title }) => (
            <div key={index} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Section {String.fromCharCode(65 + index)} — {title}</span>
                </div>
                {openSections[index] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>

              {openSections[index] && (
                <div className="border-t border-slate-100 p-6">
                  {index === 0 && <StudentDetailsForm />}
                  {index === 2 && (
                    <VerificationStepper
                      stages={stages}
                      onChange={setStages}
                      recordId={isEdit ? id : draftId}
                      isEdit={isEdit}
                    />
                  )}
                  {index === 3 && <EligibilityForm eligibility={eligibility} onChange={setEligibility} />}
                  {index === 4 && (
                    <DeclarationSection
                      declaration={declaration}
                      onChange={setDeclaration}
                      applicationId={isEdit ? id : draftId}
                    />
                  )}
                  {index === 5 && (
                    <VerificationOfficerForm
                      officer={officer}
                      onChange={setOfficer}
                      applicationId={isEdit ? id : draftId}
                    />
                  )}
                  {index === 6 && (
                    <AdmissionApprovalForm
                      approval={approval}
                      onChange={setApproval}
                      applicationId={isEdit ? id : draftId}
                    />
                  )}
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
