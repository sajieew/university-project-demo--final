import { useState } from 'react';
import { Printer, Save, Pencil, Upload, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getProvisionalAllotments, saveProvisionalAllotment } from '../utils/localStorage';

const INSTRUCTIONS = 'The candidate must report to the Principal/Dean of the above college within one week, with the original documents listed overleaf. Failure to report within the stipulated period will result in cancellation of the allotment, and no claim to the seat shall be entertained thereafter. Please read the instructions given overleaf carefully. The allotment is subject to verification of originals by the college authorities at the time of admission. Allotment of the branch rests with the college authorities at the time of admission.';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const newAllotment = (student) => ({
  studentId: student.id,
  date: today(),
  hallTicketNumber: student.registerNo || student.admissionNo || '',
  courseAllotted: [student.programme, student.branch].filter(Boolean).join(' '),
  community: student.community || student.category || '',
  photo: '',
});

const displayDate = (date) => {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-GB');
};

export default function ProvisionalAllotmentPage() {
  const { user } = useAuth();
  const { students, showToast } = useApp();
  const isFaculty = user?.role === 'Faculty';
  const [allotments, setAllotments] = useState(() => getProvisionalAllotments());
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
  const savedAllotment = allotments.find(item => item.studentId === activeStudentId);
  const displayForm = form || (
    selectedStudent
      ? savedAllotment
        ? { ...newAllotment(selectedStudent), ...savedAllotment }
        : newAllotment(selectedStudent)
      : null
  );
  const isEditing = isFaculty && (editing || !savedAllotment);

  const selectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setForm(null);
    setEditing(false);
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
      showToast('Only faculty can save provisional allotments.', 'error');
      return;
    }
    if (!selectedStudent || !displayForm?.hallTicketNumber.trim() || !displayForm?.courseAllotted.trim()) {
      showToast('Select a candidate and enter the hall ticket number and allotted course.', 'error');
      return;
    }

    try {
      const saved = saveProvisionalAllotment({
        ...displayForm,
        studentId: selectedStudent.id,
        updatedAt: new Date().toISOString(),
      }, user.role);
      setAllotments(saved);
      setForm(saved.find(item => item.studentId === selectedStudent.id));
      setEditing(false);
      showToast('Provisional allotment saved.', 'success');
    } catch (error) {
      console.error('Unable to save provisional allotment.', error);
      showToast(error.message || 'Unable to save the provisional allotment.', 'error');
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="provisional-page animate-fade-in space-y-5">
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          .provisional-document, .provisional-document * { visibility: visible !important; }
          .provisional-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .provisional-document-inner { min-height: 0 !important; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Provisional Allotment</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isFaculty ? 'Create, edit, view, and print B.E./B.Tech. allotment orders.' : 'View and print saved B.E./B.Tech. allotment orders.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFaculty && selectedStudent && savedAllotment && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">
              <Pencil size={14} /> Edit
            </button>
          )}
          {isEditing && (
            <button type="button" onClick={handleSave} className="btn-primary btn-sm">
              <Save size={14} /> Save Allotment
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
            <label htmlFor="allotment-candidate-search" className="label">Candidate Search</label>
            <input
              id="allotment-candidate-search"
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
        {!isFaculty && <label htmlFor="allotment-student" className="label">Candidate</label>}
        {!isFaculty && availableStudents.length ? (
          <select
            id="allotment-student"
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
            No student records are available.
          </p>
        )}
        {isFaculty && !availableStudents.length && (
          <p className="text-sm text-slate-500">No candidate records are available.</p>
        )}
      </div>

      {selectedStudent && displayForm && (isFaculty || savedAllotment) ? (
        <div className={`grid items-start gap-5 ${isEditing ? 'xl:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]' : 'grid-cols-1'}`}>
          {isEditing && (
            <section className="no-print card space-y-4 p-5">
              <h2 className="section-title">Allotment Details</h2>
              <div>
                <label htmlFor="allotment-date" className="label">Date</label>
                <input id="allotment-date" type="date" className="input-field" value={displayForm.date || ''} onChange={event => updateForm('date', event.target.value)} />
              </div>
              <div>
                <label htmlFor="allotment-hall-ticket" className="label">Hall Ticket Number</label>
                <input id="allotment-hall-ticket" className="input-field" value={displayForm.hallTicketNumber || ''} onChange={event => updateForm('hallTicketNumber', event.target.value)} />
              </div>
              <div>
                <label htmlFor="allotment-course" className="label">Course Allotted</label>
                <input id="allotment-course" className="input-field" value={displayForm.courseAllotted || ''} onChange={event => updateForm('courseAllotted', event.target.value)} />
              </div>
              <div>
                <label htmlFor="allotment-community" className="label">Community</label>
                <input id="allotment-community" className="input-field" value={displayForm.community || ''} onChange={event => updateForm('community', event.target.value)} />
              </div>
              <div>
                <label htmlFor="allotment-photo" className="label">Candidate Photo</label>
                <input id="allotment-photo" type="file" accept="image/*" className="input-field" onChange={handlePhotoChange} />
                <p className="mt-1 text-xs text-slate-400">Image files up to 1 MB.</p>
              </div>
            </section>
          )}

          <article className="provisional-document min-w-0 w-full rounded-2xl border-[7px] border-[#14528a] bg-[#d0eafb] p-2 text-[#17456c] shadow-sm">
            <div className="provisional-document-inner overflow-hidden rounded-xl border border-[#8cb7d4]">
              <header className="flex items-center gap-4 bg-[#f7f4df] px-5 py-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-[#1b547d] text-center text-xs font-black leading-tight text-[#1b547d]">
                  KVELL
                </div>
                <div className="min-w-0 flex-1 text-center">
                  <h2 className="text-base font-extrabold leading-tight sm:text-lg">
                    Karpaga Vinayaga Educational Lore for Learning (Deemed to be University)
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed">
                    GST Road, Chinnakolambakkam, Padalam – 603 308, Madurantakam (Tk), Chengalpattu District
                    <br />044 - 7156 6373 or email us at kvelladmission2026@gmail.com
                  </p>
                </div>
              </header>

              <div className="flex flex-wrap items-start justify-between gap-3 bg-[#fffde9] px-5 py-3">
                <div>
                  <h3 className="text-base font-extrabold sm:text-lg">Provisional Allotment Order for B.E. / B.TECH.</h3>
                  <p className="text-xs">The candidate is hereby informed of the provisional allotment of a seat in the first year of B.E./B.TECH. as details below</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">Date: {displayDate(displayForm.date) || '____________'}</p>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_175px] sm:gap-6">
                <dl className="space-y-2 text-sm sm:text-base">
                  <div><dt className="inline font-bold">Hall Ticket Number: </dt><dd className="inline">{displayForm.hallTicketNumber || '________________'}</dd></div>
                  <div><dt className="inline font-bold">Name of the Candidate: </dt><dd className="inline">{selectedStudent.name}</dd></div>
                  <div><dt className="inline font-bold">Course Allotted: </dt><dd className="inline">{displayForm.courseAllotted || '________________'}</dd></div>
                  <div><dt className="inline font-bold">Community: </dt><dd className="inline">{displayForm.community || '________________'}</dd></div>
                </dl>
                <div className="flex flex-col items-center gap-1">
                  {displayForm.photo ? (
                    <img src={displayForm.photo} alt={`Candidate ${selectedStudent.name}`} className="h-28 w-24 border border-slate-700 bg-white object-cover sm:h-32 sm:w-28" />
                  ) : (
                    <div className="flex h-28 w-24 flex-col items-center justify-center border border-slate-700 bg-white text-center text-xs font-bold sm:h-32 sm:w-28">
                      <UserRound size={25} className="mb-1" /> PHOTO
                    </div>
                  )}
                  {isEditing && (
                    <label htmlFor="allotment-photo" className="no-print mt-1 flex cursor-pointer items-center gap-1 text-xs font-semibold">
                      <Upload size={13} /> {displayForm.photo ? 'Change photo above' : 'Upload photo above'}
                    </label>
                  )}
                </div>
                <p className="col-span-2 text-[10px] leading-relaxed sm:text-xs">{INSTRUCTIONS}</p>
                <div className="col-start-2 text-center">
                  <div className="mb-1 h-8 rounded-md border border-[#17456c] bg-white/70" />
                  <p className="text-xs font-bold">Nodal Officer-KVELL</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : selectedStudent && !isFaculty ? (
        <p className="card p-5 text-sm text-slate-500">
          No provisional allotment order has been saved for this student.
        </p>
      ) : null}
    </div>
  );
}
