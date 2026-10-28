import { Filter, X } from 'lucide-react';

const PROGRAMMES = ['B.E.', 'B.Tech.', 'M.E.', 'M.Tech.', 'MCA', 'MBA'];
const BRANCHES = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'VLSI Design',
  'Software Engineering',
  'Human Resource Management',
  'Finance',
];
const CATEGORIES = ['Merit', 'Management', 'NRI', 'Other'];
const VERIFICATION_STATUSES = ['Verified', 'Not Verified'];
const ADMISSION_STATUSES = ['Approved', 'Provisionally Approved', 'Pending', 'Rejected'];
const ACADEMIC_YEARS = ['2024-25', '2023-24', '2022-23', '2021-22'];

export default function FilterPanel({ filters, onChange, onApply, onClear, resultCount, totalCount }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-700 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
          <X size={12} /> Clear
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="label">Academic Year</label>
          <select className="input-field py-1.5 text-xs" value={filters.academicYear || ''} onChange={e => set('academicYear', e.target.value)}>
            <option value="">All Years</option>
            {ACADEMIC_YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Programme</label>
          <select className="input-field py-1.5 text-xs" value={filters.programme || ''} onChange={e => set('programme', e.target.value)}>
            <option value="">All</option>
            {PROGRAMMES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Branch</label>
          <select className="input-field py-1.5 text-xs" value={filters.branch || ''} onChange={e => set('branch', e.target.value)}>
            <option value="">All Branches</option>
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input-field py-1.5 text-xs" value={filters.category || ''} onChange={e => set('category', e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Verification</label>
          <select className="input-field py-1.5 text-xs" value={filters.verificationStatus || ''} onChange={e => set('verificationStatus', e.target.value)}>
            <option value="">All</option>
            {VERIFICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Admission</label>
          <select className="input-field py-1.5 text-xs" value={filters.admissionStatus || ''} onChange={e => set('admissionStatus', e.target.value)}>
            <option value="">All</option>
            {ADMISSION_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{resultCount}</span> of{' '}
          <span className="font-semibold text-slate-600">{totalCount}</span> records
        </p>
        <button onClick={onApply} className="btn-primary btn-sm">Apply Filters</button>
      </div>
    </div>
  );
}
