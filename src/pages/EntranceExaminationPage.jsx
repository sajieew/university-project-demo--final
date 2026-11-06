import { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { readSheet } from 'read-excel-file/browser';
import { readFirstSheet } from 'xls-reader';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BRANCH_CONFIG } from '../utils/demoData';
import {
  KEYS,
  deleteEntranceExaminationRecord,
  deleteEntranceExaminationUpload,
  getEntranceExaminationUpload,
  getEntranceExaminationTickets,
  insertEntranceExaminationRecord,
  saveModuleUploadFile,
  saveEntranceExaminationUpload,
  saveEntranceExaminationRecords,
  updateEntranceExaminationRecord,
} from '../utils/localStorage';

const ENTRANCE_COLUMNS = [
  {
    key: 'name',
    label: 'Student Name',
    aliases: ['studentname', 'name', 'nameofstudent', 'nameofcandidate', 'candidatename'],
  },
  {
    key: 'hallTicketNumber',
    label: 'Hall Ticket Number',
    aliases: ['hallticketnumber', 'hallticketno', 'hallticket', 'ticketnumber'],
  },
  {
    key: 'numberOfCandidates',
    label: 'Number of Candidates',
    aliases: ['numberofcandidates', 'noofcandidates', 'candidatecount', 'candidates'],
  },
  {
    key: 'dateOfBirth',
    label: 'Date of Birth',
    aliases: ['dateofbirth', 'dob', 'birthdate'],
  },
  {
    key: 'courseApplied',
    label: 'Course Applied',
    aliases: ['courseapplied', 'course', 'programme', 'program'],
  },
  {
    key: 'examDate',
    label: 'Exam Date',
    aliases: ['examdate', 'dateofexam'],
  },
  {
    key: 'examTime',
    label: 'Exam Time',
    aliases: ['examtime', 'timeofexam'],
  },
  {
    key: 'examVenue',
    label: 'Exam Venue',
    aliases: ['examvenue', 'venue', 'examinationvenue'],
  },
];

