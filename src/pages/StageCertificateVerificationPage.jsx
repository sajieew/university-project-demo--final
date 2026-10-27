import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getStudentStageVerification,
  saveStudentStageVerification,
} from '../utils/localStorage';
import { VERIFICATION_ITEMS, getStageProgress } from '../utils/verification';
import useVerificationItemFocus from '../hooks/useVerificationItemFocus';

const STAGE_CONFIG = {
  3: {
    title: 'Original Certificate Verification',
    items: VERIFICATION_ITEMS[3],
  },
  4: {
    title: 'Transfer Certificate Verification',
    items: VERIFICATION_ITEMS[4],
  },
  5: {
    title: 'Payment Verification',
    items: VERIFICATION_ITEMS[5],
  },
  6: {
    title: 'Approval Certificate Verification',
    items: VERIFICATION_ITEMS[6],
  },
};

export default function StageCertificateVerificationPage({ stageNumber }) {
  const { studentId } = useParams();
  const stageId = String(stageNumber);
  const stage = STAGE_CONFIG[stageId];
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useApp();
  useVerificationItemFocus(location.state?.focusItem);
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

  const { completedCount, totalCount, percentage: progress } =
    getStageProgress(stageId, verification);
  const optionalItems = stage.items.filter(item => item.optional);
  const optionalDecisionsCount = optionalItems.filter(item =>
    verification[item.id] === 'Yes' || verification[item.id] === 'No'
  ).length;

  const handleChange = (id, status, checked) => {
    const nextVerification = {
      ...verification,
      [id]: checked ? status : '',
    };
    setVerification(nextVerification);
    try {
      saveStudentStageVerification(studentId, stageId, nextVerification);
    } catch (error) {
      console.error(`Stage ${stageId} verification save error`, error);
      showToast('Unable to save verification. Please check browser storage and try again.', 'error');
    }
  };

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
    if (location.state?.returnToKey) {
      navigate(-1);
      return;
    }

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
          <p className="text-sm font-semibold text-slate-700">Compulsory items verified Yes</p>
          <p className="text-sm font-semibold text-emerald-700">
            {completedCount} of {totalCount} ({progress}%)
          </p>
        </div>
        <div
          className="h-2 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-label="Compulsory verification decisions completed"
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={completedCount}
        >
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {stageId === '4' && optionalItems.length > 0
            ? `Optional decisions recorded: ${optionalDecisionsCount} of ${optionalItems.length}. `
            : ''}
          A compulsory item is complete only when Yes is selected. No or unanswered items remain pending.
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
                  id={`verification-item-${id}`}
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
                          onChange={event => handleChange(id, status, event.target.checked)}
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
