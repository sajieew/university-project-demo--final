import { Link } from 'react-router-dom';
import { Check, Clock, Minus } from 'lucide-react';
import { VERIFICATION_STAGES } from '../../utils/demoData';

const STATUS_OPTIONS = ['Pending', 'Completed', 'NA'];

const STATUS_STYLES = {
  Completed: { dot: 'bg-emerald-500 border-emerald-500', text: 'text-emerald-700', icon: <Check size={12} className="text-white" /> },
  Pending:   { dot: 'bg-amber-400 border-amber-400',  text: 'text-amber-700',  icon: <Clock size={12} className="text-white" /> },
  NA:        { dot: 'bg-slate-300 border-slate-300',  text: 'text-slate-500',  icon: <Minus size={12} className="text-white" /> },
};

export default function VerificationStepper({ stages, onChange, recordId, isEdit }) {
  const update = (id, field, value) => {
    onChange({ ...stages, [id]: { ...(stages[id] || {}), [field]: value } });
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Section C — Verification Process</h2>
      <div className="space-y-4">
        {VERIFICATION_STAGES.map(stage => {
          const s = stages[stage.id] || { status: 'Pending', verifiedBy: '', date: '', remarks: '' };
          const st = STATUS_STYLES[s.status] || STATUS_STYLES.Pending;

          return (
            <div key={stage.id} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Stage header */}
              <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 ${st.dot} flex items-center justify-center`}>
                  {st.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {stage.id === 1 ? (
                      <Link
                        to="/verification/stage-1"
                        className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        Stage {stage.id} — {stage.name}
                      </Link>
                    ) : stage.id === 2 ? (
                      <Link
                        to={`/verification/stage-2/${recordId}`}
                        state={{
                          returnTo: isEdit ? `/students/${recordId}/edit` : '/students/new',
                          recordId,
                          openSection: 2,
                        }}
                        className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        Stage {stage.id} — {stage.name}
                      </Link>
                    ) : (
                      <Link
                        to={`/verification/stage-${stage.id}/${recordId}`}
                        state={{
                          returnTo: isEdit ? `/students/${recordId}/edit` : '/students/new',
                          recordId,
                          openSection: 2,
                        }}
                        className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        Stage {stage.id} — {stage.name}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update(stage.id, 'status', opt)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                        s.status === opt
                          ? opt === 'Completed' ? 'bg-emerald-600 text-white border-emerald-600'
                          : opt === 'NA'        ? 'bg-slate-400 text-white border-slate-400'
                                                : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
                <div>
                  <label className="label">Verified By</label>
                  <input
                    type="text"
                    value={s.verifiedBy || ''}
                    onChange={e => update(stage.id, 'verifiedBy', e.target.value)}
                    placeholder="Officer name"
                    className="input-field text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="label">Verification Date</label>
                  <input
                    type="date"
                    value={s.date || ''}
                    onChange={e => update(stage.id, 'date', e.target.value)}
                    className="input-field text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="label">Remarks</label>
                  <input
                    type="text"
                    value={s.remarks || ''}
                    onChange={e => update(stage.id, 'remarks', e.target.value)}
                    placeholder="Remarks"
                    className="input-field text-xs py-1.5"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
