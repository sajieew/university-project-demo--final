import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Download, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StudentTable from '../components/students/StudentTable';
import SearchBar from '../components/students/SearchBar';
import FilterPanel from '../components/students/FilterPanel';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { VERIFICATION_UPDATED_EVENT } from '../utils/localStorage';
import { getOverallVerificationStatus } from '../utils/verification';

const EMPTY_FILTERS = { academicYear: '', programme: '', branch: '', category: '', verificationStatus: '', admissionStatus: '' };

export default function StudentsPage() {
  const { students, removeStudent } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState(() => {
    // Pre-apply filter from URL params set by Dashboard stat cards
    const vs = searchParams.get('verificationStatus') || '';
    const as_ = searchParams.get('admissionStatus') || '';
    return { ...EMPTY_FILTERS, verificationStatus: vs, admissionStatus: as_ };
  });
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const vs = searchParams.get('verificationStatus') || '';
    const as_ = searchParams.get('admissionStatus') || '';
    return { ...EMPTY_FILTERS, verificationStatus: vs, admissionStatus: as_ };
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [, setVerificationRevision] = useState(0);

  useEffect(() => {
    const refreshVerification = () => setVerificationRevision(revision => revision + 1);
    window.addEventListener(VERIFICATION_UPDATED_EVENT, refreshVerification);
    window.addEventListener('storage', refreshVerification);
    return () => {
      window.removeEventListener(VERIFICATION_UPDATED_EVENT, refreshVerification);
      window.removeEventListener('storage', refreshVerification);
    };
  }, []);

  // Reset page on search/filter change
  useEffect(() => { setPage(0); }, [search, appliedFilters]);

  const q = search.toLowerCase().trim();
  const filtered = students.map(student => ({
    ...student,
    verificationStatus: getOverallVerificationStatus(student.id),
  })).filter(s => {
    const matchSearch = !q || [
      s.applicationNo, s.admissionNo, s.name, s.mobile, s.email
    ].some(v => v?.toLowerCase().includes(q));

    const { academicYear, programme, branch, category, verificationStatus, admissionStatus } = appliedFilters;
    const matchFilters =
      (!academicYear       || s.academicYear === academicYear) &&
      (!programme          || s.programme === programme) &&
      (!branch             || s.branch === branch) &&
      (!category           || s.category === category) &&
      (!verificationStatus || s.verificationStatus === verificationStatus) &&
      (!admissionStatus    || s.admissionStatus === admissionStatus);

    return matchSearch && matchFilters;
  });

  const handleDelete = () => {
    if (toDelete) {
      removeStudent(toDelete.id);
      setToDelete(null);
    }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['App No.', 'Adm No.', 'Name', 'Programme', 'Branch', 'Category', 'Mobile', 'Email', 'Year', 'Verification', 'Admission'];
    const rows = filtered.map(s => [
      s.applicationNo, s.admissionNo, s.name, s.programme, s.branch,
      s.category, s.mobile, s.email, s.academicYear, s.verificationStatus, s.admissionStatus
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Student Records</h1>
          <p className="text-sm text-slate-400">{students.length} total students</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-secondary btn-sm">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => navigate('/students/new')} className="btn-primary btn-sm">
            <UserPlus size={13} /> New Admission
          </button>
        </div>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, application no., mobile, email..."
          />
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          className={`btn-secondary btn-sm flex-shrink-0 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {Object.values(appliedFilters).some(Boolean) && (
            <span className="w-4 h-4 bg-blue-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {Object.values(appliedFilters).filter(Boolean).length}
            </span>
          )}
        </button>
        <button onClick={() => { setSearch(''); setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }} className="btn-secondary btn-sm flex-shrink-0">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onApply={() => { setAppliedFilters(filters); setPage(0); }}
          onClear={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}
          resultCount={filtered.length}
          totalCount={students.length}
        />
      )}

      {/* Table */}
      <div className="card">
        <StudentTable
          students={filtered}
          onDelete={setToDelete}
          page={page}
          setPage={setPage}
        />
      </div>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!toDelete}
        title="Delete Student Record"
        message={`Are you sure you want to delete the record for "${toDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
