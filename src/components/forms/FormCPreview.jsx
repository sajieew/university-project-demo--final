import { useMemo } from 'react';
import { BRANCH_CONFIG, COMMUNITIES } from '../../utils/demoData';

const COLLEGE_NAME  = '1409 - KARPAGA VINAYAGA COLLEGE OF ENGINEERING AND TECHNOLOGY';
const COLLEGE_ADDR  = 'PALAYANOOR POST, MADURANTHAGAM TALUK, CHENGALPATTU DISTRICT – 603308';
const ACADEMIC_YEAR = '2025 - 2026 (FIRST YEAR)';

export default function FormCPreview({ students, filters = {}, printMode = false }) {
  const branches = useMemo(() =>
    BRANCH_CONFIG.filter(b => !filters.branch || b.name === filters.branch),
    [filters.branch]
  );

  const filteredStudents = useMemo(() =>
    students.filter(s =>
      (!filters.academicYear || s.academicYear === filters.academicYear) &&
      (!filters.branch       || s.branch === filters.branch)
    ),
    [students, filters]
  );

  const rows = useMemo(() => branches.map(b => {
    const bs = filteredStudents.filter(s => s.branch === b.name);
    const commData = {};
    COMMUNITIES.forEach(c => {
      commData[c] = {
        boys:  bs.filter(s => s.community === c && s.gender === 'Male').length,
        girls: bs.filter(s => s.community === c && (s.gender === 'Female' || s.gender === 'Transgender')).length,
      };
    });
    const totalBoys  = COMMUNITIES.reduce((a, c) => a + commData[c].boys,  0);
    const totalGirls = COMMUNITIES.reduce((a, c) => a + commData[c].girls, 0);
    return { ...b, commData, totalBoys, totalGirls };
  }), [branches, filteredStudents]);

  const grandBoys  = rows.reduce((a, r) => a + r.totalBoys,  0);
  const grandGirls = rows.reduce((a, r) => a + r.totalGirls, 0);
  const grandCommBoys  = Object.fromEntries(COMMUNITIES.map(c => [c, rows.reduce((a, r) => a + r.commData[c].boys,  0)]));
  const grandCommGirls = Object.fromEntries(COMMUNITIES.map(c => [c, rows.reduce((a, r) => a + r.commData[c].girls, 0)]));

  const th1 = 'px-1 py-2 text-center text-[9px] font-bold border border-slate-700 bg-[#0f2860] text-white leading-tight';
  const th2 = 'px-1 py-1.5 text-center text-[8px] font-bold border border-slate-600 bg-[#1e3a8a] text-white';
  const td  = 'px-1 py-1 text-[9px] text-center border border-slate-200';

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="border-2 border-slate-700 p-3 mb-3 text-center space-y-0.5">
        <p className="text-sm font-bold text-[#0f2860]">{COLLEGE_NAME}</p>
        <p className="text-xs text-slate-600">{COLLEGE_ADDR}</p>
        <p className="text-sm font-bold text-slate-800 mt-1">FORM C — COMMUNITY-WISE ADMISSION SUMMARY (BRANCH-WISE)</p>
        <p className="text-xs text-slate-600">ACADEMIC YEAR: {ACADEMIC_YEAR}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: '900px' }}>
          <thead>
            {/* Level 1 */}
            <tr>
              <th className={th1} rowSpan={2}>Sl.</th>
              <th className={th1} rowSpan={2}>Branch Code</th>
              <th className={th1} rowSpan={2}>SAN</th>
              {COMMUNITIES.map(c => (
                <th key={c} className={th1} colSpan={2}>{c}</th>
              ))}
              <th className={th1} colSpan={2}>TOTAL</th>
            </tr>
            {/* Level 2 */}
            <tr>
              {COMMUNITIES.map(c => (
                <>
                  <th key={`${c}-b`} className={th2}>Boys</th>
                  <th key={`${c}-g`} className={th2}>Girls</th>
                </>
              ))}
              <th className={th2}>Boys</th>
              <th className={th2}>Girls</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.code} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className={td}>{i + 1}</td>
                <td className={`${td} font-semibold`}>{r.code}</td>
                <td className={td}>{r.san}</td>
                {COMMUNITIES.map(c => (
                  <>
                    <td key={`${c}-b`} className={td}>{r.commData[c].boys  || 0}</td>
                    <td key={`${c}-g`} className={td}>{r.commData[c].girls || 0}</td>
                  </>
                ))}
                <td className={`${td} font-semibold text-blue-700`}>{r.totalBoys}</td>
                <td className={`${td} font-semibold text-pink-600`}>{r.totalGirls}</td>
              </tr>
            ))}
            {/* Grand total */}
            <tr className="bg-[#0f2860] text-white font-bold">
              <td className="px-1 py-2 text-[9px] text-center border border-slate-700" colSpan={3}>TOTAL</td>
              {COMMUNITIES.map(c => (
                <>
                  <td key={`tot-${c}-b`} className="px-1 py-2 text-[9px] text-center border border-slate-700">{grandCommBoys[c]}</td>
                  <td key={`tot-${c}-g`} className="px-1 py-2 text-[9px] text-center border border-slate-700">{grandCommGirls[c]}</td>
                </>
              ))}
              <td className="px-1 py-2 text-[9px] text-center border border-slate-700">{grandBoys}</td>
              <td className="px-1 py-2 text-[9px] text-center border border-slate-700">{grandGirls}</td>
            </tr>
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
