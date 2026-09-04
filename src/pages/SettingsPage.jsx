import { Settings, Save } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { showToast } = useApp();
  const [inst, setInst] = useState({
    name: 'Demo University',
    address: '123 University Road, Chennai, Tamil Nadu — 600001',
    accreditation: 'NAAC A+',
    affiliatedTo: 'Anna University',
    phone: '044-12345678',
    email: 'admission@demouniversity.edu',
    website: 'www.demouniversity.edu',
  });

  const save = () => showToast('Settings saved (demo — data not persisted).', 'success');

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings size={20} className="text-blue-700" />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-400">Institution configuration (demo only)</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="section-title">Institution Details</h3>
        {Object.entries(inst).map(([key, val]) => (
          <div key={key}>
            <label className="label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
            <input
              className="input-field"
              value={val}
              onChange={e => setInst(p => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button onClick={save} className="btn-primary">
            <Save size={15} /> Save Settings
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title">Demo Information</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          This is a <strong>frontend-only demo</strong>. All data is stored in browser <code className="bg-slate-100 px-1 rounded text-xs">localStorage</code>.
          No backend, no API, no database. Clearing browser storage will reset all demo data.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="btn-danger btn-sm"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}
