import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, FileDown, Printer, Trash2, CheckCircle, Clock, Minus } from 'lucide-react';
import { findStudent, normalizeVerificationStages } from '../utils/localStorage';
import { getSavedStageStatus } from '../utils/verification';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { downloadPDF, printPDF } from '../utils/pdfGenerator';
import { VERIFICATION_STAGES, ELIGIBILITY_PARAMETERS } from '../utils/demoData';
import { formatDate } from '../utils/validation';

const signatureLabel = (signature) =>
  typeof signature === 'string' ? signature : signature?.fileName || '';

const STAGE_ICONS = {
  Completed: <CheckCircle size={16} className="text-emerald-500" />,
  Pending:   <Clock size={16} className="text-red-500" />,
  NA:        <Minus size={16} className="text-slate-400" />,
};

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-0 py-1.5 border-b border-slate-50 last:border-0">
      <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide sm:w-48 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-slate-700">{value || '—'}</dd>
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { removeStudent } = useApp();
  const [student, setStudent]       = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const s = findStudent(id);
    if (!s) navigate('/students');
    else setStudent(s);
  }, [id]);

  if (!student) return null;

  const stages = normalizeVerificationStages(student.stages);
  const stageStatuses = VERIFICATION_STAGES.map(stage =>
    getSavedStageStatus(stage.id, student.id)
  );
  const verificationStatus = stageStatuses.every(status => status === 'Completed')
    ? 'Verified'
    : 'Pending';

  const handleDelete = () => {
    removeStudent(student.id);
    navigate('/students');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header — hidden in print */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary btn-sm">
            <ArrowLeft size={13} /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-sm text-slate-400">{student.applicationNo} • {student.programme} — {student.branch}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/students/${student.id}/edit`)} className="btn-secondary btn-sm">
            <Pencil size={13} /> Edit
          </button>
          <button onClick={() => downloadPDF(student)} className="btn-success btn-sm">
            <FileDown size={13} /> Download PDF
          </button>
          <button onClick={handlePrint} className="btn-secondary btn-sm">
            <Printer size={13} /> Print
          </button>
          <button onClick={() => setShowDelete(true)} className="btn-danger btn-sm">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase">University Admission & Certificate Verification Portal</h1>
        <h2 className="text-base font-semibold mt-1">Certificate Verification Form</h2>
        <p className="text-sm text-slate-500 mt-1">Academic Year: {student.academicYear}</p>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 no-print">
        <StatusBadge status={verificationStatus} />
        <StatusBadge status={student.admissionStatus} />
      </div>

      {/* Section A: Student Details */}
      <div className="card p-6">
        <h2 className="section-title">Section A — Student Details</h2>
        <dl className="divide-y divide-slate-50">
          <DetailRow label="Application No."        value={student.applicationNo} />
          <DetailRow label="Admission No."          value={student.admissionNo} />
          <DetailRow label="Name of the Student"    value={student.name} />
          <DetailRow label="Date of Birth"          value={formatDate(student.dob)} />
          <DetailRow label="Gender"                 value={student.gender} />
          <DetailRow label="Programme Applied"      value={student.programme} />
          <DetailRow label="Branch / Specialization" value={student.branch} />
          <DetailRow label="Admission Category"     value={student.category} />
          <DetailRow label="Mobile Number"          value={student.mobile} />
          <DetailRow label="Email ID"               value={student.email} />
          <DetailRow label="Academic Year"          value={student.academicYear} />
        </dl>
      </div>

      {/* Section C: Verification Process */}
      <div className="card p-6">
        <h2 className="section-title">Section C — Verification Process</h2>
        <div className="space-y-3">
          {VERIFICATION_STAGES.map(stage => {
            const s = stages[stage.id] || { status: 'Pending' };
            const status = getSavedStageStatus(stage.id, student.id);
            return (
              <div key={stage.id} className="flex items-start gap-4 py-2 border-b border-slate-50 last:border-0">
                <div className="flex-shrink-0 mt-0.5">{STAGE_ICONS[status] || STAGE_ICONS.Pending}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{stage.id}. {stage.name}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-0.5 mt-1">
                    {s.verifiedBy && <span className="text-xs text-slate-400">By: {s.verifiedBy}</span>}
                    {s.date && <span className="text-xs text-slate-400">Date: {formatDate(s.date)}</span>}
                    {s.remarks && <span className="text-xs text-slate-400">Remarks: {s.remarks}</span>}
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section D: Eligibility */}
      <div className="card p-6">
        <h2 className="section-title">Section D — Eligibility Verification</h2>
        <div className="space-y-2 mb-5">
          {ELIGIBILITY_PARAMETERS.map(param => {
            const val = student.eligibility?.[param.id] || 'NA';
            const colors = { Yes: 'text-emerald-600', No: 'text-red-500', NA: 'text-slate-400' };
            return (
              <div key={param.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <p className="text-sm text-slate-600">{param.label}</p>
                <span className={`text-sm font-bold ${colors[val]}`}>{val}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Final Verification Status</p>
          <StatusBadge status={student.eligibility?.finalStatus} className="text-sm" />
        </div>
      </div>

      {/* Sections E, F, G */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* E: Declaration */}
        <div className="card p-5">
          <h2 className="section-title">Section E — Declaration</h2>
          <DetailRow label="Student Name" value={student.declaration?.name} />
          <DetailRow label="Date"         value={formatDate(student.declaration?.date)} />
          <DetailRow label="Signature"    value={signatureLabel(student.declaration?.signature)} />
        </div>

        {/* F: Verification Officer */}
        <div className="card p-5">
          <h2 className="section-title">Section F — Officer</h2>
          <DetailRow label="Name"        value={student.officer?.name} />
          <DetailRow label="Designation" value={student.officer?.designation} />
          <DetailRow label="Date"        value={formatDate(student.officer?.date)} />
          <DetailRow label="Signature"   value={signatureLabel(student.officer?.signature)} />
        </div>

        {/* G: Admission Approval */}
        <div className="card p-5">
          <h2 className="section-title">Section G — Approval</h2>
          <div className="mb-3">
            <StatusBadge status={student.approval?.status || 'Pending'} />
          </div>
          <DetailRow label="Officer"   value={student.approval?.officer} />
          <DetailRow label="Date"      value={formatDate(student.approval?.date)} />
          <DetailRow label="Remarks"   value={student.approval?.remarks} />
          <DetailRow label="Signature" value={signatureLabel(student.approval?.signature)} />
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Student Record"
        message={`Are you sure you want to delete the record for "${student.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
