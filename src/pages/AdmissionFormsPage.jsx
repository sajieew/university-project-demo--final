import { useState, useMemo } from 'react';
import { FileText, Download, Printer, Eye, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BRANCH_CONFIG, COMMUNITIES } from '../utils/demoData';
import {
  generateFormA, generateFormB, generateFormC,
  downloadFormA, downloadFormB, downloadFormC,
  printForm,
} from '../utils/formsPdfGenerator';
import FormAPreview from '../components/forms/FormAPreview';
import FormBPreview from '../components/forms/FormBPreview';
import FormCPreview from '../components/forms/FormCPreview';

const YEARS     = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const QUOTAS    = ['Merit', 'Management', 'NRI', 'Other'];
const BRANCHES  = BRANCH_CONFIG.map(b => b.name);

const TAB_DEFS = [
  { id: 'A', label: 'FORM A', subtitle: 'Branch / Quota Summary',        icon: '🏫' },
  { id: 'B', label: 'FORM B', subtitle: 'Student Admission Details',     icon: '📋' },
  { id: 'C', label: 'FORM C', subtitle: 'Community-wise Summary',        icon: '📊' },
];

function FilterRow({ filters, onChange, showQuota = false, showCommunity = false }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const clear = () => onChange({ academicYear: '', branch: '', quota: '', community: '' });
  const hasFilter = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
      <SlidersHorizontal size={14} className="text-slate-400 flex-shrink-0" />

      <select value={filters.academicYear} onChange={e => set('academicYear', e.target.value)} className="input-field text-xs py-1.5 w-32">
        <option value="">All Years</option>
        {YEARS.map(y => <option key={y}>{y}</option>)}
      </select>

      <select value={filters.branch} onChange={e => set('branch', e.target.value)} className="input-field text-xs py-1.5 w-56">
        <option value="">All Branches</option>
        {BRANCHES.map(b => <option key={b}>{b}</option>)}
      </select>

      {showQuota && (
        <select value={filters.quota} onChange={e => set('quota', e.target.value)} className="input-field text-xs py-1.5 w-36">
          <option value="">All Quotas</option>
          {QUOTAS.map(q => <option key={q}>{q}</option>)}
        </select>
      )}

      {showCommunity && (
        <select value={filters.community} onChange={e => set('community', e.target.value)} className="input-field text-xs py-1.5 w-28">
          <option value="">All Communities</option>
          {COMMUNITIES.map(c => <option key={c}>{c}</option>)}
        </select>
      )}

      {hasFilter && (
        <button onClick={clear} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
}

function ActionBar({ onView, onDownload, onPrint, label }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onView}     className="btn-secondary btn-sm"><Eye size={13} /> Preview</button>
      <button onClick={onDownload} className="btn-primary btn-sm"><Download size={13} /> Download PDF</button>
      <button onClick={onPrint}    className="btn-secondary btn-sm"><Printer size={13} /> Print</button>
    </div>
  );
}

export default function AdmissionFormsPage() {
  const { students } = useApp();
  const [activeTab, setActiveTab]   = useState('A');
  const [filters, setFilters]       = useState({ academicYear: '', branch: '', quota: '', community: '' });
  const [preview, setPreview]       = useState(null); // 'A' | 'B' | 'C' | null

  const handleView = (form) => setPreview(form);
  const handleClose = () => setPreview(null);

  const handleDownload = (form) => {
    if (form === 'A') downloadFormA(students, filters);
    if (form === 'B') downloadFormB(students, filters);
    if (form === 'C') downloadFormC(students, filters);
  };

  const handlePrint = (form) => {
    if (form === 'A') printForm(generateFormA(students, filters));
    if (form === 'B') printForm(generateFormB(students, filters));
    if (form === 'C') printForm(generateFormC(students, filters));
  };

  // Counts for info strip
  const filteredCount = useMemo(() => students.filter(s =>
    (!filters.academicYear || s.academicYear === filters.academicYear) &&
    (!filters.branch       || s.branch === filters.branch) &&
    (!filters.quota        || s.category === filters.quota) &&
    (!filters.community    || s.community === filters.community)
  ).length, [students, filters]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Admission Reports</h1>
        <p className="text-sm text-slate-400">Generate official admission forms from live portal data</p>
      </div>

      {/* College info strip */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-xs text-blue-800 space-y-0.5">
        <p className="font-semibold">1409 – KARPAGA VINAYAGA COLLEGE OF ENGINEERING AND TECHNOLOGY</p>
        <p>Palayanoor Post, Maduranthagam Taluk, Chengalpattu District – 603308</p>
        <p className="text-blue-600">Academic Year: First Year 2025 – 2026 &nbsp;|&nbsp; Data source: {students.length} student records &nbsp;|&nbsp; Filtered: {filteredCount} records</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {TAB_DEFS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold border border-b-0 transition-colors
              ${activeTab === t.id
                ? 'bg-white border-slate-200 text-blue-700 shadow-sm -mb-px'
                : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.icon} {t.label}
            <span className="ml-2 text-xs font-normal text-slate-400">{t.subtitle}</span>
          </button>
        ))}
      </div>

      {/* ─── FORM A ─── */}
      {activeTab === 'A' && (
        <div className="space-y-4">
          <FilterRow filters={filters} onChange={setFilters} />
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Form A — Branch / Management Quota Admission Summary</h2>
                <p className="text-xs text-slate-400 mt-0.5">Shows SAN, Management Quota Approved, Admitted and Balance per branch.</p>
              </div>
              <ActionBar
                onView={() => handleView('A')}
                onDownload={() => handleDownload('A')}
                onPrint={() => handlePrint('A')}
              />
            </div>
            <FormAPreview students={students} filters={filters} />
          </div>
        </div>
      )}

      {/* ─── FORM B ─── */}
      {activeTab === 'B' && (
        <div className="space-y-4">
          <FilterRow filters={filters} onChange={setFilters} showQuota showCommunity />
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Form B — Student Admission Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">Student-wise list with subject marks, quota, community, nationality and more.</p>
              </div>
              <ActionBar
                onView={() => handleView('B')}
                onDownload={() => handleDownload('B')}
                onPrint={() => handlePrint('B')}
              />
            </div>
            <FormBPreview students={students} filters={filters} />
          </div>
        </div>
      )}

      {/* ─── FORM C ─── */}
      {activeTab === 'C' && (
        <div className="space-y-4">
          <FilterRow filters={filters} onChange={setFilters} />
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Form C — Community-wise Admission Summary</h2>
                <p className="text-xs text-slate-400 mt-0.5">Branch × Community × Gender breakdown with totals.</p>
              </div>
              <ActionBar
                onView={() => handleView('C')}
                onDownload={() => handleDownload('C')}
                onPrint={() => handlePrint('C')}
              />
            </div>
            <FormCPreview students={students} filters={filters} />
          </div>
        </div>
      )}

      {/* Full-screen PDF preview overlay */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                PDF Preview — Form {preview}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(preview)} className="btn-primary btn-sm">
                  <Download size={13} /> Download
                </button>
                <button onClick={() => handlePrint(preview)} className="btn-secondary btn-sm">
                  <Printer size={13} /> Print
                </button>
                <button onClick={handleClose} className="btn-secondary btn-sm">
                  <X size={13} /> Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {preview === 'A' && <FormAPreview students={students} filters={filters} printMode />}
              {preview === 'B' && <FormBPreview students={students} filters={filters} printMode />}
              {preview === 'C' && <FormCPreview students={students} filters={filters} printMode />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
