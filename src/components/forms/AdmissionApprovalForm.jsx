import SignatureUpload from './SignatureUpload';

const ADMISSION_STATUSES = ['Approved', 'Provisionally Approved', 'Pending', 'Rejected'];

const STATUS_STYLES = {
  'Approved':               'border-emerald-400 bg-emerald-50',
  'Provisionally Approved': 'border-blue-400 bg-blue-50',
  'Pending':                'border-amber-400 bg-amber-50',
  'Rejected':               'border-red-400 bg-red-50',
};

export default function AdmissionApprovalForm({ approval, onChange, applicationId }) {
  const update = (field, value) => onChange({ ...approval, [field]: value });

  return (
    <div className="form-section">
      <h2 className="section-title">Section G — Admission Approval</h2>

      <div className="mb-5">
        <label className="label mb-2">Admission Status</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ADMISSION_STATUSES.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => update('status', status)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                approval.status === status
                  ? STATUS_STYLES[status]
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {approval.status === status && <span className="w-2 h-2 rounded-full bg-current" />}
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Remarks</label>
          <textarea
            rows={2}
            value={approval.remarks || ''}
            onChange={e => update('remarks', e.target.value)}
            placeholder="Admission remarks..."
            className="input-field resize-none"
          />
        </div>
        <div>
          <label className="label">Admission Officer / Authorized Signatory</label>
          <input
            type="text"
            value={approval.officer || ''}
            onChange={e => update('officer', e.target.value)}
            placeholder="Officer name"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={approval.date || ''}
            onChange={e => update('date', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <SignatureUpload
            applicationId={applicationId}
            section="approval"
            signature={approval.signature}
            onChange={value => update('signature', value)}
          />
        </div>
        <div>
          <label className="label">Institution Seal</label>
          <div className="input-field text-sm text-slate-400 italic py-3 text-center">
            [ Institution Seal — Placeholder ]
          </div>
        </div>
      </div>
    </div>
  );
}
