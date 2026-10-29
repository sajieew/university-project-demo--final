import { useState } from 'react';
import { Pencil, Printer, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getRankStatements, saveRankStatement } from '../utils/localStorage';

const newRankStatement = (student) => ({
  studentId: student.id,
  applicationNumber: student.applicationNo || student.admissionNo || '',
  name: student.name || '',
  courseAllotted: [student.programme, student.branch].filter(Boolean).join(' '),
  randomNumber: '',
  maximumMarks: '',
  marksObtained: '',
  photo: student.photo || student.photoUrl || '',
  marksObtainedInWords: '',
  cutOffMarks: '',
  overallRank: '',
  nodalOfficer: 'Nodal Officer-KVELL',
});

const requiredFields = [
  'applicationNumber',
  'name',
  'courseAllotted',
  'randomNumber',
  'maximumMarks',
  'marksObtained',
  'marksObtainedInWords',
  'cutOffMarks',
  'overallRank',
  'photo',
];

export default function RankStatementPage() {
  const { user } = useAuth();
  const { students, showToast } = useApp();
  const isFaculty = user?.role === 'Faculty';
  const [statements, setStatements] = useState(() => getRankStatements());
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);

  const availableStudents = students;
  const matchingStudents = availableStudents.filter(student =>
    `${student.name || ''} ${student.applicationNo || ''}`
      .toLowerCase()
      .includes(candidateSearch.trim().toLowerCase())
  );

  const activeStudentId = availableStudents.some(student => student.id === selectedStudentId)
    ? selectedStudentId
    : availableStudents[0]?.id || '';
  const selectedStudent = students.find(student => student.id === activeStudentId);
  const savedStatement = statements.find(item => item.studentId === activeStudentId);
  const displayForm = form || (
    selectedStudent
      ? savedStatement
        ? { ...newRankStatement(selectedStudent), ...savedStatement }
        : newRankStatement(selectedStudent)
      : null
  );
  const isEditing = isFaculty && (editing || !savedStatement);

  const selectStudent = (studentId) => {
    const student = students.find(item => item.id === studentId);
    const statement = statements.find(item => item.studentId === studentId);
    setSelectedStudentId(studentId);
    setForm(student ? statement ? { ...newRankStatement(student), ...statement } : newRankStatement(student) : null);
    setEditing(isFaculty && !statement);
  };

  const handleStudentChange = (event) => selectStudent(event.target.value);

  const updateForm = (field, value) => {
    setForm(current => ({ ...(current || displayForm), [field]: value }));
  };

  const handlePhotoChange = (event) => {
    if (!isFaculty || !isEditing) return;
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Choose an image file for the candidate photo.', 'error');
      event.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast('The candidate photo must be smaller than 1 MB.', 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateForm('photo', String(reader.result));
    reader.onerror = () => showToast('Unable to read the candidate photo.', 'error');
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!isFaculty) {
      showToast('Only faculty can save rank statements.', 'error');
      return;
    }

    const missingField = requiredFields.find(field => {
      const value = displayForm?.[field];
      return typeof value === 'string' ? !value.trim() : !value;
    });

    if (!selectedStudent || missingField) {
      showToast('Complete all rank statement details before saving.', 'error');
      return;
    }

    try {
      const saved = saveRankStatement({
        ...displayForm,
        studentId: selectedStudent.id,
        updatedAt: new Date().toISOString(),
      }, user.role);
      setStatements(saved);
      setForm(saved.find(item => item.studentId === selectedStudent.id));
      setEditing(false);
      showToast('Rank statement saved.', 'success');
    } catch (error) {
      console.error('Unable to save rank statement.', error);
      showToast(error.message || 'Unable to save the rank statement.', 'error');
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="rank-statement-page animate-fade-in space-y-5">
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          .rank-statement-document, .rank-statement-document * { visibility: visible !important; }
          .rank-statement-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .rank-statement-document-inner { min-height: 0 !important; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Rank Statement</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isFaculty ? 'Create, edit, view, and print rank statements.' : 'View and print saved rank statements.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFaculty && selectedStudent && savedStatement && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">
              <Pencil size={14} /> Edit
            </button>
          )}
          {isEditing && (
            <button type="button" onClick={handleSave} className="btn-primary btn-sm">
              <Save size={14} /> Save Rank Statement
            </button>
          )}
          {selectedStudent && (
            <button type="button" onClick={handlePrint} className="btn-secondary btn-sm">
              <Printer size={14} /> Print
            </button>
          )}
        </div>
      </div>

      <div className="no-print card p-4">
        {isFaculty && (
          <div className="mb-4">
            <label htmlFor="rank-candidate-search" className="label">Candidate Search</label>
            <input
              id="rank-candidate-search"
              type="search"
              className="input-field max-w-xl"
              placeholder="Search by name or Application Number"
              value={candidateSearch}
              onChange={event => setCandidateSearch(event.target.value)}
            />
            {candidateSearch.trim() && (
              matchingStudents.length ? (
                <div className="mt-2 flex max-h-48 max-w-xl flex-col gap-1 overflow-y-auto">
                  {matchingStudents.map(student => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => selectStudent(student.id)}
                      className="input-field text-left"
                    >
                      {student.name} — {student.applicationNo || student.admissionNo || student.id}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No candidates found.</p>
              )
            )}
          </div>
        )}
        {!isFaculty && <label htmlFor="rank-statement-student" className="label">Candidate</label>}
        {!isFaculty && availableStudents.length ? (
          <select
            id="rank-statement-student"
            className="input-field max-w-xl"
            value={activeStudentId}
            onChange={handleStudentChange}
          >
            {availableStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} — {student.applicationNo || student.admissionNo || student.id}
              </option>
            ))}
          </select>
        ) : !isFaculty && (
          <p className="text-sm text-slate-500">
            No rank statements have been saved yet.
          </p>
        )}
        {isFaculty && !availableStudents.length && (
          <p className="text-sm text-slate-500">No candidate records are available.</p>
        )}
      </div>

      {selectedStudent && displayForm && (isFaculty || savedStatement) ? (
        <div className={`grid items-start gap-5 ${isEditing ? 'xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]' : 'grid-cols-1'}`}>
          {isEditing && (
            <section className="no-print card space-y-4 p-5">
              <h2 className="section-title">Rank Statement Details</h2>
              <div>
                <label htmlFor="rank-application-number" className="label">Application Number</label>
                <input id="rank-application-number" className="input-field" value={displayForm.applicationNumber || ''} onChange={event => updateForm('applicationNumber', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-candidate-name" className="label">Name of the Candidate</label>
                <input id="rank-candidate-name" className="input-field" value={displayForm.name || ''} onChange={event => updateForm('name', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-course-allotted" className="label">Course Allotted</label>
                <input id="rank-course-allotted" className="input-field" value={displayForm.courseAllotted || ''} onChange={event => updateForm('courseAllotted', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-random-number" className="label">Random Number</label>
                <input id="rank-random-number" className="input-field" value={displayForm.randomNumber || ''} onChange={event => updateForm('randomNumber', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-maximum-marks" className="label">Maximum Marks</label>
                <input id="rank-maximum-marks" className="input-field" value={displayForm.maximumMarks || ''} onChange={event => updateForm('maximumMarks', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-marks-obtained" className="label">Marks Obtained</label>
                <input id="rank-marks-obtained" className="input-field" value={displayForm.marksObtained || ''} onChange={event => updateForm('marksObtained', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-marks-obtained-words" className="label">Marks Obtained in Words</label>
                <input id="rank-marks-obtained-words" className="input-field" value={displayForm.marksObtainedInWords || ''} onChange={event => updateForm('marksObtainedInWords', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-cutoff-marks" className="label">Cut-off Marks</label>
                <input id="rank-cutoff-marks" className="input-field" value={displayForm.cutOffMarks || ''} onChange={event => updateForm('cutOffMarks', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-overall-rank" className="label">Overall Rank</label>
                <input id="rank-overall-rank" className="input-field" value={displayForm.overallRank || ''} onChange={event => updateForm('overallRank', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-nodal-officer" className="label">Nodal Officer-KVELL</label>
                <input id="rank-nodal-officer" className="input-field" value={displayForm.nodalOfficer || 'Nodal Officer-KVELL'} onChange={event => updateForm('nodalOfficer', event.target.value)} />
              </div>
              <div>
                <label htmlFor="rank-candidate-photo" className="label">Candidate Photo</label>
                <input id="rank-candidate-photo" type="file" accept="image/*" className="input-field" onChange={handlePhotoChange} />
                <p className="mt-1 text-xs text-slate-400">Image files up to 1 MB.</p>
              </div>
            </section>
          )}

          <article className="rank-statement-document min-w-0 w-full rounded-2xl border-[7px] border-[#14528a] bg-[#d0eafb] p-2 text-[#17456c] shadow-sm">
            <div className="rank-statement-document-inner overflow-hidden rounded-xl border border-[#8cb7d4] bg-white">
              <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-white px-3 py-3 sm:gap-4 sm:px-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#1b547d] text-center text-[9px] font-black leading-tight text-[#1b547d] sm:h-16 sm:w-16 sm:text-xs">
                  KVELL
                </div>
                <div className="text-center">
                  <h2 className="text-xs font-extrabold leading-tight sm:text-lg">
                    KARPAGA VINAYAGA COLLEGE OF ENGINEERING AND TECHNOLOGY
                  </h2>
                  <p className="text-[9px] font-semibold sm:text-xs">(Approved by AICTE, New Delhi, Accredited by NAAC)</p>
                  <p className="mt-0.5 text-[9px] font-bold leading-tight sm:text-sm">
                    Karpaga Vinayaga Educational Lore for Learning (Deemed to be University)
                  </p>
                  <p className="text-[8px] leading-relaxed sm:text-xs">
                    GST Road, Chinnakolambakkam, Padalam – 603 308, Madurantakam (Tk), Chengalpattu District
                    <br />044 - 7156 6373 | kvelladmission2026@gmail.com
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#1b547d] text-center text-[8px] font-black leading-tight text-[#1b547d] sm:h-16 sm:w-16 sm:text-[10px]">
                  KVELL
                </div>
              </header>

              <h3 className="bg-[#fffde9] px-3 py-2 text-center text-sm font-extrabold leading-tight sm:px-5 sm:text-2xl">
                  RANK STATEMENT
              </h3>

              <div className="grid grid-cols-1 gap-2 px-2 py-3 sm:grid-cols-3 sm:gap-3 sm:px-4 sm:py-4">
                <div className="overflow-hidden border border-black">
                  <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                    Application Number
                  </p>
                  <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                    {displayForm.applicationNumber || ' '}
                  </p>
                </div>
                <div className="overflow-hidden border border-black">
                  <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                    Name of the Candidate
                  </p>
                  <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                    {displayForm.name || ' '}
                  </p>
                </div>
                <div className="overflow-hidden border border-black">
                  <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                    Course Allotted
                  </p>
                  <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                    {displayForm.courseAllotted || ' '}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 px-2 pb-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,22%)] sm:gap-3 sm:px-4 sm:pb-4">
                <div className="grid grid-cols-1 overflow-hidden border border-black sm:grid-cols-3">
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                        Random Number
                    </p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                        {displayForm.randomNumber || ' '}
                    </p>
                  </div>
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                        Maximum Marks
                    </p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                        {displayForm.maximumMarks || ' '}
                    </p>
                  </div>
                  <div className="border-b border-black sm:border-b">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                        Marks Obtained
                    </p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                        {displayForm.marksObtained || ' '}
                    </p>
                  </div>
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                        Marks Obtained in Words
                    </p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                        {displayForm.marksObtainedInWords || ' '}
                    </p>
                  </div>
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                        Cut-off Marks
                    </p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                        {displayForm.cutOffMarks || ' '}
                    </p>
                  </div>
                  <div className="border-b border-black sm:border-b">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">
                        Overall Rank
                    </p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">
                        {displayForm.overallRank || ' '}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-1 sm:gap-1">
                  <div className="flex h-32 items-center justify-center border border-black bg-white text-center text-xs font-bold sm:h-28 md:h-36">
                  {displayForm.photo ? (
                    <img src={displayForm.photo} alt={`Candidate ${displayForm.name}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      Candidate Photo
                    </div>
                  )}
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-[#8cb7d4] px-4 pb-4 pt-3">
                <div className="text-xs font-semibold">Nodal Officer - KVELL</div>
                <div className="w-48 border-t border-[#17456c] pt-2 text-center text-xs font-bold">
                  {displayForm.nodalOfficer || 'Nodal Officer-KVELL'}
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : selectedStudent && !isFaculty ? (
        <p className="card p-5 text-sm text-slate-500">
          No rank statement has been saved for this student.
        </p>
      ) : null}
    </div>
  );
}
