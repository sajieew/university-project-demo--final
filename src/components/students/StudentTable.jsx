import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, FileDown, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { downloadPDF, printPDF } from '../../utils/pdfGenerator';

const PAGE_SIZE = 10;

export default function StudentTable({ students, onDelete, page, setPage }) {
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const slice = students.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  if (students.length === 0) {
    return (
      <EmptyState
        type="students"
        action={
          <button className="btn-primary" onClick={() => navigate('/students/new')}>
            Add First Student
          </button>
        }
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-header">App. No.</th>
              <th className="table-header">Adm. No.</th>
              <th className="table-header">Student Name</th>
              <th className="table-header">Programme</th>
              <th className="table-header">Branch</th>
              <th className="table-header">Year</th>
              <th className="table-header">Overall Verification</th>
              <th className="table-header">Verification Progress</th>
              <th className="table-header">Admission</th>
              <th className="table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {slice.map((student, idx) => (
              <tr key={student.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                <td className="table-cell font-mono text-xs font-medium text-blue-700">{student.applicationNo}</td>
                <td className="table-cell font-mono text-xs text-slate-500">{student.admissionNo || '—'}</td>
                <td className="table-cell">
                  <div className="font-medium text-slate-800 text-sm">{student.name}</div>
                  <div className="text-xs text-slate-400">{student.email}</div>
                </td>
                <td className="table-cell text-sm">{student.programme}</td>
                <td className="table-cell text-xs text-slate-600 max-w-36 truncate">{student.branch}</td>
                <td className="table-cell text-xs text-slate-500">{student.academicYear}</td>
                <td className="table-cell">
                  <button
                    type="button"
                    title="View verification breakdown"
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <StatusBadge status={student.verificationStatus} />
                  </button>
                </td>
                <td className="table-cell min-w-48">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-600">
                      {student.verificationProgress.verifiedCount}/{student.verificationProgress.totalCount} documents · {student.verificationProgress.completedStageCount}/{student.verificationProgress.totalStageCount} stages
                    </span>
                    <span className="font-semibold text-slate-700">{student.verificationProgress.percentage}%</span>
                  </div>
                  <div
                    className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${student.name} mandatory document verification`}
                    aria-valuemin={0}
                    aria-valuemax={student.verificationProgress.totalCount}
                    aria-valuenow={student.verificationProgress.verifiedCount}
                  >
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${student.verificationProgress.percentage}%` }} />
                  </div>
                  <div className="mt-1 flex gap-1">
                    {student.verificationProgress.stages.map(stage => (
                      <span
                        key={stage.id}
                        title={`Stage ${stage.id}: ${stage.status}`}
                        className={`rounded px-1 text-[9px] font-semibold ${
                          stage.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : stage.status === 'Rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        S{stage.id} {stage.status === 'Completed' ? 'Done' : stage.status === 'Rejected' ? 'Action' : 'Pending'}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="table-cell">
                  <StatusBadge status={student.admissionStatus} />
                </td>
                <td className="table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      title="View"
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="w-7 h-7 rounded-md text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => navigate(`/students/${student.id}/edit`)}
                      className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Download PDF"
                      onClick={() => downloadPDF(student)}
                      className="w-7 h-7 rounded-md text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                    >
                      <FileDown size={14} />
                    </button>
                    <button
                      title="Print"
                      onClick={() => printPDF(student)}
                      className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <Printer size={14} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => onDelete(student)}
                      className="w-7 h-7 rounded-md text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 mt-2">
          <p className="text-xs text-slate-400">
            Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, students.length)} of {students.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i).map(i => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${i === safePage ? 'bg-blue-700 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
