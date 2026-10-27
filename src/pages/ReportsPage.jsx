import { useState, useMemo } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AdmissionFormsPage from './AdmissionFormsPage';

const PROGRAMMES = ['B.E.', 'B.Tech.', 'M.E.', 'M.Tech.', 'MCA', 'MBA'];
const COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];

function BarRow({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-44 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{count}</span>
      <span className="text-[10px] text-slate-400 w-9 text-right">{pct}%</span>
    </div>
  );
}

export default function ReportsPage() {
  const { students } = useApp();
  const { isAdmin } = useAuth();
  const total = students.length;

  const progData = useMemo(() =>
    PROGRAMMES.map(p => ({ label: p, count: students.filter(s => s.programme === p).length })),
    [students]);

  const verData = useMemo(() => [
    { label: 'Verified', count: students.filter(s => s.verificationStatus === 'Verified').length },
    { label: 'Pending',  count: students.filter(s => s.verificationStatus === 'Pending').length },
  ], [students]);

  const admData = useMemo(() => [
    { label: 'Approved',               count: students.filter(s => s.admissionStatus === 'Approved').length },
    { label: 'Provisionally Approved', count: students.filter(s => s.admissionStatus === 'Provisionally Approved').length },
    { label: 'Pending',                count: students.filter(s => s.admissionStatus === 'Pending').length },
    { label: 'Rejected',               count: students.filter(s => s.admissionStatus === 'Rejected').length },
  ], [students]);

  const yearData = useMemo(() => {
    const years = [...new Set(students.map(s => s.academicYear).filter(Boolean))];
    return years.map(y => ({ label: y, count: students.filter(s => s.academicYear === y).length }));
  }, [students]);

  const catData = useMemo(() => {
    const cats = ['Merit', 'Management', 'NRI', 'Other'];
    return cats.map(c => ({ label: c, count: students.filter(s => s.category === c).length }));
  }, [students]);

  const exportCSV = () => {
    const rows = [
      ['Report', 'Category', 'Count'],
      ...progData.map(d => ['Programme', d.label, d.count]),
      ...verData.map(d => ['Verification Status', d.label, d.count]),
      ...admData.map(d => ['Admission Status', d.label, d.count]),
      ...yearData.map(d => ['Academic Year', d.label, d.count]),
      ['', 'Total Students', total],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `admission_report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-400">Total: {total} student records</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={exportCSV} className="btn-secondary btn-sm">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-secondary btn-sm">
            <Printer size={13} /> Print Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications',   value: total,                                         color: 'text-blue-700',    border: 'border-blue-100',    bg: 'bg-blue-50' },
          { label: 'Verified',             value: verData[0].count,                              color: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50' },
          { label: 'Approved',             value: admData[0].count,                              color: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50' },
          { label: 'Pending Verification', value: verData[1].count,                              color: 'text-amber-700',   border: 'border-amber-100',   bg: 'bg-amber-50' },
        ].map(c => (
          <div key={c.label} className={`card p-5 ${c.bg} border ${c.border}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color} mt-1`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programme-wise */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-blue-700" />
            <h3 className="text-sm font-semibold text-slate-700">Programme-wise Students</h3>
          </div>
          <div className="space-y-3">
            {progData.map((d, i) => (
              <BarRow key={d.label} label={d.label} count={d.count} total={total || 1} color={COLORS[i % COLORS.length]} />
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-700">Verification Status</h3>
          </div>
          <div className="space-y-4 mb-6">
            {verData.map((d, i) => (
              <BarRow key={d.label} label={d.label} count={d.count} total={total || 1} color={i === 0 ? 'bg-emerald-500' : 'bg-amber-400'} />
            ))}
          </div>
          <hr className="my-4 border-slate-100" />
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-700">Admission Category</h3>
          </div>
          <div className="space-y-3">
            {catData.map((d, i) => (
              <BarRow key={d.label} label={d.label} count={d.count} total={total || 1} color={COLORS[i % COLORS.length]} />
            ))}
          </div>
        </div>

        {/* Admission Status */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-700">Admission Status</h3>
          </div>
          <div className="space-y-3">
            {admData.map((d, i) => (
              <BarRow key={d.label} label={d.label} count={d.count} total={total || 1} color={COLORS[i % COLORS.length]} />
            ))}
          </div>
        </div>

        {/* Academic Year */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-700">Academic Year-wise Count</h3>
          </div>
          <div className="space-y-3">
            {yearData.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
            {yearData.map((d, i) => (
              <BarRow key={d.label} label={d.label} count={d.count} total={total || 1} color={COLORS[i % COLORS.length]} />
            ))}
          </div>
        </div>
      </div>

      <AdmissionFormsPage />
    </div>
  );
}
