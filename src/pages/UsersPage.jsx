import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Pencil, Trash2, UserCheck, UserX, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getStudentOfficerAssignment, getVerificationAssignments, saveStudentOfficerAssignment, VERIFICATION_UPDATED_EVENT } from '../utils/localStorage';
import { getOfficerWorkloads } from '../utils/verification';
import { VERIFICATION_STAGES } from '../utils/demoData';

function UserForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', username: '', role: 'Faculty', status: 'Active', email: '', password: '' });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Full Name" />
        </div>
        <div>
          <label className="label">Username</label>
          <input className="input-field" value={form.username} onChange={e => set('username', e.target.value)} placeholder="username" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@university.edu" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input-field" value={form.password || ''} onChange={e => set('password', e.target.value)} placeholder="Password" />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
            <option>Admin</option>
            <option>Faculty</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={() => onSave(form)}>Save User</button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { users, students, createUser, editUser, removeUser, showToast } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [assignments, setAssignments] = useState(getVerificationAssignments);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    const refresh = () => setAssignments(getVerificationAssignments());
    window.addEventListener(VERIFICATION_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(VERIFICATION_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const activeFaculty = users.filter(user => user.role === 'Faculty' && user.status === 'Active');
  const workloads = getOfficerWorkloads(students);
  const assignedStudentIds = new Set(assignments
    .filter(assignment => assignment.officerId || Object.values(assignment.stageAssignments || {}).some(Boolean))
    .map(assignment => assignment.studentId));
  const unassignedCount = students.filter(student => !assignedStudentIds.has(student.id)).length;

  const assignOfficer = (studentId, stageId, officerId) => {
    try {
      saveStudentOfficerAssignment(studentId, stageId, officerId);
      setAssignments(getVerificationAssignments());
      showToast('Verification officer assignment updated.', 'success');
    } catch (error) {
      console.error('Verification officer assignment error', error);
      showToast(error.message || 'Unable to update officer assignment.', 'error');
    }
  };

  const handleCreate = (form) => {
    createUser({ ...form, id: `USR${Date.now()}` });
    setShowAdd(false);
  };

  const handleEdit = (form) => {
    editUser(editTarget.id, form);
    setEditTarget(null);
  };

  const toggleStatus = (user) => {
    editUser(user.id, { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' });
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-400">{users.length} users · Frontend demo only</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <UserPlus size={15} /> Add User
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-header">Name</th>
              <th className="table-header">Username</th>
              <th className="table-header">Email</th>
              <th className="table-header">Role</th>
              <th className="table-header">Status</th>
              <th className="table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="table-cell font-medium text-slate-800">{user.name}</td>
                <td className="table-cell font-mono text-xs text-slate-600">{user.username}</td>
                <td className="table-cell text-xs text-slate-500">{user.email}</td>
                <td className="table-cell">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === 'Admin' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="table-cell"><StatusBadge status={user.status} /></td>
                <td className="table-cell">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => toggleStatus(user)} title={user.status === 'Active' ? 'Disable' : 'Enable'}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${user.status === 'Active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                      {user.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                    <button onClick={() => setEditTarget(user)} title="Edit"
                      className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setToDelete(user)} title="Delete"
                      className="w-7 h-7 rounded-md text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Verification Officer Assignments</h2>
            <p className="text-sm text-slate-400">{unassignedCount} students unassigned · assignments are limited to active Faculty</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workloads.map(officer => (
            <button
              key={officer.id}
              type="button"
              onClick={() => navigate(`/students?assignedOfficer=${encodeURIComponent(officer.id)}`)}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{officer.name}</p>
                  <p className="text-xs text-slate-400">{officer.assignedStudents} assigned students</p>
                </div>
                <StatusBadge status={officer.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-amber-600">{officer.pendingTasks}</p><p className="text-[10px] text-slate-400">Pending</p></div>
                <div><p className="text-lg font-bold text-emerald-600">{officer.completedTasks}</p><p className="text-[10px] text-slate-400">Completed</p></div>
                <div><p className="text-lg font-bold text-red-600">{officer.rejectedDocuments}</p><p className="text-[10px] text-slate-400">Rejected</p></div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Work completion</span><span className="font-semibold">{officer.completionPercentage}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${officer.completionPercentage}%` }} />
              </div>
            </button>
          ))}
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-header">Student</th>
                <th className="table-header">Student Officer</th>
                <th className="table-header">Stage Assignments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map(student => {
                const assignment = getStudentOfficerAssignment(student.id);
                const expanded = expandedStudent === student.id;
                return (
                  <tr key={student.id} className="align-top hover:bg-slate-50/50">
                    <td className="table-cell">
                      <p className="font-medium text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.applicationNo}</p>
                    </td>
                    <td className="table-cell">
                      <select
                        className="input-field py-1.5 text-xs"
                        aria-label={`Assign officer for ${student.name}`}
                        value={assignment?.officerId || ''}
                        onChange={event => assignOfficer(student.id, null, event.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {activeFaculty.map(officer => <option key={officer.id} value={officer.id}>{officer.name}</option>)}
                      </select>
                    </td>
                    <td className="table-cell">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700"
                        aria-expanded={expanded}
                        onClick={() => setExpandedStudent(expanded ? null : student.id)}
                      >
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {expanded ? 'Hide stages' : 'Assign stages'}
                      </button>
                      {expanded && (
                        <div className="mt-2 space-y-2">
                          {VERIFICATION_STAGES.map(stage => (
                            <label key={stage.id} className="flex items-center justify-between gap-3 text-xs text-slate-600">
                              <span className="min-w-0 truncate">Stage {stage.id}</span>
                              <select
                                className="input-field max-w-48 py-1 text-xs"
                                aria-label={`Assign Stage ${stage.id} for ${student.name}`}
                                value={assignment?.stageAssignments?.[String(stage.id)] || ''}
                                onChange={event => assignOfficer(student.id, stage.id, event.target.value)}
                              >
                                <option value="">Use student officer</option>
                                {activeFaculty.map(officer => <option key={officer.id} value={officer.id}>{officer.name}</option>)}
                              </select>
                            </label>
                          ))}
                          {(assignment?.history || []).length > 0 && (
                            <div className="border-t border-slate-100 pt-2">
                              <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">Assignment history</p>
                              {assignment.history.slice().reverse().map((entry, index) => (
                                <p key={`${entry.changedAt}-${index}`} className="text-[10px] text-slate-500">
                                  {new Date(entry.changedAt).toLocaleString()} · {users.find(item => item.id === entry.previousOfficerId)?.name || (entry.previousOfficerId ? 'Former officer' : 'Unassigned')}
                                  {' → '}
                                  {users.find(item => item.id === entry.officerId)?.name || 'Unassigned'}
                                  {entry.stageId ? ` · Stage ${entry.stageId}` : ' · Student assignment'}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={showAdd} title="Add New User" onClose={() => setShowAdd(false)}>
        <UserForm onSave={handleCreate} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!editTarget} title="Edit User" onClose={() => setEditTarget(null)}>
        {editTarget && <UserForm initial={editTarget} onSave={handleEdit} onCancel={() => setEditTarget(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete User"
        message={`Delete "${toDelete?.name}"? This action cannot be undone.`}
        onConfirm={() => { removeUser(toDelete.id); setToDelete(null); }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