const normalizeHeader = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const normalizeIdentifier = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const mapSpreadsheetFields = (headers, values) => Object.fromEntries(ENTRANCE_COLUMNS.map(column => {
  const index = headers.findIndex(header => column.aliases.includes(normalizeHeader(header)));
  return [column.key, values[index] || ''];
}));
const createId = () => globalThis.crypto?.randomUUID?.()
  || `entrance-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const cellToString = (value, key) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    return key === 'examTime'
      ? value.toISOString().slice(11, 16)
      : value.toISOString().slice(0, 10);
  }
  if (typeof value === 'number' && key === 'examTime') {
    const minutes = Math.round(value * 24 * 60) % (24 * 60);
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  }
  return String(value).trim();
};

const readSpreadsheet = async (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let rows;

  if (extension === 'xls') {
    const sheet = readFirstSheet(await file.arrayBuffer());
    rows = sheet?.rows;
  } else {
    rows = await readSheet(file);
  }

  if (!rows?.length) throw new Error('The selected workbook does not contain a readable worksheet.');
  const headerIndex = rows.findIndex(row => row.some(value => String(value ?? '').trim()));
  if (headerIndex < 0) throw new Error('The selected worksheet is empty.');

  const headers = rows[headerIndex].map(value => value === null || value === undefined ? '' : String(value));
  const records = rows.slice(headerIndex + 1)
    .map(row => {
      const spreadsheetValues = headers.map((header, index) => cellToString(row[index]));
      if (spreadsheetValues.every(value => !value)) return null;
      const record = mapSpreadsheetFields(headers, spreadsheetValues);
      ENTRANCE_COLUMNS.forEach(column => {
        const index = headers.findIndex(header => column.aliases.includes(normalizeHeader(header)));
        if (index >= 0) record[column.key] = cellToString(row[index], column.key);
      });
      return { ...record, spreadsheetHeaders: headers, spreadsheetValues };
    })
    .filter(Boolean);

  if (!records.length) throw new Error('The worksheet has a header row but no student records.');
  return { headers, records };
};

const makeRecord = (record, department, academicYear, fileName) => ({
  ...record,
  id: createId(),
  department,
  academicYear,
  fileName,
  identityKey: normalizeIdentifier(record.hallTicketNumber) || JSON.stringify(record.spreadsheetValues),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const getAcademicYearOptions = (students, records) => {
  const currentYear = new Date().getFullYear();
  const startYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
  const currentYears = Array.from({ length: 7 }, (_, index) => {
    const year = startYear - index;
    return `${year}-${String(year + 1).slice(-2)}`;
  });

  return [...new Set([
    ...currentYears,
    ...students.map(student => student.academicYear),
    ...records.map(record => record.academicYear),
  ].filter(Boolean))].sort((a, b) => b.localeCompare(a));
};

const getLegacyRecord = (ticket, students) => {
  const student = students.find(item => item.id === ticket.studentId);
  if (!student) return null;
  const [examDate = '', examTime = ''] = (ticket.examDateTime || '').split('T');
  return {
    ...ticket,
    department: student.branch,
    academicYear: student.academicYear,
    name: ticket.name || student.name || '',
    hallTicketNumber: ticket.hallTicketNumber || '',
    numberOfCandidates: '',
    dateOfBirth: ticket.dateOfBirth || student.dob || '',
    courseApplied: ticket.courseApplied || '',
    examDate,
    examTime,
    examVenue: ticket.examVenue || '',
  };
};

export default function EntranceExaminationPage() {
  const { user } = useAuth();
  const { students, showToast } = useApp();
  const canManageRecords = user?.role === 'Faculty' || user?.role === 'Admin';
  const fileInputRef = useRef(null);
  const [records, setRecords] = useState(() => getEntranceExaminationTickets());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingUploadedFile, setIsDeletingUploadedFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [editedRecord, setEditedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState(null);
  const [newRecordAfterId, setNewRecordAfterId] = useState(null);

  const departmentOptions = useMemo(() => [...new Set([
    ...BRANCH_CONFIG.map(branch => branch.name),
    ...students.map(student => student.branch),
    ...records.map(record => record.department),
  ].filter(Boolean))].sort(), [records, students]);
  const academicYearOptions = useMemo(
    () => getAcademicYearOptions(students, records),
    [records, students]
  );
  const savedUploadReference = department && academicYear
    ? uploadedFiles.find(item => item.department === department && item.academicYear === academicYear)
      || getEntranceExaminationUpload(department, academicYear)
    : null;
  const uploadedFileName = savedUploadReference?.fileName || '';
  const displayedRecords = useMemo(() => {
    const legacy = records
      .filter(record => !record.department || !record.academicYear)
      .map(record => getLegacyRecord(record, students))
      .filter(Boolean);
    return [...records.filter(record => record.department && record.academicYear), ...legacy]
      .filter(record =>
        record.department === department
        && record.academicYear === academicYear
        && (!uploadedFileName || !record.fileName || record.fileName === 'Manually added' || record.fileName === uploadedFileName)
      );
  }, [academicYear, department, records, students, uploadedFileName]);
  const displayedHeaders = displayedRecords.find(record => record.fileName === uploadedFileName)?.spreadsheetHeaders
    || displayedRecords.find(record => record.spreadsheetHeaders)?.spreadsheetHeaders
    || ENTRANCE_COLUMNS.map(column => column.label);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(null);
    if (file && !/\.(xlsx|xls)$/i.test(file.name)) {
      setSelectedFile(null);
      event.target.value = '';
      setMessage({ type: 'error', text: 'Choose a student spreadsheet in .xlsx or .xls format.' });
      return;
    }
    if (file) handleUpload(file);
  };

  const handleUpload = async (file = selectedFile) => {
    if (!canManageRecords) return;
    if (!department || !academicYear || !file) {
      setMessage({ type: 'error', text: 'Select a department, academic year, and spreadsheet before uploading.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);
    try {
      const { records: spreadsheetRecords } = await readSpreadsheet(file);
      const uniqueRecords = [...new Map(
        spreadsheetRecords.map(record => {
          const entry = makeRecord(record, department, academicYear, file.name);
          return [`${entry.department}\u0000${entry.academicYear}\u0000${entry.identityKey}`, entry];
        })
      ).values()];
      const existingKeys = new Set(
        records
          .filter(record => record.department === department && record.academicYear === academicYear)
          .map(record => `${record.department}\u0000${record.academicYear}\u0000${record.identityKey}`)
      );
      const updatedCount = uniqueRecords.filter(record =>
        existingKeys.has(`${record.department}\u0000${record.academicYear}\u0000${record.identityKey}`)
      ).length;
      await saveModuleUploadFile(KEYS.ENTRANCE_EXAMINATION_TICKETS, department, academicYear, file);
      const saved = saveEntranceExaminationRecords(uniqueRecords, user.role);
      const savedFiles = saveEntranceExaminationUpload(department, academicYear, file.name);
      setRecords(saved);
      setUploadedFiles(savedFiles);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const successMessage = `Uploaded ${uniqueRecords.length} student record${uniqueRecords.length === 1 ? '' : 's'}: ${uniqueRecords.length - updatedCount} new, ${updatedCount} updated.`;
      setMessage({ type: 'success', text: successMessage });
      setEditingId('');
      setEditedRecord(null);
      showToast('Entrance examination spreadsheet uploaded successfully.', 'success');
    } catch (error) {
      console.error('Unable to upload entrance examination spreadsheet.', error);
      const errorMessage = error instanceof Error
        ? `Upload failed: ${error.message}`
        : 'Upload failed while reading or saving the spreadsheet.';
      setMessage({ type: 'error', text: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUploadedFile = async () => {
    const hasUploadedFile = Boolean(uploadedFileName);
    const confirmation = 'Delete the uploaded file and all Entrance Examination student records?';
    if (!window.confirm(confirmation)) return;
    setIsDeletingUploadedFile(true);
    try {
      const { records: savedRecords, files: savedFiles } =
        await deleteEntranceExaminationUpload();
      setRecords(savedRecords);
      setUploadedFiles(savedFiles);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const successMessage = hasUploadedFile
        ? 'Uploaded file and all Entrance Examination student records were removed.'
        : 'Entrance Examination student records and selected file were cleared.';
      setMessage({ type: 'success', text: successMessage });
      showToast(successMessage, 'success');
    } catch (error) {
      console.error('Unable to delete entrance examination file.', error);
      const text = error instanceof Error ? error.message : 'Unable to delete the uploaded file.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    } finally {
      setIsDeletingUploadedFile(false);
    }
  };

  const saveEditedRecord = () => {
    if (!editedRecord) return;
    try {
      const mappedFields = editedRecord.spreadsheetHeaders
        ? mapSpreadsheetFields(editedRecord.spreadsheetHeaders, editedRecord.spreadsheetValues)
        : {};
      const saved = updateEntranceExaminationRecord({
        ...editedRecord,
        ...mappedFields,
        identityKey: normalizeIdentifier(editedRecord.hallTicketNumber)
          || JSON.stringify(editedRecord.spreadsheetValues || []),
        updatedAt: new Date().toISOString(),
      }, user.role);
      setRecords(saved);
      setEditingId('');
      setEditedRecord(null);
      setMessage({ type: 'success', text: 'Entrance examination record updated.' });
      showToast('Entrance examination record updated.', 'success');
    } catch (error) {
      console.error('Unable to update entrance examination record.', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unable to update entrance examination record.';
      setMessage({ type: 'error', text: errorMessage });
      showToast(errorMessage, 'error');
    }
  };

  const startAddRecord = (afterId = null) => {
    setEditingId('');
    setEditedRecord(null);
    setNewRecordAfterId(afterId);
    setNewRecord({
      spreadsheetHeaders: displayedHeaders,
      spreadsheetValues: displayedHeaders.map(() => ''),
    });
    setMessage(null);
  };

  const saveNewRecord = event => {
    event.preventDefault();
    if (!newRecord || !department || !academicYear) return;
    if (!newRecord.spreadsheetValues.some(value => String(value ?? '').trim())) {
      setMessage({ type: 'error', text: 'Enter at least one student detail.' });
      return;
    }
    try {
      const mappedFields = mapSpreadsheetFields(newRecord.spreadsheetHeaders, newRecord.spreadsheetValues);
      const now = new Date().toISOString();
      const entry = {
        ...mappedFields,
        ...newRecord,
        id: createId(),
        department,
        academicYear,
        fileName: 'Manually added',
        identityKey: normalizeIdentifier(mappedFields.hallTicketNumber)
          || JSON.stringify(newRecord.spreadsheetValues),
        createdAt: now,
        updatedAt: now,
      };
      setRecords(insertEntranceExaminationRecord(entry, user.role, newRecordAfterId));
      setNewRecord(null);
      setNewRecordAfterId(null);
      setMessage({ type: 'success', text: 'Entrance examination record added.' });
      showToast('Entrance examination record added.', 'success');
    } catch (error) {
      console.error('Unable to add entrance examination record.', error);
      const text = error instanceof Error ? error.message : 'Unable to add entrance examination record.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    }
  };

  const handleDeleteRecord = record => {
    const name = record.name || record.studentName || 'this student';
    if (!window.confirm(`Delete ${name} from the entrance examination records?`)) return;
    try {
      setRecords(deleteEntranceExaminationRecord(record.id, user.role));
      if (editingId === record.id) {
        setEditingId('');
        setEditedRecord(null);
      }
      setMessage({ type: 'success', text: `${name} was deleted.` });
      showToast(`${name} was deleted.`, 'success');
    } catch (error) {
      console.error('Unable to delete entrance examination record.', error);
      const text = error instanceof Error ? error.message : 'Unable to delete the selected student.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Entrance Examination</h1>
        <p className="mt-1 text-sm text-slate-500">Upload and view student entrance examination details.</p>
      </div>

      <section className="card space-y-5 p-5">
        <h2 className="section-title">1. Select Department &amp; Academic Year</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="entrance-department" className="label">Select Department</label>
            <select
              id="entrance-department"
              className="input-field"
              value={department}
              onChange={event => {
                setDepartment(event.target.value);
                setMessage(null);
              }}
            >
              <option value="">Choose a department</option>
              {departmentOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="entrance-academic-year" className="label">Select Academic Year</label>
            <select
              id="entrance-academic-year"
              className="input-field"
              value={academicYear}
              onChange={event => {
                setAcademicYear(event.target.value);
                setMessage(null);
              }}
            >
              <option value="">Choose an academic year</option>
              {academicYearOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="card space-y-5 p-5">
        <div>
          <h2 className="section-title">2. Upload Student Spreadsheet</h2>
          <p className="mt-1 text-xs text-slate-500">Upload a student spreadsheet.</p>
        </div>

        {canManageRecords && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="sr-only"
                onChange={handleFileChange}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-500" aria-live="polite">
                {selectedFile
                  ? uploadedFileName ? `Selected: ${selectedFile.name} (replacing ${uploadedFileName})` : selectedFile.name
                  : uploadedFileName || 'No file selected'}
              </span>
              {(selectedFile || uploadedFileName) && (
                <button
                  type="button"
                  className="btn-secondary btn-sm text-red-600"
                  onClick={handleDeleteUploadedFile}
                  disabled={isUploading || isDeletingUploadedFile}
                  aria-label="Delete uploaded file"
                  title="Delete uploaded file"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Delete File
                </button>
              )}
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => selectedFile ? handleUpload() : fileInputRef.current?.click()}
                disabled={isUploading || !department || !academicYear}
              >
                <Upload size={14} />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={startAddRecord}
                disabled={!department || !academicYear || isUploading}
              >
                <Plus size={14} /> Add Student
              </button>
            </div>
            <p className="text-xs text-slate-400">Supported spreadsheet formats: .xlsx and .xls.</p>
          </>
        )}

        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              message.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {message.type === 'error'
              ? <AlertCircle size={17} className="mt-0.5 shrink-0" />
              : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {newRecord && (
          <form onSubmit={saveNewRecord} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-4 font-semibold text-slate-800">Add Student</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {newRecord.spreadsheetHeaders.map((header, columnIndex) => (
                <div key={`${header}-${columnIndex}`}>
                  <label htmlFor={`entrance-new-${columnIndex}`} className="label">{header}</label>
                  <input
                    id={`entrance-new-${columnIndex}`}
                    className="input-field"
                    value={newRecord.spreadsheetValues[columnIndex] || ''}
                    onChange={event => setNewRecord(current => ({
                      ...current,
                      spreadsheetValues: current.spreadsheetValues.map((value, index) =>
                        index === columnIndex ? event.target.value : value
                      ),
                    }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary btn-sm" onClick={() => {
                setNewRecord(null);
                setNewRecordAfterId(null);
              }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary btn-sm">
                <Save size={14} /> Save Student
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Student Examination Records</h3>
              <p className="mt-1 text-xs text-slate-500">
                {department && academicYear
                  ? `${department} · ${academicYear}`
                  : 'Select a department and academic year to view records'}
              </p>
            </div>
            {department && academicYear && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {displayedRecords.length} record{displayedRecords.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {!department || !academicYear ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              Choose a department and academic year to see student examination details.
            </p>
          ) : displayedRecords.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              No examination records have been uploaded for this selection.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">S.No.</th>
                    {displayedHeaders.map((header, columnIndex) => (
                      <th scope="col" key={`${header}-${columnIndex}`} className="px-4 py-3">{header}</th>
                    ))}
                    {canManageRecords && <th scope="col" className="px-4 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedRecords.map((record, index) => {
                    const isEditing = editingId === record.id;
                    return (
                      <tr key={record.id || `${record.hallTicketNumber}-${index}`} className="align-top text-slate-700">
                        <td className="px-4 py-3 font-medium">{index + 1}</td>
                        {displayedHeaders
                          .map((header, columnIndex) => {
                            const column = ENTRANCE_COLUMNS.find(item => item.label === header);
                            const value = record.spreadsheetValues
                              ? record.spreadsheetValues[columnIndex]
                              : record[column?.key];
                            const fieldKey = column?.key || header;
                            return (
                              <td key={`${header}-${columnIndex}`} className="max-w-64 px-4 py-3">
                                {isEditing ? (
                                  <input
                                    aria-label={`${header} for ${record.name || record.hallTicketNumber}`}
                                    type={column?.key === 'dateOfBirth' || column?.key === 'examDate'
                                      ? 'date'
                                      : column?.key === 'examTime' ? 'time' : 'text'}
                                    className="input-field min-w-40 py-1.5 text-xs"
                                    value={record.spreadsheetHeaders
                                      ? editedRecord?.spreadsheetValues?.[columnIndex] || ''
                                      : editedRecord?.[fieldKey] || ''}
                                    onChange={event => setEditedRecord(current => current.spreadsheetHeaders
                                      ? {
                                        ...current,
                                        spreadsheetValues: current.spreadsheetValues.map((item, index) =>
                                          index === columnIndex ? event.target.value : item
                                        ),
                                      }
                                      : { ...current, [fieldKey]: event.target.value })}
                                  />
                                ) : (
                                  value || '—'
                                )}
                              </td>
                            );
                          })}
                        {canManageRecords && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                <button type="button" className="btn-primary btn-sm" onClick={saveEditedRecord}>
                                  <Save size={13} /> Save
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary btn-sm"
                                  onClick={() => {
                                    setEditingId('');
                                    setEditedRecord(null);
                                  }}
                                  aria-label="Cancel editing"
                                >
                                  <X size={13} />
                                </button>
                                </>
                              ) : (
                                <>
                                <button
                                  type="button"
                                  className="btn-secondary btn-sm"
                                  onClick={() => {
                                    setEditingId(record.id);
                                    setEditedRecord({ ...record });
                                    setNewRecord(null);
                                    setMessage(null);
                                  }}
                                >
                                  <Pencil size={13} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary btn-sm text-red-600"
                                  onClick={() => handleDeleteRecord(record)}
                                  aria-label={`Delete ${record.name || record.studentName || 'student'}`}
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary btn-sm"
                                  onClick={() => startAddRecord(record.id)}
                                >
                                  <Plus size={13} /> Add Student
                                </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
