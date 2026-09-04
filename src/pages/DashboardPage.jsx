import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle, Clock, XCircle, FileText,
  UserPlus, Search, BarChart3, ArrowRight, TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate } from '../utils/validation';

function MiniChart({ data, max, color }) {
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-80`}
          style={{ height: `${Math.max(8, (v / max) * 40)}px` }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { students } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const total     = students.length;
  const verified  = students.filter(s => s.verificationStatus === 'Verified').length;
  const pending   = students.filter(s => s.verificationStatus === 'Pending').length;
  const approved  = students.filter(s => s.admissionStatus === 'Approved').length;
  const provAppr  = students.filter(s => s.admissionStatus === 'Provisionally Approved').length;
  const rejected  = students.filter(s => s.admissionStatus === 'Rejected').length;

  const recent = [...students].slice(0, 5);

  // Programme-wise count
  const programmes = ['B.E.', 'B.Tech.', 'M.E.', 'M.Tech.', 'MCA', 'MBA'];
  const progData = programmes.map(p => students.filter(s => s.programme === p).length);
  const maxProg = Math.max(...progData, 1);

  // Admission status breakdown
  const admissionSummary = [
    { label: 'Approved',               count: approved,  color: 'bg-emerald-500' },
    { label: 'Provisionally Approved', count: provAppr,  color: 'bg-blue-500' },
    { label: 'Pending',                count: students.filter(s => s.admissionStatus === 'Pending').length, color: 'bg-amber-400' },
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<Users size={20} />} label="Total Applications" value={total} color="blue" onClick={() => navigate('/students')} />
        <StatCard icon={<CheckCircle size={20} />} label="Verified" value={verified} color="emerald" />
        <StatCard icon={<Clock size={20} />} label="Pending" value={pending} color="amber" onClick={() => navigate('/students?status=Pending')} />
        <StatCard icon={<FileText size={20} />} label="Approved" value={approved} color="emerald" />
        <StatCard icon={<TrendingUp size={20} />} label="Provisional" value={provAppr} color="violet" />
        <StatCard icon={<XCircle size={20} />} label="Rejected" value={rejected} color="red" />
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
            ].map(action => (
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

        {/* Programme-wise */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Programme-wise Students</h3>
          <div className="space-y-2.5">
            {programmes.map((p, i) => (
              <div key={p} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-16 flex-shrink-0">{p}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${(progData[i] / (total || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-5 text-right">{progData[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Status */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Admission Status</h3>
          <div className="space-y-2.5">
            {admissionSummary.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                <span className="text-xs text-slate-500 flex-1">{item.label}</span>
                <span className="text-xs font-bold text-slate-700">{item.count}</span>
                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.count / (total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
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
                  <td className="table-cell"><StatusBadge status={s.verificationStatus} /></td>
                  <td className="table-cell"><StatusBadge status={s.admissionStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
