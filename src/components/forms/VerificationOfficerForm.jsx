export default function VerificationOfficerForm({ officer, onChange }) {
  const update = (field, value) => onChange({ ...officer, [field]: value });

  return (
    <div className="form-section">
      <h2 className="section-title">Section F — Verification Officer</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Name of Verification Officer</label>
          <input
            type="text"
            value={officer.name || ''}
            onChange={e => update('name', e.target.value)}
            placeholder="Full name"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Designation</label>
          <input
            type="text"
            value={officer.designation || ''}
            onChange={e => update('designation', e.target.value)}
            placeholder="e.g. Assistant Professor"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Signature (Text Placeholder)</label>
          <input
            type="text"
            value={officer.signature || ''}
            onChange={e => update('signature', e.target.value)}
            placeholder="Type signature / initials"
            className="input-field font-serif italic"
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={officer.date || ''}
            onChange={e => update('date', e.target.value)}
            className="input-field"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Institution Seal</label>
          <div className="input-field text-sm text-slate-400 italic py-3 text-center">
            [ Institution Seal — Placeholder ]
          </div>
        </div>
      </div>
    </div>
  );
}
