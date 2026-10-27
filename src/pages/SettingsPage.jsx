import { Settings, Save, Moon, Sun, Check } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { showToast } = useApp();
  const { theme, setTheme } = useTheme();
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

      <section className="card p-6 space-y-4">
        <div>
          <h2 className="section-title">Appearance Settings</h2>
          <p className="text-sm text-slate-500">
            Choose the appearance used across the entire application. Your preference is saved on this device.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Choose appearance theme">
          {[
            { id: 'light', label: 'Light Mode', description: 'A clean, bright workspace.', icon: <Sun size={18} /> },
            { id: 'dark', label: 'Dark Mode', description: 'A comfortable, low-light workspace.', icon: <Moon size={18} /> },
          ].map(option => {
            const selected = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTheme(option.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className={`mt-0.5 ${selected ? 'text-blue-700' : 'text-slate-500'}`}>
                  {option.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-800">
                    {option.label}
                    {selected && <Check size={16} className="text-blue-700" />}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            {theme === 'dark' ? 'Dark Mode is active' : 'Light Mode is active'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            This theme applies immediately to pages, forms, tables, dialogs, and navigation.
          </p>
        </div>
      </section>

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
