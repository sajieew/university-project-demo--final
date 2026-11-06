import { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { readSheet } from 'read-excel-file/browser';
import { readFirstSheet } from 'xls-reader';
import { useApp } from '../context/AppContext';
import { BRANCH_CONFIG } from '../utils/demoData';
import {
  KEYS,
  deleteProvisionalAllotment,
  deleteProvisionalAllotmentUpload,
  getProvisionalAllotmentUpload,
  getProvisionalAllotments,
  insertProvisionalAllotment,
  replaceProvisionalAllotments,
  saveModuleUploadFile,
  saveProvisionalAllotmentUpload,
  updateProvisionalAllotment,
} from '../utils/localStorage';

const IDENTIFIER_HEADERS = [
  'applicationno', 'applicationnumber', 'applicationid', 'appno',
  'admissionno', 'admissionnumber', 'admissionid', 'admno',
  'registerno', 'registernumber', 'studentid', 'rollno', 'rollnumber',
  'hallticketno', 'hallticketnumber',
];
const NAME_HEADERS = ['name', 'studentname', 'nameofcandidate', 'nameofstudent', 'candidatename'];
const DEFAULT_MANUAL_HEADERS = [
  'Name',
  'Application No.',
  'Admission No.',
  'Register Number',
  'Course Allotted',
];

const normalizeHeader = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const normalizeIdentifier = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const cellToString = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
};

