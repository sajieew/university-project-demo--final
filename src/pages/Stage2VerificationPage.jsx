import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStage2Verification, saveStage2Verification } from '../utils/localStorage';
import { VERIFICATION_ITEMS, getStageProgress } from '../utils/verification';

const CERTIFICATES = VERIFICATION_ITEMS[2];
const EMPTY_VERIFICATION = Object.fromEntries(CERTIFICATES.map(({ id }) => [id, '']));

export default function Stage2VerificationPage() {
  const { studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [verification, setVerification] = useState(() => ({
    ...EMPTY_VERIFICATION,
    ...getStage2Verification(studentId),
  }));
  const { completedCount: verifiedCount, totalCount, percentage: progress } =
    getStageProgress(2, verification);

  const handleChange = (id, status, checked) => {
    const nextVerification = {
      ...verification,
      [id]: checked ? status : '',
    };
    setVerification(nextVerification);
    try {
      saveStage2Verification(studentId, nextVerification);
    } catch (error) {
      console.error('Stage 2 verification save error', error);
      showToast('Unable to save Stage 2 verification. Please check browser storage and try again.', 'error');
    }
  };

  const handleSave = () => {
    try {
      saveStage2Verification(studentId, verification);
      showToast('Stage 2 verification saved successfully.', 'success');
    } catch (error) {
      console.error('Stage 2 verification save error', error);
      showToast('Unable to save Stage 2 verification. Please check browser storage and try again.', 'error');
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
              Stage 2 – Academic Qualification Verification
            </h1>
            <p className="text-sm text-slate-400">Verify the student&apos;s 10th, 11th, and 12th mark certificates.</p>
          </div>
        </div>
        <button type="button" onClick={handleSave} className="btn-primary">
          <Save size={15} /> Save Verification
        </button>
      </div>

      <section className="card p-5" aria-label="Verification progress">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm font-semibold text-slate-700">Certificates verified</p>
          <p className="text-sm font-semibold text-emerald-700">
            {verifiedCount} of {totalCount} ({progress}%)
          </p>
        </div>
        <div
          className="h-2 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-label="Certificates verified"
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={verifiedCount}
        >
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
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
              {CERTIFICATES.map(({ id, label }, index) => (
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
                  <td className="table-cell font-medium">{label}</td>
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
