export default function DeclarationSection({ declaration, onChange }) {
  const update = (field, value) => onChange({ ...declaration, [field]: value });

  return (
    <div className="form-section">
      <h2 className="section-title">Section E — Student Declaration</h2>
      <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
        <p className="text-sm text-slate-600 leading-relaxed italic">
          I hereby declare that all the information furnished above is true and correct to the best of my
          knowledge and belief. I understand that suppression of any fact or submission of false /
          fabricated documents or misrepresentation of facts will result in cancellation of my admission
          without any notice and I shall be liable for further action as per the rules and regulations of
          the institution and the affiliating university.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Student Name</label>
          <input
            type="text"
            value={declaration.name || ''}
            onChange={e => update('name', e.target.value)}
            placeholder="Full name"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={declaration.date || ''}
            onChange={e => update('date', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Signature (Text Placeholder)</label>
          <input
            type="text"
            value={declaration.signature || ''}
            onChange={e => update('signature', e.target.value)}
            placeholder="Type signature / initials"
            className="input-field font-serif italic"
          />
        </div>
      </div>
    </div>
  );
}
