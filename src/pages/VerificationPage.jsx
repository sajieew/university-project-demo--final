import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import SearchBar from '../components/students/SearchBar';

export default function VerificationPage() {
  const { students } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const pending = students.filter(s =>
    s.verificationStatus === 'Pending' &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.applicationNo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pending Verification</h1>
          <p className="text-sm text-slate-400">{pending.length} records awaiting verification</p>
        </div>
        <button onClick={() => navigate('/students/new')} className="btn-primary">
          <UserPlus size={15} /> New Admission
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search pending records..." />

      {pending.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No pending verifications</p>
          <p className="text-xs text-slate-400 mt-1">All records are verified or search returned no results</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-header">Application No.</th>
                <th className="table-header">Student Name</th>
                <th className="table-header">Programme</th>
                <th className="table-header">Branch</th>
                <th className="table-header">Verification</th>
                <th className="table-header text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pending.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-cell font-mono text-xs text-blue-700">{s.applicationNo}</td>
                  <td className="table-cell font-medium text-slate-800">{s.name}</td>
                  <td className="table-cell text-sm">{s.programme}</td>
                  <td className="table-cell text-xs text-slate-500">{s.branch}</td>
                  <td className="table-cell"><StatusBadge status={s.verificationStatus} /></td>
                  <td className="table-cell text-center">
                    <button
                      onClick={() => navigate(`/students/${s.id}/edit`)}
                      className="btn-primary btn-sm"
                    >
                      Verify Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
