import { useState } from 'react';
import { UserPlus, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

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
  const { users, createUser, editUser, removeUser } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toDelete, setToDelete] = useState(null);

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
