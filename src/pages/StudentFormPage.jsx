import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { AlertTriangle, Save, ArrowLeft, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  ADMISSION_DRAFT_UPDATED_EVENT,
  addNotification,
  findStudent,
  getStudents,
  getStudentOfficerAssignment,
  normalizeVerificationStages,
  recordDuplicateOverride,
} from '../utils/localStorage';
import { findDuplicateApplications } from '../utils/duplicateDetection';
import { generateId } from '../utils/validation';
import { VERIFICATION_STAGES, ELIGIBILITY_PARAMETERS } from '../utils/demoData';
import { getAdmissionStatus, getOverallVerificationStatus, getSavedStageStatus } from '../utils/verification';

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
  const { user } = useAuth();
  const { createStudent, editStudent } = useApp();
  const [duplicateReview, setDuplicateReview] = useState(null);
  const [duplicateOverrideReason, setDuplicateOverrideReason] = useState('');

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

  const persistStudent = (data) => {
    const existingStudent = isEdit ? findStudent(id) : null;
    const previousAdmissionStatus = getAdmissionStatus(existingStudent);
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
    if (approval.status === 'Approved' && previousAdmissionStatus !== 'Approved') {
      const assignment = getStudentOfficerAssignment(record.id);
      addNotification({
        title: 'Admission approved',
        message: `${record.name}'s admission was approved.`,
        type: 'success',
        studentId: record.id,
        studentName: record.name,
        recipientIds: [...new Set([
          assignment?.officerId,
          ...Object.values(assignment?.stageAssignments || {}),
        ].filter(Boolean))],
        recipientRoles: ['Admin'],
        eventKey: `admission-approved:${record.id}:${record.updatedAt}`,
      });
    }
    try {
      sessionStorage.removeItem(formDraftStorageKey);
      sessionStorage.removeItem(draftIdStorageKey(location.key));
    } catch (error) {
      console.error('Unable to clear saved admission form draft.', error);
    }
    navigate('/students');
  };

  const onSave = (data, { confirmed = false, overrideReason = '' } = {}) => {
    const duplicates = findDuplicateApplications(
      data,
      getStudents(),
      isEdit ? id : ''
    );
    const hasBlockingDuplicate = duplicates.some(match =>
      match.reasons.some(reason => reason.type === 'blocked')
    );
    const requiresAdminOverride = duplicates.some(match =>
      match.reasons.some(reason => reason.type === 'admin-override')
    );
    const authorizedOverride = user?.role === 'Admin' && overrideReason.trim();

    if (
      hasBlockingDuplicate ||
      (duplicates.length > 0 && !confirmed) ||
      (requiresAdminOverride && !authorizedOverride)
    ) {
      setDuplicateOverrideReason('');
      setDuplicateReview({ data, duplicates });
      return;
    }

    if (requiresAdminOverride && authorizedOverride) {
      recordDuplicateOverride({
        studentId: isEdit ? id : draftId,
        matches: duplicates
          .filter(match => match.reasons.some(reason => reason.type === 'admin-override'))
          .map(match => ({
            studentId: match.student.id,
            fields: match.reasons
              .filter(reason => reason.type === 'admin-override')
              .map(reason => reason.field),
          })),
        reason: overrideReason.trim(),
        adminId: user.id,
        adminName: user.name,
        occurredAt: new Date().toISOString(),
      });
    }

    setDuplicateReview(null);
    persistStudent(data);
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
      {duplicateReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="duplicate-review-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-700 bg-amber-950">
                <AlertTriangle size={20} className="text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="duplicate-review-title" className="text-base font-semibold text-slate-100">
                  Duplicate application review
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-300">
                  Check the existing records below before continuing. Duplicate application or admission numbers cannot be overridden.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateReview(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                aria-label="Close duplicate review"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {duplicateReview.duplicates.map(({ student, reasons }) => (
                <div key={student.id} className="rounded-xl border border-amber-700 bg-slate-800 p-4">
                  <p className="text-sm font-semibold text-white">{student.name || 'Unnamed student'}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Application No.: {student.applicationNo || '—'} · Programme: {student.programme || '—'}
                  </p>
                  <p className="mt-2 text-xs font-medium leading-5 text-amber-200">
                    Reason: {reasons.map(reason => {
                      if (reason.type === 'blocked') return `duplicate ${reason.field.toLowerCase()} — cannot override`;
                      if (reason.type === 'admin-override') return `matching ${reason.field.toLowerCase()} — Admin override required`;
                      return 'name and date of birth match — potential duplicate';
                    }).join('; ')}
                  </p>
                  <p className="mt-1 text-xs text-amber-200">
                    Matching field: {reasons.map(reason => reason.field).join(', ')}
                  </p>
                  <a
                    href={`/students/${encodeURIComponent(student.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-blue-300 underline decoration-blue-500/60 underline-offset-2 hover:text-blue-200"
                  >
                    View existing student record
                  </a>
                </div>
              ))}
            </div>

            {duplicateReview.duplicates.some(match =>
              match.reasons.some(reason => reason.type === 'admin-override')
            ) && (
              <div className="mt-4 rounded-lg border border-slate-600 bg-slate-800 p-4">
                {user?.role === 'Admin' ? (
                  <>
                    <label htmlFor="duplicate-override-reason" className="label !text-slate-200">
                      Admin override explanation <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="duplicate-override-reason"
                      value={duplicateOverrideReason}
                      onChange={event => setDuplicateOverrideReason(event.target.value)}
                      rows={3}
                      maxLength={500}
                      className="input-field mt-1 !border-slate-500 !bg-slate-900 !text-slate-100 placeholder:!text-slate-400 focus:!border-blue-400 focus:!ring-blue-500"
                      placeholder="Explain why this application should proceed despite the matching email or mobile number."
                    />
                  </>
                ) : (
                  <p className="text-sm font-medium text-red-300">
                    Only an Admin can override a matching email address or mobile number.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDuplicateReview(null);
                  setDuplicateOverrideReason('');
                }}
                className="btn-secondary !border-slate-600 !bg-slate-700 !text-slate-100 hover:!bg-slate-600 focus:!ring-slate-400"
              >
                Return to form
              </button>
              {!duplicateReview.duplicates.some(match =>
                match.reasons.some(reason => reason.type === 'blocked')
              ) && (user?.role === 'Admin' ||
                !duplicateReview.duplicates.some(match =>
                  match.reasons.some(reason => reason.type === 'admin-override')
                )) && (
                <button
                  type="button"
                  onClick={() => onSave(duplicateReview.data, {
                    confirmed: true,
                    overrideReason: duplicateOverrideReason,
                  })}
                  disabled={
                    duplicateReview.duplicates.some(match =>
                      match.reasons.some(reason => reason.type === 'admin-override')
                    ) && !duplicateOverrideReason.trim()
                  }
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </FormProvider>
  );
}
