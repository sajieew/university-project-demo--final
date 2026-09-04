import { ELIGIBILITY_PARAMETERS } from '../../utils/demoData';

const FINAL_STATUSES = [
  'VERIFIED – ELIGIBLE FOR ADMISSION',
  'VERIFIED – SUBJECT TO SUBMISSION OF PENDING DOCUMENTS',
  'PENDING VERIFICATION',
  'NOT ELIGIBLE',
];

const STATUS_COLORS = {
  'VERIFIED – ELIGIBLE FOR ADMISSION':                     'bg-emerald-50 border-emerald-300 text-emerald-700',
  'VERIFIED – SUBJECT TO SUBMISSION OF PENDING DOCUMENTS': 'bg-blue-50 border-blue-300 text-blue-700',
  'PENDING VERIFICATION':                                   'bg-amber-50 border-amber-300 text-amber-700',
  'NOT ELIGIBLE':                                           'bg-red-50 border-red-300 text-red-700',
};

export default function EligibilityForm({ eligibility, onChange }) {
  const update = (key, value) => onChange({ ...eligibility, [key]: value });

  return (
    <div className="form-section">
      <h2 className="section-title">Section D — Eligibility Verification</h2>
      <div className="space-y-3 mb-6">
        {ELIGIBILITY_PARAMETERS.map(param => {
          const val = eligibility[param.id] || 'Yes';
          return (
            <div key={param.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
              <p className="text-sm text-slate-700 flex-1">{param.label}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {['Yes', 'No', 'NA'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update(param.id, opt)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                      val === opt
                        ? opt === 'Yes' ? 'bg-emerald-600 text-white border-emerald-600'
                        : opt === 'No'  ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-slate-400 text-white border-slate-400'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Status */}
      <div>
        <label className="label mb-3">Final Verification Status</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FINAL_STATUSES.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => update('finalStatus', status)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-semibold transition-all ${
                eligibility.finalStatus === status
                  ? STATUS_COLORS[status]
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                eligibility.finalStatus === status ? 'border-current bg-current opacity-70' : 'border-slate-300'
              }`} />
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
