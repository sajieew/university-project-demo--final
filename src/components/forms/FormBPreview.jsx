import { useMemo } from 'react';

const COLLEGE_NAME  = '1409 - KARPAGA VINAYAGA COLLEGE OF ENGINEERING AND TECHNOLOGY';
const COLLEGE_ADDR  = 'PALAYANOOR POST, MADURANTHAGAM TALUK, CHENGALPATTU DISTRICT – 603308';
const ACADEMIC_YEAR = '2025 - 2026 (FIRST YEAR)';

export default function FormBPreview({ students, filters = {}, printMode = false }) {
  const sorted = useMemo(() => {
    const filtered = students.filter(s =>
      (!filters.academicYear || s.academicYear === filters.academicYear) &&
      (!filters.branch       || s.branch === filters.branch) &&
      (!filters.quota        || s.category === filters.quota) &&
      (!filters.community    || s.community === filters.community)
    );
    return [...filtered].sort((a, b) => {
      const na = parseInt((a.applicationNo || '').replace(/\D/g, ''), 10) || 0;
      const nb = parseInt((b.applicationNo || '').replace(/\D/g, ''), 10) || 0;
      return na - nb;
    });
  }, [students, filters]);

  const thBase = 'px-1 py-2 text-center text-[9px] font-bold border border-slate-700 bg-[#0f2860] text-white leading-tight';
  const thSub  = 'px-1 py-1.5 text-center text-[8px] font-bold border border-slate-600 bg-[#1e3a8a] text-white';
  const td     = 'px-1 py-1 text-[9px] text-center border border-slate-200 whitespace-nowrap';

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="border-2 border-slate-700 p-3 mb-3 text-center space-y-0.5">
        <p className="text-sm font-bold text-[#0f2860]">{COLLEGE_NAME}</p>
        <p className="text-xs text-slate-600">{COLLEGE_ADDR}</p>
        <p className="text-sm font-bold text-slate-800 mt-1">FORM B — STUDENT ADMISSION DETAILS</p>
        <p className="text-xs text-slate-600">ACADEMIC YEAR: {ACADEMIC_YEAR}</p>
      </div>

      <p className="text-xs text-slate-500 mb-2">Total records: {sorted.length}</p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: '1100px' }}>
          <thead>
            {/* Level 1 */}
            <tr>
              <th className={thBase} rowSpan={2}>Sl.</th>
              <th className={thBase} rowSpan={2}>App. No.</th>
              <th className={thBase} rowSpan={2}>Reg. No.</th>
              <th className={thBase} rowSpan={2}>Quota</th>
              <th className={`${thBase} text-left px-2`} rowSpan={2}>Student Name</th>
              <th className={thBase} rowSpan={2}>Nationality</th>
              <th className={thBase} rowSpan={2}>Community</th>
              <th className={thBase} rowSpan={2}>Group</th>
              <th className={thBase} colSpan={2}>Maths</th>
              <th className={thBase} colSpan={2}>Physics</th>
              <th className={thBase} colSpan={2}>Chemistry</th>
              <th className={thBase} colSpan={2}>Total</th>
              <th className={thBase} rowSpan={2}>%</th>
              <th className={thBase} rowSpan={2}>FG</th>
              <th className={thBase} rowSpan={2}>AFW</th>
            </tr>
            {/* Level 2 */}
            <tr>
              <th className={thSub}>Obt</th><th className={thSub}>Max</th>
              <th className={thSub}>Obt</th><th className={thSub}>Max</th>
              <th className={thSub}>Obt</th><th className={thSub}>Max</th>
              <th className={thSub}>Obt</th><th className={thSub}>Max</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={20} className="py-8 text-center text-slate-400 text-xs">
                  No records match the selected filters.
                </td>
              </tr>
            )}
            {sorted.map((s, i) => {
              const mo = Number(s.mathsObt)   || 0;
              const mm = 100;
              const po = Number(s.physicsObt) || 0;
              const pm = 100;
              const co = Number(s.chemObt)    || 0;
              const cm = 100;
              const to = mo + po + co;
              const tm = 300;
              const pct = ((to / tm) * 100).toFixed(2);
              const natl = s.nationality === 'Other'
                ? (s.nationalityOther || 'Other')
                : (s.nationality || '—');

              return (
                <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className={td}>{i + 1}</td>
                  <td className={`${td} text-blue-700 font-mono`}>{s.applicationNo || '—'}</td>
                  <td className={`${td} font-mono`}>{s.registerNo || '—'}</td>
                  <td className={td}>{s.category || '—'}</td>
                  <td className={`${td} text-left px-2 font-medium max-w-[160px] truncate`}>{s.name}</td>
                  <td className={td}>{natl}</td>
                  <td className={td}>{s.community || '—'}</td>
                  <td className={td}>{s.group || '—'}</td>
                  <td className={td}>{mo}</td><td className={td}>{mm}</td>
                  <td className={td}>{po}</td><td className={td}>{pm}</td>
                  <td className={td}>{co}</td><td className={td}>{cm}</td>
                  <td className={`${td} font-semibold`}>{to}</td>
                  <td className={`${td} font-semibold`}>{tm}</td>
                  <td className={`${td} font-semibold`}>{pct}</td>
                  <td className={td}>{s.fg || '—'}</td>
                  <td className={td}>{s.afw || '—'}</td>
                </tr>
              );
            })}
            {/* Footer total */}
            {sorted.length > 0 && (
              <tr className="bg-[#0f2860] text-white font-bold">
                <td className="px-1 py-2 text-[9px] text-center border border-slate-700" colSpan={4}>
                  TOTAL: {sorted.length} STUDENTS
                </td>
                <td className="px-1 py-2 text-[9px] border border-slate-700" colSpan={16} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="flex justify-between mt-6 text-xs text-slate-600">
        <p>Prepared by: _________________________</p>
        <p>Principal</p>
      </div>
    </div>
  );
}
