import { UG_CERTIFICATES, PG_CERTIFICATES } from '../../utils/demoData';

const isUG = (p) => ['B.E.', 'B.Tech.'].includes(p);

export default function CertificateChecklist({ programme, certificates, onChange }) {
  const list = isUG(programme) ? UG_CERTIFICATES : PG_CERTIFICATES;

  const update = (id, field, value) => {
    onChange({ ...certificates, [id]: { ...(certificates[id] || {}), [field]: value } });
  };

  if (!programme) {
    return (
      <div className="form-section">
        <h2 className="section-title">Section B — Certificate Verification Checklist</h2>
        <p className="text-sm text-slate-400 italic">Please select a Programme in Section A to load the certificate checklist.</p>
      </div>
    );
  }

  return (
    <div className="form-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">Section B — Certificate Verification Checklist</h2>
        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
          {isUG(programme) ? 'UG' : 'PG'} — {programme}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="table-header w-8">#</th>
              <th className="table-header">Certificate / Document</th>
              <th className="table-header text-center w-28">Original Produced</th>
              <th className="table-header text-center w-32">Photocopy Submitted</th>
              <th className="table-header text-center w-20">Verified</th>
              <th className="table-header w-40">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {list.map((cert, idx) => {
              const row = certificates[cert.id] || {};
              return (
                <tr key={cert.id} className={`transition-colors hover:bg-slate-50 ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                  <td className="table-cell text-xs text-slate-400 font-mono">{idx + 1}</td>
                  <td className="table-cell text-sm text-slate-700">{cert.name}</td>
                  <td className="table-cell text-center">
                    <input
                      type="checkbox"
                      checked={!!row.originalProduced}
                      onChange={e => update(cert.id, 'originalProduced', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-700 cursor-pointer"
                    />
                  </td>
                  <td className="table-cell text-center">
                    <input
                      type="checkbox"
                      checked={!!row.photocopySubmitted}
                      onChange={e => update(cert.id, 'photocopySubmitted', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-700 cursor-pointer"
                    />
                  </td>
                  <td className="table-cell text-center">
                    <input
                      type="checkbox"
                      checked={!!row.verified}
                      onChange={e => update(cert.id, 'verified', e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    />
                  </td>
                  <td className="table-cell">
                    <input
                      type="text"
                      value={row.remarks || ''}
                      onChange={e => update(cert.id, 'remarks', e.target.value)}
                      placeholder="Remarks..."
                      className="input-field text-xs py-1"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
