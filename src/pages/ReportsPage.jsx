import { useState } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AdmissionFormsPage from './AdmissionFormsPage';
import { getAdmissionStatus, getOverallVerificationStatus, getOfficerWorkloads, getVerificationBreakdown } from '../utils/verification';
import { getStudentOfficerAssignment } from '../utils/localStorage';
import { VERIFICATION_STAGES } from '../utils/demoData';

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
  const { students, users } = useApp();
  const [filters, setFilters] = useState({
    academicYear: '',
    programme: '',
    verificationStatus: '',
    admissionStatus: '',
    assignedOfficer: '',
    stage: '',
  });
  const availableProgrammes = [...new Set(students.map(student => student.programme).filter(Boolean))].sort();
  const availableYears = [...new Set(students.map(student => student.academicYear).filter(Boolean))].sort();

  const filteredStudents = students.filter(student => {
    const assignment = getStudentOfficerAssignment(student.id);
    const officers = [
      assignment?.officerId,
      ...Object.values(assignment?.stageAssignments || {}),
    ].filter(Boolean);
    const assignedMatches = !filters.assignedOfficer ||
      (filters.assignedOfficer === 'Unassigned'
        ? officers.length === 0
        : officers.includes(filters.assignedOfficer));
    const stage = filters.stage
      ? getVerificationBreakdown(student.id).find(item => item.id === filters.stage)
      : null;
    return (!filters.academicYear || student.academicYear === filters.academicYear) &&
      (!filters.programme || student.programme === filters.programme) &&
      (!filters.verificationStatus || getOverallVerificationStatus(student.id) === filters.verificationStatus) &&
      (!filters.admissionStatus || getAdmissionStatus(student) === filters.admissionStatus) &&
      assignedMatches &&
      (!filters.stage || stage?.status !== 'Completed');
  });
  const total = filteredStudents.length;

  const progData = availableProgrammes.map(p => ({
    label: p,
    count: filteredStudents.filter(student => student.programme === p).length,
  }));

  const verificationCounts = filteredStudents.reduce((result, student) => {
    const status = getOverallVerificationStatus(student.id);
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});
  const verData = [
    { label: 'Not Verified', count: verificationCounts['Not Verified'] || 0, color: 'bg-slate-400' },
    { label: 'In Progress', count: verificationCounts['In Progress'] || 0, color: 'bg-blue-500' },
    { label: 'Action Required', count: verificationCounts['Action Required'] || 0, color: 'bg-red-500' },
    { label: 'Verified', count: verificationCounts.Verified || 0, color: 'bg-emerald-500' },
  ];

  const admData = [
    { label: 'Approved', count: filteredStudents.filter(student => getAdmissionStatus(student) === 'Approved').length },
    { label: 'Provisionally Approved', count: filteredStudents.filter(student => getAdmissionStatus(student) === 'Provisionally Approved').length },
    { label: 'Pending', count: filteredStudents.filter(student => getAdmissionStatus(student) === 'Pending').length },
    { label: 'Rejected', count: filteredStudents.filter(student => getAdmissionStatus(student) === 'Rejected').length },
  ];

  const yearData = [...new Set(filteredStudents.map(student => student.academicYear).filter(Boolean))]
    .map(year => ({
      label: year,
      count: filteredStudents.filter(student => student.academicYear === year).length,
    }));

  const categories = ['Merit', 'Management', 'NRI', 'Other'];
  const catData = categories.map(category => ({
    label: category,
    count: filteredStudents.filter(student => student.category === category).length,
  }));

  const officers = getOfficerWorkloads(filteredStudents);
  const stagePendingData = VERIFICATION_STAGES.map(stage => ({
    ...stage,
    count: filteredStudents.filter(student =>
      getVerificationBreakdown(student.id).find(item => item.id === String(stage.id))?.status === 'Pending'
    ).length,
  }));
  const rejectedDocuments = filteredStudents.flatMap(student =>
    getVerificationBreakdown(student.id).flatMap(stage =>
      stage.items.filter(item => item.mandatory && item.status === 'Rejected').map(item => ({
        student,
        stage,
        item,
      }))
    )
  );
  const exportCSV = () => {
    const rows = [
      ['Report', 'Category', 'Count', 'Student', 'Stage', 'Document', 'Officer', 'Status'],
      ...progData.map(d => ['Programme', d.label, d.count]),
      ...verData.map(d => ['Verification Status', d.label, d.count]),
      ...admData.map(d => ['Admission Status', d.label, d.count]),
      ...yearData.map(d => ['Academic Year', d.label, d.count]),
      ...officers.map(officer => ['Officer Performance', officer.name, officer.completedTasks, '', '', '', '', `${officer.completionPercentage}%`]),
      ...stagePendingData.map(stage => ['Stage-wise Pending', stage.name, stage.count, '', stage.id, '', '', 'Pending']),
      ...rejectedDocuments.map(({ student, stage, item }) => ['Rejected Documents', '', '', student.name, stage.id, item.label, '', item.status]),
      ['', 'Total Students', total],
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'admission_report.csv';
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

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Report Filters</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label className="label">Academic Year
            <select className="input-field mt-1 py-1.5 text-xs" value={filters.academicYear} onChange={event => setFilters({ ...filters, academicYear: event.target.value })}>
              <option value="">All years</option>{availableYears.map(year => <option key={year}>{year}</option>)}
            </select>
          </label>
          <label className="label">Programme
            <select className="input-field mt-1 py-1.5 text-xs" value={filters.programme} onChange={event => setFilters({ ...filters, programme: event.target.value })}>
              <option value="">All programmes</option>{availableProgrammes.map(programme => <option key={programme}>{programme}</option>)}
            </select>
          </label>
          <label className="label">Verification Status
            <select className="input-field mt-1 py-1.5 text-xs" value={filters.verificationStatus} onChange={event => setFilters({ ...filters, verificationStatus: event.target.value })}>
              <option value="">All statuses</option>{['Not Verified', 'In Progress', 'Action Required', 'Verified'].map(status => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="label">Admission Status
            <select className="input-field mt-1 py-1.5 text-xs" value={filters.admissionStatus} onChange={event => setFilters({ ...filters, admissionStatus: event.target.value })}>
              <option value="">All statuses</option>{['Pending', 'Approved', 'Provisionally Approved', 'Rejected'].map(status => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="label">Assigned Officer
            <select className="input-field mt-1 py-1.5 text-xs" value={filters.assignedOfficer} onChange={event => setFilters({ ...filters, assignedOfficer: event.target.value })}>
              <option value="">All officers</option><option value="Unassigned">Unassigned</option>
              {users.filter(candidate => candidate.role === 'Faculty').map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
            </select>
          </label>
          <label className="label">Verification Stage
            <select className="input-field mt-1 py-1.5 text-xs" value={filters.stage} onChange={event => setFilters({ ...filters, stage: event.target.value })}>
              <option value="">All stages</option>{VERIFICATION_STAGES.map(stage => <option key={stage.id} value={String(stage.id)}>Stage {stage.id}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-400">{total} matching student records</p>
      </section>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications',   value: total,                                         color: 'text-blue-700',    border: 'border-blue-100',    bg: 'bg-blue-50' },
          { label: 'Verified',             value: verData.find(d => d.label === 'Verified').count, color: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50' },
          { label: 'Approved',             value: admData[0].count,                              color: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50' },
          { label: 'Not Verified',         value: verData.find(d => d.label === 'Not Verified').count, color: 'text-slate-700', border: 'border-slate-200', bg: 'bg-slate-50' },
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <section className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Officer Performance Report</h3>
            <div className="space-y-3">
              {officers.map(officer => (
                <div key={officer.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{officer.name}</span>
                    <span className="text-slate-500">{officer.assignedStudents} students · {officer.completedTasks}/{officer.totalTasks} tasks · {officer.rejectedDocuments} rejected</span>
                  </div>
                  <BarRow label="Task completion" count={officer.completedTasks} total={officer.totalTasks || 1} color="bg-blue-500" />
                </div>
              ))}
              {officers.length === 0 && <p className="text-sm text-slate-400">No officer assignments recorded.</p>}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Stage-wise Pending Verification Report</h3>
            <div className="space-y-3">
              {stagePendingData.map((stage, index) => (
                <BarRow key={stage.id} label={`Stage ${stage.id} · ${stage.name}`} count={stage.count} total={total || 1} color={COLORS[index % COLORS.length]} />
              ))}
            </div>
          </section>
        </div>

        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-700">Rejected Documents Report</h3>
            <p className="mt-1 text-xs text-slate-400">{rejectedDocuments.length} mandatory document rejections</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead><tr className="border-b border-slate-100">
                <th className="table-header">Student</th><th className="table-header">Stage</th><th className="table-header">Document</th><th className="table-header">Assigned Officer</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rejectedDocuments.map(({ student, stage, item }, index) => {
                  const assignment = getStudentOfficerAssignment(student.id);
                  const officerId = assignment?.stageAssignments?.[stage.id] || assignment?.officerId;
                  return (
                    <tr key={`${student.id}-${stage.id}-${item.id}-${index}`}>
                      <td className="table-cell">{student.name}</td>
                      <td className="table-cell">Stage {stage.id}</td>
                      <td className="table-cell">{item.label}</td>
                      <td className="table-cell">{users.find(candidate => candidate.id === officerId)?.name || 'Unassigned'}</td>
                    </tr>
                  );
                })}
                {rejectedDocuments.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-sm text-slate-400">No rejected mandatory documents.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Verification Status */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-700">Overall Verification Report</h3>
          </div>
          <div className="space-y-4 mb-6">
            {verData.map(d => (
              <BarRow key={d.label} label={d.label} count={d.count} total={total || 1} color={d.color} />
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
