import { useState } from 'react';
import { Pencil, Printer, Save, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  getEntranceExaminationTickets,
  saveEntranceExaminationTicket,
} from '../utils/localStorage';

const IMPORTANT_INSTRUCTIONS = 'Bring this hall ticket and a valid photo ID (Aadhaar Card/School ID). Arrive at the venue at least 30 minutes before the reporting time. Electronic gadgets, calculators and study materials are not permitted inside the examination hall. Follow all instructions given by the invigilator.';

const newTicket = (student) => ({
  studentId: student.id,
  hallTicketNumber: student.registerNo || student.admissionNo || '',
  name: student.name || '',
  dateOfBirth: student.dob || '',
  courseApplied: [student.programme, student.branch].filter(Boolean).join(' '),
  examDateTime: '',
  examVenue: '',
  photo: student.photo || student.photoUrl || '',
  signature: '',
});

const displayDate = (date) => {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-GB');
};

export default function EntranceExaminationPage() {
  const { user } = useAuth();
  const { students, showToast } = useApp();
  const isFaculty = user?.role === 'Faculty';
  const [tickets, setTickets] = useState(() => getEntranceExaminationTickets());
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
  const savedTicket = tickets.find(ticket => ticket.studentId === activeStudentId);
  const displayForm = form || (
    selectedStudent
      ? savedTicket
        ? { ...newTicket(selectedStudent), ...savedTicket }
        : newTicket(selectedStudent)
      : null
  );
  const isEditing = isFaculty && (editing || !savedTicket);

  const selectStudent = (studentId) => {
    const student = students.find(item => item.id === studentId);
    const ticket = tickets.find(item => item.studentId === studentId);
    setSelectedStudentId(studentId);
    setForm(student ? ticket ? { ...newTicket(student), ...ticket } : newTicket(student) : null);
    setEditing(isFaculty && !ticket);
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

  const handleSignatureChange = (event) => {
    if (!isFaculty || !isEditing) return;
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Choose an image file for the candidate signature.', 'error');
      event.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast('The candidate signature must be smaller than 1 MB.', 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateForm('signature', String(reader.result));
    reader.onerror = () => showToast('Unable to read the candidate signature.', 'error');
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!isFaculty) {
      showToast('Only faculty can save entrance examination hall tickets.', 'error');
      return;
    }
    if (
      !selectedStudent
      || !displayForm?.hallTicketNumber.trim()
      || !displayForm?.name.trim()
      || !displayForm?.dateOfBirth
      || !displayForm?.courseApplied.trim()
      || !displayForm?.examDateTime.trim()
      || !displayForm?.examVenue.trim()
    ) {
      showToast('Complete all hall ticket details before saving.', 'error');
      return;
    }

    try {
      const saved = saveEntranceExaminationTicket({
        ...displayForm,
        studentId: selectedStudent.id,
        updatedAt: new Date().toISOString(),
      }, user.role);
      setTickets(saved);
      setForm(saved.find(ticket => ticket.studentId === selectedStudent.id));
      setEditing(false);
      showToast('Entrance examination hall ticket saved.', 'success');
    } catch (error) {
      console.error('Unable to save entrance examination hall ticket.', error);
      showToast(error.message || 'Unable to save the hall ticket.', 'error');
    }
  };

  return (
    <div className="entrance-examination-page animate-fade-in space-y-5">
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          .entrance-ticket, .entrance-ticket * { visibility: visible !important; }
          .entrance-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Entrance Examination</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isFaculty ? 'Create, edit, view, and print entrance examination hall tickets.' : 'View and print saved entrance examination hall tickets.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFaculty && selectedStudent && savedTicket && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">
              <Pencil size={14} /> Edit
            </button>
          )}
          {isEditing && (
            <button type="button" onClick={handleSave} className="btn-primary btn-sm">
              <Save size={14} /> Save Hall Ticket
            </button>
          )}
          {selectedStudent && (
            <button type="button" onClick={() => window.print()} className="btn-secondary btn-sm">
              <Printer size={14} /> Print
            </button>
          )}
        </div>
      </div>

      <div className="no-print card p-4">
        {isFaculty && (
          <div className="mb-4">
            <label htmlFor="entrance-candidate-search" className="label">Candidate Search</label>
            <input
              id="entrance-candidate-search"
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
        {!isFaculty && <label htmlFor="entrance-ticket-student" className="label">Candidate</label>}
        {!isFaculty && availableStudents.length ? (
          <select
            id="entrance-ticket-student"
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
            No entrance examination hall tickets have been saved yet.
          </p>
        )}
        {isFaculty && !availableStudents.length && (
          <p className="text-sm text-slate-500">No candidate records are available.</p>
        )}
      </div>

      {selectedStudent && displayForm && (isFaculty || savedTicket) ? (
        <div className={`grid items-start gap-5 ${isEditing ? 'xl:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]' : 'grid-cols-1'}`}>
          {isEditing && (
            <section className="no-print card space-y-4 p-5">
              <h2 className="section-title">Hall Ticket Details</h2>
              <div>
                <label htmlFor="entrance-hall-ticket-number" className="label">Hall Ticket Number</label>
                <input id="entrance-hall-ticket-number" className="input-field" value={displayForm.hallTicketNumber || ''} onChange={event => updateForm('hallTicketNumber', event.target.value)} />
              </div>
              <div>
                <label htmlFor="entrance-candidate-name" className="label">Name of Candidate</label>
                <input id="entrance-candidate-name" className="input-field" value={displayForm.name || ''} onChange={event => updateForm('name', event.target.value)} />
              </div>
              <div>
                <label htmlFor="entrance-date-of-birth" className="label">Date of Birth</label>
                <input id="entrance-date-of-birth" type="date" className="input-field" value={displayForm.dateOfBirth || ''} onChange={event => updateForm('dateOfBirth', event.target.value)} />
              </div>
              <div>
                <label htmlFor="entrance-course" className="label">Course Applied</label>
                <input id="entrance-course" className="input-field" value={displayForm.courseApplied || ''} onChange={event => updateForm('courseApplied', event.target.value)} />
              </div>
              <div>
                <label htmlFor="entrance-exam-date-time" className="label">Exam Date &amp; Time</label>
                <input id="entrance-exam-date-time" className="input-field" value={displayForm.examDateTime || ''} onChange={event => updateForm('examDateTime', event.target.value)} />
              </div>
              <div>
                <label htmlFor="entrance-exam-venue" className="label">Exam Venue</label>
                <input id="entrance-exam-venue" className="input-field" value={displayForm.examVenue || ''} onChange={event => updateForm('examVenue', event.target.value)} />
              </div>
              <div>
                <label htmlFor="entrance-candidate-photo" className="label">Candidate Photo</label>
                <input id="entrance-candidate-photo" type="file" accept="image/*" className="input-field" onChange={handlePhotoChange} />
                <p className="mt-1 text-xs text-slate-400">Image files up to 1 MB.</p>
              </div>
              <div>
                <label htmlFor="entrance-candidate-signature" className="label">Candidate Signature</label>
                <input id="entrance-candidate-signature" type="file" accept="image/*" className="input-field" onChange={handleSignatureChange} />
                <p className="mt-1 text-xs text-slate-400">Image files up to 1 MB.</p>
              </div>
            </section>
          )}

          <article className="entrance-ticket min-w-0 w-full rounded-2xl border-[7px] border-[#14528a] bg-[#d0eafb] p-2 text-[#17456c] shadow-sm">
            <div className="overflow-hidden rounded-xl border border-[#8cb7d4] bg-white">
              <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-white px-3 py-3 sm:gap-4 sm:px-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#1b547d] text-center text-[9px] font-black leading-tight text-[#1b547d] sm:h-16 sm:w-16 sm:text-xs">
                  KVELL
                </div>
                <div className="min-w-0 text-center">
                  <h2 className="text-xs font-extrabold leading-tight sm:text-lg">
                    KARPAGA VINAYAGA COLLEGE OF ENGINEERING AND TECHNOLOGY.
                  </h2>
                  <p className="text-[9px] font-semibold sm:text-xs">(Approved by AICTE, New Delhi, Accredited by NAAC)</p>
                  <p className="mt-0.5 text-[9px] font-bold leading-tight sm:text-sm">
                    KARPAGA VINAYAGA EDUCATIONAL LORE FOR LEARNING (DEEMED TO BE UNIVERSITY)
                  </p>
                  <p className="text-[8px] leading-relaxed sm:text-xs">
                    GST Road, Chinnakolambakkam, Padalam – 603 308, Madurantakam (Tk), Chengalpattu District
                    <br />044 - 7156 6373 or email us at kvelladmission2026@gmail.com
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#1b547d] text-center text-[8px] font-black leading-tight text-[#1b547d] sm:h-16 sm:w-16 sm:text-[10px]">
                  KVELL
                </div>
              </header>

              <h3 className="bg-white px-3 pb-1 text-center text-sm font-extrabold leading-tight sm:px-5 sm:text-2xl">
                ENTRANCE EXAMINATION 2026 - HALL TICKET
              </h3>

              <div className="grid grid-cols-1 gap-2 px-2 pb-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,22%)] sm:gap-3 sm:px-4 sm:pb-4">
                <div className="grid grid-cols-1 overflow-hidden border border-black sm:grid-cols-3">
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">Hall Ticket Number</p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">{displayForm.hallTicketNumber || ' '}</p>
                  </div>
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">Name of Candidate</p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">{displayForm.name || ' '}</p>
                  </div>
                  <div className="border-b border-black sm:border-b-0">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">Date of Birth</p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">{displayDate(displayForm.dateOfBirth) || ' '}</p>
                  </div>
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">Course Applied</p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">{displayForm.courseApplied || ' '}</p>
                  </div>
                  <div className="border-b border-black sm:border-r">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">Exam Date &amp; Time</p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">{displayForm.examDateTime || ' '}</p>
                  </div>
                  <div className="border-b border-black sm:border-b-0">
                    <p className="bg-[#c6e7f5] px-2 py-1 text-center text-xs font-bold">Exam Venue</p>
                    <p className="min-h-8 border-t border-black px-2 py-2 text-xs">{displayForm.examVenue || ' '}</p>
                  </div>
                  <div className="col-span-full px-2 py-2 text-[10px] leading-relaxed sm:text-xs">
                    <p className="font-bold">Important Instructions:</p>
                    <p>{IMPORTANT_INSTRUCTIONS}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-1 sm:gap-1">
                  <div className="flex h-32 items-center justify-center border border-black bg-white text-center text-xs font-bold sm:h-28 md:h-36">
                    {displayForm.photo ? (
                      <img src={displayForm.photo} alt={`Candidate ${displayForm.name}`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex flex-col items-center"><UserRound size={24} className="mb-1" />PHOTO</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="h-7 rounded-lg border border-black bg-white">
                      {displayForm.signature && (
                        <img src={displayForm.signature} alt={`Signature of ${displayForm.name}`} className="h-full w-full rounded-lg object-contain" />
                      )}
                    </div>
                    <p className="text-[10px] font-bold sm:text-xs">Candidate Signature</p>
                  </div>
                  <div className="col-span-2 text-center sm:col-span-1 sm:mt-auto">
                    <div className="h-7 rounded-lg border border-black bg-white" />
                    <p className="text-[10px] font-bold sm:text-xs">Nodal Officer-KVELL</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : selectedStudent && !isFaculty ? (
        <p className="card p-5 text-sm text-slate-500">
          No entrance examination hall ticket has been saved for this student.
        </p>
      ) : null}
    </div>
  );
}