const createId = () => globalThis.crypto?.randomUUID?.()
  || `allotment-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getAcademicYearOptions = (students, allotments) => {
  const currentYear = new Date().getFullYear();
  const startYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
  const currentYears = Array.from({ length: 7 }, (_, index) => {
    const year = startYear - index;
    return `${year}-${String(year + 1).slice(-2)}`;
  });
  return [...new Set([
    ...currentYears,
    ...students.map(student => student.academicYear),
    ...allotments.map(item => item.academicYear),
  ].filter(Boolean))].sort((a, b) => b.localeCompare(a));
};

const makeUniqueHeaders = (headerCells) => {
  const counts = new Map();
  return headerCells.reduce((headers, cell, index) => {
    const base = cellToString(cell);
    if (!base || counts.has(base)) return headers;
    counts.set(base, true);
    headers.push({ name: base, index });
    return headers;
  }, []);
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
  const headerIndex = rows.findIndex(row => row.some(value => cellToString(value)));
  if (headerIndex < 0) throw new Error('The selected worksheet is empty.');

  const columns = makeUniqueHeaders(rows[headerIndex]);
  const headers = columns.map(column => column.name);
  const dataRows = rows.slice(headerIndex + 1)
    .map(row => Object.fromEntries(columns.map(({ name, index }) => [name, cellToString(row[index])])))
    .filter(row => Object.values(row).some(Boolean));

  if (!dataRows.length) throw new Error('The worksheet has a header row but no allotment records.');
  return { headers, dataRows };
};

const getRowValue = (rowData, aliases) => {
  const header = Object.keys(rowData).find(key => aliases.includes(normalizeHeader(key)));
  return header ? rowData[header] : '';
};

const getStudentIdentifier = (rowData) => getRowValue(rowData, IDENTIFIER_HEADERS);

const getMatchingStudent = (rowData, students, department, academicYear) => {
  const candidates = students.filter(student =>
    student.branch === department && student.academicYear === academicYear
  );
  const identifier = normalizeIdentifier(getStudentIdentifier(rowData));

  if (identifier) {
    const matchingStudent = candidates.find(student =>
      [student.applicationNo, student.admissionNo, student.registerNo]
        .some(value => normalizeIdentifier(value) === identifier)
    );
    if (matchingStudent) return matchingStudent;
  }

  const name = normalizeIdentifier(getRowValue(rowData, NAME_HEADERS));
  if (!name) return null;
  const matchingStudents = candidates.filter(student => normalizeIdentifier(student.name) === name);
  return matchingStudents.length === 1 ? matchingStudents[0] : null;
};

const makeIdentityKey = (rowData, student) => {
  if (student) return `student:${student.id}`;
  const identifier = normalizeIdentifier(getStudentIdentifier(rowData));
  if (identifier) return `identifier:${identifier}`;
  const normalizedRow = Object.entries(rowData)
    .map(([header, value]) => [normalizeHeader(header), normalizeIdentifier(value)])
    .sort(([headerA], [headerB]) => headerA.localeCompare(headerB));
  return `row:${JSON.stringify(normalizedRow)}`;
};

const makeImportRecord = (rowData, headers, department, academicYear, fileName, students) => {
  const student = getMatchingStudent(rowData, students, department, academicYear);
  const now = new Date().toISOString();
  return {
    id: createId(),
    department,
    academicYear,
    identityKey: makeIdentityKey(rowData, student),
    studentId: student?.id || '',
    studentName: student?.name || getRowValue(rowData, NAME_HEADERS),
    studentIdentifier: student
      ? student.applicationNo || student.admissionNo || student.registerNo || getStudentIdentifier(rowData)
      : getStudentIdentifier(rowData),
    headers,
    rowData,
    fileName,
    createdAt: now,
    updatedAt: now,
  };
};

const recordKey = (record) =>
  `${record.department}\u0000${record.academicYear}\u0000${record.identityKey}`;

export default function ProvisionalAllotmentPage() {
  const { students, showToast } = useApp();
  const fileInputRef = useRef(null);
  const [allotments, setAllotments] = useState(() => getProvisionalAllotments());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [studentNameSearch, setStudentNameSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingUploadedFile, setIsDeletingUploadedFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [editedRow, setEditedRow] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualRow, setManualRow] = useState({});
  const [manualAfterRecordId, setManualAfterRecordId] = useState('');

  const departmentOptions = useMemo(() => [...new Set([
    ...BRANCH_CONFIG.map(branch => branch.name),
    ...students.map(student => student.branch),
    ...allotments.map(item => item.department),
  ].filter(Boolean))].sort(), [allotments, students]);
  const academicYearOptions = useMemo(
    () => getAcademicYearOptions(students, allotments),
    [allotments, students]
  );
  const scopedAllotments = useMemo(() => allotments.filter(item =>
    item.department === department
    && item.academicYear === academicYear
    && item.rowData
    && !item.fileData
  ), [academicYear, allotments, department]);
  const savedUploadReference = department && academicYear
    ? uploadedFiles.find(item => item.department === department && item.academicYear === academicYear)
      || getProvisionalAllotmentUpload(department, academicYear)
    : null;
  const uploadedFileName = savedUploadReference?.fileName
    || scopedAllotments.find(item => item.fileName && item.fileName !== 'Manually added')?.fileName
    || '';
  const displayedAllotments = useMemo(() => scopedAllotments.filter(item =>
    !uploadedFileName || item.fileName === uploadedFileName
  ), [scopedAllotments, uploadedFileName]);
  const matchingAllotments = useMemo(() => {
    const query = studentNameSearch.trim().toLowerCase();
    if (!query) return displayedAllotments;
    return displayedAllotments.filter(record => {
      const linkedStudent = students.find(student => student.id === record.studentId);
      const name = getRowValue(record.rowData, NAME_HEADERS) || linkedStudent?.name || record.studentName || '';
      return name.toLowerCase().includes(query);
    });
  }, [displayedAllotments, studentNameSearch, students]);
  const displayedHeaders = displayedAllotments[0]?.headers || DEFAULT_MANUAL_HEADERS;
  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setMessage(null);
    if (file && !/\.(xlsx|xls)$/i.test(file.name)) {
      setSelectedFile(null);
      event.target.value = '';
      setMessage({ type: 'error', text: 'Choose a student spreadsheet in .xlsx or .xls format.' });
      return;
    }
    setSelectedFile(file);
    if (file) handleUpload(file);
  };

  const handleUpload = async (file = selectedFile) => {
    if (!department || !academicYear || !file) {
      setMessage({ type: 'error', text: 'Select a department, academic year, and file before uploading.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);
    try {
      const { headers, dataRows } = await readSpreadsheet(file);
      const incoming = dataRows.map(row =>
        makeImportRecord(row, headers, department, academicYear, file.name, students)
      );
      const existingKeys = new Set(
        getProvisionalAllotments()
          .filter(item =>
            item.department === department
            && item.academicYear === academicYear
            && item.fileName !== 'Manually added'
          )
          .map(recordKey)
      );
      const uniqueIncoming = [...new Map(incoming.map(record => [recordKey(record), record])).values()];
      const updatedCount = uniqueIncoming.filter(record => existingKeys.has(recordKey(record))).length;
      await saveModuleUploadFile(KEYS.PROVISIONAL_ALLOTMENTS, department, academicYear, file);
      const saved = replaceProvisionalAllotments(uniqueIncoming);
      const savedFiles = saveProvisionalAllotmentUpload(department, academicYear, file.name);
      setAllotments(saved);
      setUploadedFiles(savedFiles);
      setEditingId('');
      setEditedRow(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage({
        type: 'success',
        text: `Uploaded ${uniqueIncoming.length} student record${uniqueIncoming.length === 1 ? '' : 's'}: ${uniqueIncoming.length - updatedCount} new, ${updatedCount} updated.`,
      });
      showToast('Provisional allotment spreadsheet uploaded successfully.', 'success');
    } catch (error) {
      console.error('Unable to upload provisional allotment spreadsheet.', error);
      const text = error instanceof Error
        ? `Upload failed: ${error.message}`
        : 'Upload failed while reading or saving the Excel workbook.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUploadedFile = async () => {
    if (!window.confirm('Delete the uploaded file and its student records?')) return;
    setIsDeletingUploadedFile(true);
    try {
      const { allotments: savedAllotments, files: savedFiles } =
        await deleteProvisionalAllotmentUpload(department, academicYear);
      setAllotments(savedAllotments);
      setUploadedFiles(savedFiles);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage({ type: 'success', text: 'Uploaded file and its student records were removed.' });
      showToast('Uploaded file and its student records were removed.', 'success');
    } catch (error) {
      console.error('Unable to delete provisional allotment file.', error);
      const text = error instanceof Error ? error.message : 'Unable to delete the uploaded file.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    } finally {
      setIsDeletingUploadedFile(false);
    }
  };

  const startEditing = (record) => {
    setEditingId(record.id);
    setEditedRow({ ...record.rowData });
    setMessage(null);
  };

  const saveEditedRecord = (record) => {
    if (!editedRow) return;
    try {
      const linkedStudent = students.find(student => student.id === record.studentId);
      const saved = updateProvisionalAllotment({
        ...record,
        rowData: editedRow,
        identityKey: makeIdentityKey(editedRow, linkedStudent),
        studentName: getRowValue(editedRow, NAME_HEADERS) || record.studentName,
        studentIdentifier: getStudentIdentifier(editedRow) || record.studentIdentifier,
        updatedAt: new Date().toISOString(),
      });
      setAllotments(saved);
      setEditingId('');
      setEditedRow(null);
      setMessage({ type: 'success', text: 'Provisional allotment record updated.' });
      showToast('Provisional allotment record updated.', 'success');
    } catch (error) {
      console.error('Unable to update provisional allotment record.', error);
      const text = error instanceof Error ? error.message : 'Unable to update the provisional allotment record.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    }
  };

  const saveManualStudent = (event) => {
    event.preventDefault();
    if (!manualRow.name.trim() || !manualRow.applicationNumber.trim()) {
      setMessage({ type: 'error', text: 'Enter the student name before saving.' });
      return;
    }

    try {
      const rowData = Object.fromEntries(DEFAULT_MANUAL_HEADERS.map(header => [header, '']));
      rowData.Name = manualRow.name.trim();
      rowData['Application No.'] = manualRow.applicationNumber.trim();
      const record = makeImportRecord(
        rowData,
        DEFAULT_MANUAL_HEADERS,
        manualRow.department,
        manualRow.academicYear,
        'Manually added',
        students
      );
      const saved = insertProvisionalAllotment(record, {
        type: 'after',
        recordId: manualAfterRecordId,
      });
      setAllotments(saved);
      setManualRow({});
      setShowManualForm(false);
      setManualAfterRecordId('');
      setMessage({ type: 'success', text: 'Student provisional allotment details saved.' });
      showToast('Student provisional allotment details saved.', 'success');
    } catch (error) {
      console.error('Unable to save manual provisional allotment.', error);
      const text = error instanceof Error ? error.message : 'Unable to save student details.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    }
  };

  const handleDeleteStudent = (record) => {
    const name = getRowValue(record.rowData, NAME_HEADERS) || record.studentName || 'this student';
    if (!window.confirm(`Delete ${name} from the provisional allotment records?`)) return;

    try {
      const saved = deleteProvisionalAllotment(record.id);
      setAllotments(saved);
      if (editingId === record.id) {
        setEditingId('');
        setEditedRow(null);
      }
      setMessage({ type: 'success', text: `${name} was deleted.` });
      showToast(`${name} was deleted.`, 'success');
    } catch (error) {
      console.error('Unable to delete provisional allotment record.', error);
      const text = error instanceof Error ? error.message : 'Unable to delete the selected student.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Provisional Allotment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload and manage provisional allotment records by department and academic year.
        </p>
      </div>

      <section className="card space-y-5 p-5">
        <h2 className="section-title">1. Select Department &amp; Academic Year</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="allotment-department" className="label">Select Department</label>
            <select
              id="allotment-department"
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
            <label htmlFor="allotment-year" className="label">Select Academic Year</label>
            <select
              id="allotment-year"
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
          <p className="mt-1 text-xs text-slate-500">Upload a student spreadsheet or add student details manually.</p>
        </div>

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
          {uploadedFileName && (
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
        </div>
        <p className="text-xs text-slate-400">Supported spreadsheet formats: .xlsx and .xls.</p>

        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              message.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {message.type === 'error' ? <AlertCircle size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Student Records</h3>
            <p className="mt-1 text-xs text-slate-500">
              {department && academicYear ? `${department} · ${academicYear}` : 'Select a department and year to view records'}
            </p>
          </div>
          {department && academicYear && (
            <input
              type="search"
              className="input-field w-full max-w-xs"
              placeholder="Search student name"
              aria-label="Search student name"
              value={studentNameSearch}
              onChange={event => setStudentNameSearch(event.target.value)}
            />
          )}
          {department && academicYear && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {matchingAllotments.length} record{matchingAllotments.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {!department || !academicYear ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Choose a department and academic year to see student allotment details.
          </p>
        ) : displayedAllotments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No student records have been added for this selection.
          </p>
        ) : matchingAllotments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No student records found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">S.No.</th>
                  <th scope="col" className="px-4 py-3">Student Record</th>
                  {displayedHeaders.map(header => <th scope="col" key={header} className="px-4 py-3">{header}</th>)}
                  <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matchingAllotments.map((record, index) => {
                  const isEditing = editingId === record.id;
                  const linkedStudent = students.find(student => student.id === record.studentId);
                  return (
                    <tr key={record.id} className="align-top text-slate-700">
                      <td className="px-4 py-3 font-medium">{index + 1}</td>
                      <td className="max-w-56 px-4 py-3">
                        <p className="font-medium">{getRowValue(record.rowData, NAME_HEADERS) || linkedStudent?.name || record.studentName || 'Not linked to a student'}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {getStudentIdentifier(record.rowData)
                            || linkedStudent?.applicationNo
                            || linkedStudent?.admissionNo
                            || linkedStudent?.registerNo
                            || record.studentIdentifier
                            || 'No matching identifier'}
                        </p>
                      </td>
                      {displayedHeaders.map(header => (
                        <td key={header} className="max-w-64 px-4 py-3">
                          {isEditing ? (
                            <input
                              aria-label={`${header} for ${record.studentName || record.studentIdentifier || 'record'}`}
                              className="input-field min-w-40 py-1.5 text-xs"
                              value={editedRow?.[header] || ''}
                              onChange={event => setEditedRow(current => ({ ...current, [header]: event.target.value }))}
                            />
                          ) : (
                            record.rowData?.[header] || '—'
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button type="button" className="btn-primary btn-sm" onClick={() => saveEditedRecord(record)} aria-label="Save changes">
                                <Save size={13} /> Save
                              </button>
                              <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={() => {
                                  setEditingId('');
                                  setEditedRow(null);
                                }}
                                aria-label="Cancel editing"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="btn-secondary btn-sm" onClick={() => startEditing(record)}>
                                <Pencil size={13} /> Edit
                              </button>
                              <button
                                type="button"
                                className="btn-secondary btn-sm text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteStudent(record)}
                                aria-label={`Delete ${getRowValue(record.rowData, NAME_HEADERS) || record.studentName || 'student'}`}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                              <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={() => {
                                  setManualAfterRecordId(record.id);
                                  setManualRow({
                                    name: '',
                                    applicationNumber: '',
                                    academicYear,
                                    department,
                                  });
                                  setShowManualForm(true);
                                  setMessage(null);
                                }}
                              >
                                <Plus size={13} /> Add Student
                              </button>
                            </>
                          )}
                        </div>
                        <p className="mt-1 max-w-48 truncate text-[10px] text-slate-400" title={record.fileName}>
                          {record.fileName}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {showManualForm && (
          <form onSubmit={saveManualStudent} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Add Student Details</h3>
              <p className="text-xs text-slate-500">
                Insert below {getRowValue(
                  displayedAllotments.find(record => record.id === manualAfterRecordId)?.rowData || {},
                  NAME_HEADERS
                ) || 'selected student'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="manual-serial-number" className="label">Serial Number</label>
                <input
                  id="manual-serial-number"
                  className="input-field"
                  value={Math.max(0, displayedAllotments.findIndex(record => record.id === manualAfterRecordId) + 2)}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="manual-student-name" className="label">Student Name</label>
                <input
                  id="manual-student-name"
                  className="input-field"
                  value={manualRow.name || ''}
                  required
                  onChange={event => setManualRow(current => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="manual-application-number" className="label">Application Number</label>
                <input
                  id="manual-application-number"
                  className="input-field"
                  value={manualRow.applicationNumber || ''}
                  required
                  onChange={event => setManualRow(current => ({ ...current, applicationNumber: event.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="manual-academic-year" className="label">Academic Year</label>
                <input
                  id="manual-academic-year"
                  className="input-field"
                  value={manualRow.academicYear || ''}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="manual-department" className="label">Department</label>
                <select id="manual-department" className="input-field" value={manualRow.department || ''} disabled>
                  <option value={manualRow.department || ''}>{manualRow.department || department}</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setShowManualForm(false);
                  setManualAfterRecordId('');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary btn-sm">
                <Save size={14} /> Save Student
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
