import { useMemo } from 'react';
import { BRANCH_CONFIG } from '../../utils/demoData';

const COLLEGE_NAME  = '1409 - KARPAGA VINAYAGA COLLEGE OF ENGINEERING AND TECHNOLOGY';
const COLLEGE_ADDR  = 'PALAYANOOR POST, MADURANTHAGAM TALUK, CHENGALPATTU DISTRICT – 603308';
const ACADEMIC_YEAR = '2025 - 2026 (FIRST YEAR)';

export default function FormAPreview({ students, filters = {}, printMode = false }) {
  const branches = useMemo(() =>
    BRANCH_CONFIG.filter(b => !filters.branch || b.name === filters.branch),
    [filters.branch]
  );

  const filteredStudents = useMemo(() =>
    students.filter(s => !filters.academicYear || s.academicYear === filters.academicYear),
    [students, filters.academicYear]
  );

  const rows = useMemo(() => branches.map(b => {
    const admitted = filteredStudents.filter(
      s => s.branch === b.name && s.category === 'Management'
    ).length;
    return { ...b, admitted, balance: b.san - admitted };
  }), [branches, filteredStudents]);

  const totalSan      = rows.reduce((a, r) => a + r.san, 0);
  const totalAdmitted = rows.reduce((a, r) => a + r.admitted, 0);
  const totalBalance  = rows.reduce((a, r) => a + r.balance, 0);

  const th = 'px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide border border-slate-700 bg-[#0f2860] text-white';
  const td = 'px-2 py-1.5 text-xs text-center border border-slate-300';

  return (
    <div className={`font-sans ${printMode ? 'text-[11px]' : 'text-xs'}`}>
      {/* Header */}
      <div className="border-2 border-slate-700 p-3 mb-3 text-center space-y-1">
        <p className="text-sm font-bold text-[#0f2860]">{COLLEGE_NAME}</p>
        <p className="text-xs text-slate-600">{COLLEGE_ADDR}</p>
        <p className="text-sm font-bold text-slate-800 mt-1">FORM A — BRANCH / MANAGEMENT QUOTA ADMISSION SUMMARY</p>
        <p className="text-xs text-slate-600">ACADEMIC YEAR: {ACADEMIC_YEAR}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className={th}>Sl. No.</th>
              <th className={th}>Branch Code</th>
              <th className={`${th} text-left`}>Branch Name</th>
              <th className={th}>SAN</th>
              <th className={th}>Mgt. Quota Approved</th>
              <th className={th}>Mgt. Quota Admitted</th>
              <th className={th}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.code} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className={td}>{i + 1}</td>
                <td className={`${td} font-semibold`}>{r.code}</td>
                <td className={`${td} text-left px-3`}>{r.name}</td>
                <td className={td}>{r.san}</td>
                <td className={td}>{r.san}</td>
                <td className={td}>{r.admitted}</td>
                <td className={`${td} font-semibold ${r.balance < 0 ? 'text-red-600' : r.balance === 0 ? 'text-slate-500' : 'text-green-700'}`}>
                  {r.balance}
                </td>
              </tr>
            ))}
            {/* Totals */}
            <tr className="bg-[#0f2860] text-white font-bold">
              <td className="px-2 py-2 text-center border border-slate-700 text-xs" colSpan={3}>TOTAL</td>
              <td className="px-2 py-2 text-center border border-slate-700 text-xs">{totalSan}</td>
              <td className="px-2 py-2 text-center border border-slate-700 text-xs">{totalSan}</td>
              <td className="px-2 py-2 text-center border border-slate-700 text-xs">{totalAdmitted}</td>
              <td className="px-2 py-2 text-center border border-slate-700 text-xs">{totalBalance}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature row */}
      <div className="flex justify-between mt-6 text-xs text-slate-600">
        <p>Prepared by: _________________________</p>
        <p>Principal</p>
      </div>
    </div>
  );
}
