import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStage1Verification, saveStage1Verification } from '../utils/localStorage';

const VERIFICATION_ITEM_KEY = 'applicationFormPresent';
const EMPTY_VERIFICATION = { status: '' };

export default function Stage1VerificationPage() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [verification, setVerification] = useState(
    () => getStage1Verification()[VERIFICATION_ITEM_KEY] || EMPTY_VERIFICATION
  );
  const verifiedCount = verification.status === 'Yes' ? 1 : 0;
  const progress = verifiedCount * 100;

  const handleSave = () => {
    try {
      saveStage1Verification({
        ...getStage1Verification(),
        [VERIFICATION_ITEM_KEY]: verification,
      });
      showToast('Stage 1 verification saved successfully.', 'success');
    } catch (error) {
      console.error('Stage 1 verification save error', error);
      showToast('Unable to save Stage 1 verification. Please check browser storage and try again.', 'error');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/students/new', { state: { openSection: 2 } })}
            className="btn-secondary btn-sm"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Stage 1 – Application &amp; Student Details Verification
            </h1>
            <p className="text-sm text-slate-400">Review the application and student details entered in Section A.</p>
          </div>
        </div>
        <button type="button" onClick={handleSave} className="btn-primary">
          <Save size={15} /> Save Verification
        </button>
      </div>

      <section className="card p-5" aria-label="Verification progress">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm font-semibold text-slate-700">Application form verified</p>
          <p className="text-sm font-semibold text-emerald-700">
            {verifiedCount} of 1 ({progress}%)
          </p>
        </div>
        <div
          className="h-2 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-label="Verified subtopics"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={verifiedCount}
        >
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="table-header w-16">S. No.</th>
                  <th className="table-header">Verification Item</th>
                  <th className="table-header text-center">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr
                className={
                  verification.status === 'Yes'
                    ? 'bg-emerald-50/60'
                    : verification.status === 'No'
                      ? 'bg-red-50/60'
                      : ''
                }
              >
                <td className="table-cell text-xs text-slate-400">1</td>
                <td className="table-cell font-medium">Application Form Present?</td>
                {['Yes', 'No'].map(status => (
                  <td key={status} className="table-cell text-center">
                    <label className="inline-flex items-center justify-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verification.status === status}
                        onChange={event => setVerification({ status: event.target.checked ? status : '' })}
                        aria-label={`${status}: Application Form Present?`}
                        className={`h-4 w-4 rounded focus:ring-2 ${
                          status === 'Yes'
                            ? 'accent-emerald-600 focus:ring-emerald-500'
                            : 'accent-red-600 focus:ring-red-500'
                        }`}
                      />
                      <span className={status === 'Yes' ? 'text-emerald-700' : 'text-red-700'}>
                        {status}
                      </span>
                    </label>
                  </td>
                ))}
              </tr>
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
