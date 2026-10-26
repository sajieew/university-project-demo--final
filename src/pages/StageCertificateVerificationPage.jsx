import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getStudentStageVerification,
  saveStudentStageVerification,
} from '../utils/localStorage';

const STAGE_CONFIG = {
  3: {
    title: 'Original Certificate Verification',
    items: [
      { id: 'birthCertificate', label: 'Birth Certificate Present?' },
      { id: 'aadhaarCard', label: 'Aadhaar Card Present?' },
      { id: 'incomeCertificate', label: 'Income Certificate Present?' },
      { id: 'nativityCertificate', label: 'Nativity Certificate Present?' },
      { id: 'communityCertificate', label: 'Community Certificate Present?' },
    ],
  },
  4: {
    title: 'Community Certificate Verification',
    items: [
      { id: 'communityCertificate', label: 'Community Certificate Present?' },
    ],
  },
  5: {
    title: 'Transfer and NRI Certificate Verification',
    items: [
      { id: 'transferCertificate', label: 'Transfer Certificate Present?' },
      { id: 'nriCertificate', label: 'NRI Certificate Present?', optional: true },
    ],
  },
  6: {
    title: 'Payment Verification',
    items: [
      { id: 'paymentDoneCertificate', label: 'Payment Done Certificate Present?' },
      { id: 'emiSanctionedCertificate', label: 'EMI Sanctioned Certificate Present?', optional: true },
    ],
  },
  7: {
    title: 'Approval Certificate Verification',
    items: [
      { id: 'approvalCertificate', label: 'Approval Certificate Present?' },
    ],
  },
};

export default function StageCertificateVerificationPage({ stageNumber }) {
  const { studentId } = useParams();
  const stageId = String(stageNumber);
  const stage = STAGE_CONFIG[stageId];
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [verification, setVerification] = useState(() => {
    if (!stage) return {};
    return {
      ...Object.fromEntries(stage.items.map(({ id }) => [id, ''])),
      ...getStudentStageVerification(studentId, stageId),
    };
  });

  if (!stage) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-600">This verification stage is not available.</p>
        <button
          type="button"
          onClick={() => navigate('/students/new', { state: { recordId: studentId, openSection: 2 } })}
          className="btn-secondary btn-sm mt-4"
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>
    );
  }

  const compulsoryItems = stage.items.filter(item => !item.optional);
  const completedCount = compulsoryItems.filter(item =>
    verification[item.id] === 'Yes' || verification[item.id] === 'No'
  ).length;
  const progress = Math.round((completedCount / compulsoryItems.length) * 100);

  const handleSave = () => {
    try {
      saveStudentStageVerification(studentId, stageId, verification);
      showToast(`Stage ${stageId} verification saved successfully.`, 'success');
    } catch (error) {
      console.error(`Stage ${stageId} verification save error`, error);
      showToast('Unable to save verification. Please check browser storage and try again.', 'error');
    }
  };

  const handleBack = () => {
    navigate(location.state?.returnTo || '/students/new', {
      state: { recordId: studentId, openSection: 2 },
    });
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="btn-secondary btn-sm">
            <ArrowLeft size={13} /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Stage {stageId} – {stage.title}
            </h1>
            <p className="text-sm text-slate-400">Select Yes or No to record each compulsory verification decision.</p>
          </div>
        </div>
        <button type="button" onClick={handleSave} className="btn-primary">
          <Save size={15} /> Save Verification
        </button>
      </div>

      <section className="card p-5" aria-label="Verification progress">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm font-semibold text-slate-700">Compulsory verification decisions completed</p>
          <p className="text-sm font-semibold text-emerald-700">
            {completedCount} of {compulsoryItems.length} ({progress}%)
          </p>
        </div>
        <div
          className="h-2 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-label="Compulsory verification decisions completed"
          aria-valuemin={0}
          aria-valuemax={compulsoryItems.length}
          aria-valuenow={completedCount}
        >
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          A decision is complete when Yes or No is selected; No records that the certificate is not present.
        </p>
      </section>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="table-header w-16">S. No.</th>
                <th className="table-header">Verification Item</th>
                <th className="table-header text-center">Yes</th>
                <th className="table-header text-center">No</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stage.items.map(({ id, label, optional }, index) => (
                <tr
                  key={id}
                  className={
                    verification[id] === 'Yes'
                      ? 'bg-emerald-50/60'
                      : verification[id] === 'No'
                        ? 'bg-red-50/60'
                        : index % 2 ? 'bg-slate-50/40' : ''
                  }
                >
                  <td className="table-cell text-xs text-slate-400">{index + 1}</td>
                  <td className="table-cell font-medium">
                    <span>{label}</span>
                    {optional && (
                      <span className="ml-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        Optional
                      </span>
                    )}
                  </td>
                  {['Yes', 'No'].map(status => (
                    <td key={status} className="table-cell text-center">
                      <label className="inline-flex items-center justify-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verification[id] === status}
                          onChange={event => setVerification(previous => ({
                            ...previous,
                            [id]: event.target.checked ? status : '',
                          }))}
                          aria-label={`${status}: ${label}`}
                          className={`h-4 w-4 rounded focus:ring-2 ${
                            status === 'Yes'
                              ? 'accent-emerald-600 focus:ring-emerald-500'
                              : 'accent-red-600 focus:ring-red-500'
                          }`}
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} className="btn-primary">
          <Save size={15} /> Save Verification
        </button>
      </div>
    </div>
  );
}
