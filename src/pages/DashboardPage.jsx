import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle, Clock, XCircle, FileText,
  UserPlus, BarChart3, ArrowRight, TrendingUp, GitBranch
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate } from '../utils/validation';
import { getVerificationAssignments, VERIFICATION_UPDATED_EVENT } from '../utils/localStorage';
import { getAdmissionStatus, getOverallVerificationStatus } from '../utils/verification';

export default function DashboardPage() {
  const { students, loadStudents } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setStatusRevision] = useState(0);

  useEffect(() => {
    const refreshStatuses = () => {
      loadStudents();
      setStatusRevision(revision => revision + 1);
    };
    window.addEventListener(VERIFICATION_UPDATED_EVENT, refreshStatuses);
    window.addEventListener('storage', refreshStatuses);
    return () => {
      window.removeEventListener(VERIFICATION_UPDATED_EVENT, refreshStatuses);
      window.removeEventListener('storage', refreshStatuses);
    };
  }, [loadStudents]);

  const total     = students.length;
  const verificationStatuses = students.map(student => getOverallVerificationStatus(student.id));
  const verified  = verificationStatuses.filter(status => status === 'Verified').length;
  const notVerified = verificationStatuses.filter(status => status === 'Not Verified').length;
  const inProgress = verificationStatuses.filter(status => status === 'In Progress').length;
  const actionRequired = verificationStatuses.filter(status => status === 'Action Required').length;
  const admissionStatuses = students.map(getAdmissionStatus);
  const approved  = admissionStatuses.filter(status => status === 'Approved').length;
  const provAppr  = admissionStatuses.filter(status => status === 'Provisionally Approved').length;
  const rejected  = admissionStatuses.filter(status => status === 'Rejected').length;
  const pendingAdmissions = admissionStatuses.filter(status => status === 'Pending').length;
  const assignments = getVerificationAssignments();
  const assignedStudentIds = new Set(assignments
    .filter(assignment => assignment.officerId || Object.values(assignment.stageAssignments || {}).some(Boolean))
    .map(assignment => assignment.studentId));
  const unassigned = students.filter(student => !assignedStudentIds.has(student.id)).length;
  const recent = [...students].slice(0, 5);

  const programmeData = [...new Set(students.map(student => student.programme).filter(Boolean))]
    .map(programme => {
      const programmeStudents = students.filter(student => student.programme === programme);
      return {
        programme,
        count: programmeStudents.length,
        approved: programmeStudents.filter(student => getAdmissionStatus(student) === 'Approved').length,
        provisional: programmeStudents.filter(student => getAdmissionStatus(student) === 'Provisionally Approved').length,
        pending: programmeStudents.filter(student => getAdmissionStatus(student) === 'Pending').length,
        rejected: programmeStudents.filter(student => getAdmissionStatus(student) === 'Rejected').length,
        verified: programmeStudents.filter(student => getOverallVerificationStatus(student.id) === 'Verified').length,
      };
    })
    .sort((a, b) => b.count - a.count || a.programme.localeCompare(b.programme));
  const mostEnrolledProgramme = programmeData[0];
  const recentEnrolments = [...students]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);
  const recentAdmissionDecisions = students
    .filter(student => getAdmissionStatus(student) !== 'Pending')
    .sort((a, b) =>
      new Date(b.approval?.date || b.updatedAt || b.createdAt || 0) -
      new Date(a.approval?.date || a.updatedAt || a.createdAt || 0)
    )
    .slice(0, 4);
  const approvalRate = total ? Math.round((approved / total) * 100) : 0;
  const administrativeAttention = students.filter(student =>
    ['Pending', 'Rejected'].includes(getAdmissionStatus(student)) ||
    getOverallVerificationStatus(student.id) === 'Action Required'
  ).length;

  // Admission status breakdown
  const admissionSummary = [
    { label: 'Approved',               count: approved,  color: 'bg-emerald-500' },
    { label: 'Provisionally Approved', count: provAppr,  color: 'bg-blue-500' },
    { label: 'Pending',                count: admissionStatuses.filter(status => status === 'Pending').length, color: 'bg-amber-400' },
    { label: 'Rejected',               count: rejected,  color: 'bg-red-500' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Welcome back, <span className="text-blue-700 font-semibold">{user?.name}</span> — Academic Year 2024-25
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/students/new')}>
          <UserPlus size={15} /> New Admission
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />}       label="Total Applications" value={total}    color="blue"    onClick={() => navigate('/students')} />
        <StatCard icon={<CheckCircle size={20} />} label="Verified"           value={verified} color="emerald" onClick={() => navigate('/students?verificationStatus=Verified')} />
        <StatCard icon={<Clock size={20} />}       label="Not Verified"       value={notVerified} color="red" onClick={() => navigate('/students?verificationStatus=Not+Verified')} />
        <StatCard icon={<Clock size={20} />}       label="In Progress"        value={inProgress} color="blue" onClick={() => navigate('/students?verificationStatus=In+Progress')} />
        <StatCard icon={<XCircle size={20} />}     label="Action Required"    value={actionRequired} color="red" onClick={() => navigate('/students?verificationStatus=Action+Required')} />
        <StatCard icon={<FileText size={20} />}    label="Approved"           value={approved} color="emerald" onClick={() => navigate('/students?admissionStatus=Approved')} />
        <StatCard icon={<TrendingUp size={20} />}  label="Provisional"        value={provAppr} color="violet"  onClick={() => navigate('/students?admissionStatus=Provisionally+Approved')} />
        <StatCard icon={<XCircle size={20} />}     label="Rejected"           value={rejected} color="red"     onClick={() => navigate('/students?admissionStatus=Rejected')} />
        <StatCard icon={<Clock size={20} />}       label="Pending Admissions" value={pendingAdmissions} color="amber" onClick={() => navigate('/students?admissionStatus=Pending')} />
        {user?.role === 'Admin' && <StatCard icon={<Users size={20} />} label="Unassigned Students" value={unassigned} color="slate" onClick={() => navigate('/students?assignedOfficer=Unassigned')} />}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'New Student Admission', icon: <UserPlus size={15} />, path: '/students/new', color: 'text-blue-700 bg-blue-50' },
              { label: 'View All Records',       icon: <Users size={15} />,    path: '/students',     color: 'text-slate-700 bg-slate-50' },
              { label: 'Pending Verification',   icon: <Clock size={15} />,    path: '/verify',       color: 'text-amber-700 bg-amber-50' },
              { label: 'Generate Reports',       icon: <BarChart3 size={15} />, path: '/reports',     color: 'text-emerald-700 bg-emerald-50' },
              { label: 'View Flowchart',          icon: <GitBranch size={15} />, path: '/flowchart',        color: 'text-violet-700 bg-violet-50' },
              { label: 'Admission Forms',         icon: <FileText size={15} />,  path: '/admission-forms',  color: 'text-teal-700 bg-teal-50' },
            ].filter(action =>
              user?.role !== 'Faculty' || !['/reports', '/flowchart'].includes(action.path)
            ).map(action => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${action.color} hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center gap-2">
                  {action.icon}
                  {action.label}
                </div>
                <ArrowRight size={13} />
              </button>
            ))}
          </div>
        </div>

        {/* Programme-wise — improved donut chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Programme-wise Students</h3>
          <p className="text-xs text-slate-400 mb-4">{total} total enrolments</p>

          {total === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No data yet</p>
          ) : (
            <div className="flex items-center gap-4">
              {/* Donut SVG */}
              <div className="flex-shrink-0">
                {(() => {
                  const PROG_COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
                  const r = 38, cx = 46, cy = 46, stroke = 13;
                  const circ = 2 * Math.PI * r;
                  let offset = 0;
                  const slices = programmeData.map((item, i) => {
                    const pct = item.count / (total || 1);
                    const dash = pct * circ;
                    const s = { count: item.count, color: PROG_COLORS[i % PROG_COLORS.length], dash, offset };
                    offset += dash;
                    return s;
                  });
                  return (
                    <svg width="92" height="92" viewBox="0 0 92 92">
                      {/* background ring */}
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                      {slices.map((s, i) => s.count > 0 && (
                        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                          stroke={s.color} strokeWidth={stroke}
                          strokeDasharray={`${s.dash} ${circ - s.dash}`}
                          strokeDashoffset={-s.offset + circ * 0.25}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
                        />
                      ))}
                      {/* centre label */}
                      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">{total}</text>
                      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="#94a3b8">students</text>
                    </svg>
                  );
                })()}
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Most enrolled</p>
                <p className="truncate text-sm font-semibold text-slate-800">{mostEnrolledProgramme?.programme || '—'}</p>
                <p className="text-xs text-slate-500">{mostEnrolledProgramme?.count || 0} students</p>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Total enrolments', value: total },
              { label: 'Active programmes', value: programmeData.length },
              { label: 'Most enrolled', value: mostEnrolledProgramme?.programme || '—' },
              { label: 'Other programmes', value: Math.max(0, programmeData.length - (mostEnrolledProgramme ? 1 : 0)) },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-slate-500">{item.label}</p>
                <p className="truncate text-sm font-semibold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <h4 className="mb-2 text-xs font-semibold text-slate-700">Programme distribution & insights</h4>
            {programmeData.length === 0 ? (
              <p className="text-xs text-slate-400">No programme data available.</p>
            ) : (
              <div className="space-y-3">
                {programmeData.map(item => {
                  const percentage = total ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <button
                      type="button"
                      key={item.programme}
                      onClick={() => navigate(`/students?programme=${encodeURIComponent(item.programme)}`)}
                      className="w-full text-left"
                      title={`View ${item.programme} student records`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                        <span className="truncate font-medium text-slate-700">{item.programme}</span>
                        <span className="shrink-0 font-semibold text-slate-700">{item.count} · {percentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 truncate text-[9px] text-slate-500">
                        Approved {item.approved} · Provisional {item.provisional} · Admission pending {item.pending} · Rejected {item.rejected} · Verified {item.verified}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <h4 className="mb-2 text-xs font-semibold text-slate-700">Recent enrolments</h4>
            {recentEnrolments.length === 0 ? (
              <p className="text-xs text-slate-400">No enrolments yet.</p>
            ) : (
              <div className="space-y-2">
                {recentEnrolments.map(student => (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-medium text-slate-700">{student.name}</span>
                      <span className="block truncate font-mono text-[9px] text-slate-400">{student.applicationNo || 'Application number unavailable'} · {student.programme || 'Programme unavailable'}</span>
                    </span>
                    <span className="shrink-0 text-[9px] text-slate-400">{formatDate(student.createdAt)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admission Status */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Admission Status</h3>
          <div className="space-y-2.5">
            {admissionSummary.map(item => (
              <button
                type="button"
                key={item.label}
                onClick={() => navigate(`/students?admissionStatus=${encodeURIComponent(item.label)}`)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                <span className="text-xs text-slate-500 flex-1">{item.label}</span>
                <span className="text-xs font-bold text-slate-700">{item.count}</span>
                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.count / (total || 1)) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <h4 className="mb-2 text-xs font-semibold text-slate-700">Admission summary</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Applications', value: total },
                { label: 'Verified', value: verified },
                { label: 'Approved', value: approved },
                { label: 'Provisional', value: provAppr },
                { label: 'Pending', value: pendingAdmissions },
                { label: 'Rejected', value: rejected },
              ].map(item => (
                <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-slate-700">Admission approval rate</span>
              <span className="font-semibold text-emerald-700">{approvalRate}% · {approved}/{total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${approvalRate}%` }} />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <h4 className="mb-2 text-xs font-semibold text-slate-700">Admission progress</h4>
            <div className="space-y-2">
              {[
                { label: 'Total applications', count: total, color: 'bg-blue-500' },
                { label: 'Verification completed', count: verified, color: 'bg-emerald-500' },
                { label: 'Admission pending', count: pendingAdmissions, color: 'bg-amber-400' },
                { label: 'Admission approved', count: approved, color: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[10px]">
                  <span className="flex-1 text-slate-500">{item.label}</span>
                  <span className="w-6 text-right font-semibold text-slate-700">{item.count}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${total ? Math.round(item.count / total * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <h4 className="mb-2 text-xs font-semibold text-slate-700">Recent admission decisions</h4>
            {recentAdmissionDecisions.length === 0 ? (
              <p className="text-xs text-slate-400">No admission decisions recorded.</p>
            ) : (
              <div className="space-y-2">
                {recentAdmissionDecisions.map(student => (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-medium text-slate-700">{student.name}</span>
                      <span className="block truncate font-mono text-[9px] text-slate-400">{student.applicationNo || 'Application number unavailable'}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[10px] font-medium text-slate-600">{getAdmissionStatus(student)}</span>
                      <span className="block text-[9px] text-slate-400">{formatDate(student.approval?.date)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[10px]">
            <span className="text-slate-500">Pending <strong className="text-amber-700">{pendingAdmissions}</strong></span>
            <span className="text-slate-500">Approved <strong className="text-emerald-700">{approved}</strong></span>
            <span className="text-slate-500">Rejected <strong className="text-red-700">{rejected}</strong></span>
            <span className="text-slate-500">
              Attention <strong>{administrativeAttention}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Recent Applications</h3>
          <button onClick={() => navigate('/students')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="table-header">Application No.</th>
                <th className="table-header">Student Name</th>
                <th className="table-header">Programme</th>
                <th className="table-header">Date Added</th>
                <th className="table-header">Verification</th>
                <th className="table-header">Admission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recent.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-400">No records yet</td></tr>
              )}
              {recent.map(s => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/students/${s.id}`)}
                >
                  <td className="table-cell font-mono text-xs text-blue-700">{s.applicationNo}</td>
                  <td className="table-cell text-sm font-medium text-slate-800">{s.name}</td>
                  <td className="table-cell text-sm text-slate-600">{s.programme} — {s.branch}</td>
                  <td className="table-cell text-xs text-slate-400">{formatDate(s.createdAt)}</td>
                  <td className="table-cell"><StatusBadge status={getOverallVerificationStatus(s.id)} /></td>
                  <td className="table-cell"><StatusBadge status={getAdmissionStatus(s)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
