import { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { readSheet } from 'read-excel-file/browser';
import { readFirstSheet } from 'xls-reader';
import { useApp } from '../context/AppContext';
import { BRANCH_CONFIG } from '../utils/demoData';
import {
  KEYS,
  deleteRankStatementRecord,
  deleteRankStatementUpload,
  getRankStatementUpload,
  getRankStatements,
  insertRankStatementRecord,
  mergeRankStatementRecords,
  saveModuleUploadFile,
  saveRankStatementUpload,
  updateRankStatementRecord,
} from '../utils/localStorage';

const RANK_COLUMNS = [
  { key: 'applicationNumber', label: 'Application Number', aliases: ['applicationnumber', 'applicationno', 'applicationid', 'appno', 'application'] },
  { key: 'name', label: 'Name of Candidate', aliases: ['nameofcandidate', 'candidatename', 'studentname', 'name'] },
  { key: 'courseAllotted', label: 'Course Allotted', aliases: ['courseallotted', 'allottedcourse', 'course'] },
  { key: 'randomNumber', label: 'Random Number', aliases: ['randomnumber', 'randomno', 'random'] },
  { key: 'maximumMarks', label: 'Maximum Marks', aliases: ['maximummarks', 'maxmarks', 'maximum'] },
  { key: 'marksObtained', label: 'Marks Obtained', aliases: ['marksobtained', 'markssecured', 'obtainedmarks'] },
  { key: 'marksObtainedInWords', label: 'Marks Obtained in Words', aliases: ['marksobtainedinwords', 'marksinwords'] },
  { key: 'cutOffMarks', label: 'Cutoff Marks', aliases: ['cutoffmarks', 'cutoff', 'cutoffmark'] },
  { key: 'overallRank', label: 'Overall Rank', aliases: ['overallrank', 'rank', 'ranknumber'] },
];

const emptyRankRecord = () => Object.fromEntries(RANK_COLUMNS.map(column => [column.key, '']));
const normalizeHeader = value => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const mapSpreadsheetFields = (headers, values) => Object.fromEntries(RANK_COLUMNS.map(column => {
  const index = headers.findIndex(header => column.aliases.includes(normalizeHeader(header)));
  return [column.key, values[index] || ''];
}));
const createId = () => globalThis.crypto?.randomUUID?.()
  || `rank-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const cellToString = value => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
};

const readSpreadsheet = async file => {
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
  const headers = rows[headerIndex].map(value => value === null || value === undefined ? '' : String(value));
  const records = rows.slice(headerIndex + 1).map(row => {
    const spreadsheetValues = headers.map((header, index) => cellToString(row[index]));
    if (spreadsheetValues.every(value => !value)) return null;
    const record = mapSpreadsheetFields(headers, spreadsheetValues);
    if (!record.applicationNumber) record.applicationNumber = JSON.stringify(spreadsheetValues);
    return { ...record, spreadsheetHeaders: headers, spreadsheetValues };
  }).filter(Boolean);

  if (!records.length) throw new Error('The worksheet has a header row but no rank statement records.');
  return { headers, records };
};

const getAcademicYearOptions = (students, records) => {
  const currentYear = new Date().getFullYear();
  const startYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1;
  const recentYears = Array.from({ length: 7 }, (_, index) => {
    const year = startYear - index;
    return `${year}-${String(year + 1).slice(-2)}`;
  });
  return [...new Set([
    ...recentYears,
    ...students.map(student => student.academicYear),
    ...records.map(record => record.academicYear),
  ].filter(Boolean))].sort((a, b) => b.localeCompare(a));
};

export default function RankStatementPage() {
  const { students, showToast } = useApp();
  const fileInputRef = useRef(null);
  const [records, setRecords] = useState(() => getRankStatements());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(null);
  const [insertAfterId, setInsertAfterId] = useState(null);

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
      || getRankStatementUpload(department, academicYear)
    : null;
  const uploadedFileName = savedUploadReference?.fileName || '';
  const displayedRecords = useMemo(() => records.filter(record =>
    record.department === department
    && record.academicYear === academicYear
    && (!uploadedFileName || !record.fileName || record.fileName === 'Manually added' || record.fileName === uploadedFileName)
  ), [academicYear, department, records, uploadedFileName]);
  const displayedHeaders = displayedRecords.find(record => record.fileName === uploadedFileName)?.spreadsheetHeaders
    || displayedRecords.find(record => record.spreadsheetHeaders)?.spreadsheetHeaders
    || RANK_COLUMNS.map(column => column.label);

  const handleFileChange = event => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(null);
    if (file && !/\.(xlsx|xls)$/i.test(file.name)) {
      setSelectedFile(null);
      event.target.value = '';
      setMessage({ type: 'error', text: 'Choose a rank statement spreadsheet in .xlsx or .xls format.' });
      return;
    }
    if (file) handleUpload(file);
  };

  const handleUpload = async (file = selectedFile) => {
    if (!department || !academicYear || !file) {
      setMessage({ type: 'error', text: 'Select a department, academic year, and spreadsheet before uploading.' });
      return;
    }
    setIsUploading(true);
    setMessage(null);
    try {
      const { records: importedRows } = await readSpreadsheet(file);
      const now = new Date().toISOString();
      const imported = [...new Map(importedRows.map(row => {
        const record = {
          ...row,
          id: createId(),
          department,
          academicYear,
          fileName: file.name,
          createdAt: now,
          updatedAt: now,
        };
        return [`${department}\u0000${academicYear}\u0000${row.applicationNumber.trim().toLowerCase()}`, record];
      })).values()];
      await saveModuleUploadFile(KEYS.RANK_STATEMENTS, department, academicYear, file);
      const saved = mergeRankStatementRecords(imported);
      const savedFiles = saveRankStatementUpload(department, academicYear, file.name);
      setRecords(saved);
      setUploadedFiles(savedFiles);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setEditingId('');
      setForm(null);
      setMessage({ type: 'success', text: `Uploaded ${imported.length} rank statement record${imported.length === 1 ? '' : 's'}.` });
      showToast('Rank statement spreadsheet uploaded successfully.', 'success');
    } catch (error) {
      console.error('Unable to upload rank statement spreadsheet.', error);
      const text = error instanceof Error ? `Upload failed: ${error.message}` : 'Upload failed while reading or saving the spreadsheet.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUploadedFile = async () => {
    const hasUploadedFile = Boolean(uploadedFileName);
    if (!window.confirm('Delete the uploaded file and all Rank Statement student records?')) return;
    setIsDeletingFile(true);
    try {
      const { records: savedRecords, files: savedFiles } =
        await deleteRankStatementUpload();
      setRecords(savedRecords);
      setUploadedFiles(savedFiles);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const text = hasUploadedFile
        ? 'Uploaded file and all Rank Statement student records were removed.'
        : 'Rank Statement student records and selected file were cleared.';
      setMessage({ type: 'success', text });
      showToast(text, 'success');
    } catch (error) {
      console.error('Unable to delete rank statement upload.', error);
      const text = error instanceof Error ? error.message : 'Unable to delete the uploaded file.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    } finally {
      setIsDeletingFile(false);
    }
  };

  const startAdd = afterId => {
    setEditingId('');
    setInsertAfterId(afterId);
    const spreadsheetValues = displayedHeaders.map(() => '');
    setForm({
      ...emptyRankRecord(),
      ...mapSpreadsheetFields(displayedHeaders, spreadsheetValues),
      spreadsheetHeaders: displayedHeaders,
      spreadsheetValues,
      department,
      academicYear,
      fileName: 'Manually added',
    });
    setMessage(null);
  };

  const startEdit = record => {
    setEditingId(record.id);
    setInsertAfterId(null);
    const headers = record.spreadsheetHeaders || RANK_COLUMNS.map(column => column.label);
    const spreadsheetValues = record.spreadsheetValues
      || headers.map(header => record[RANK_COLUMNS.find(column => column.label === header)?.key] || '');
    setForm({ ...record, spreadsheetHeaders: headers, spreadsheetValues });
    setMessage(null);
  };

  const cancelForm = () => {
    setEditingId('');
    setInsertAfterId(null);
    setForm(null);
  };

  const saveForm = event => {
    event.preventDefault();
    if (!form?.spreadsheetValues?.some(value => String(value ?? '').trim())) {
      setMessage({ type: 'error', text: 'Enter at least one student detail.' });
      return;
    }

    try {
      const now = new Date().toISOString();
      const mappedFields = mapSpreadsheetFields(form.spreadsheetHeaders, form.spreadsheetValues);
      const record = {
        ...form,
        ...mappedFields,
        applicationNumber: mappedFields.applicationNumber || JSON.stringify(form.spreadsheetValues),
        updatedAt: now,
      };
      const saved = editingId
        ? updateRankStatementRecord({ ...record, id: editingId })
        : insertRankStatementRecord({
          ...record,
          id: createId(),
          department,
          academicYear,
          createdAt: now,
          updatedAt: now,
        }, insertAfterId);
      setRecords(saved);
      cancelForm();
      setMessage({ type: 'success', text: editingId ? 'Rank statement updated.' : 'Rank statement added.' });
      showToast(editingId ? 'Rank statement updated.' : 'Rank statement added.', 'success');
    } catch (error) {
      console.error('Unable to save rank statement record.', error);
      const text = error instanceof Error ? error.message : 'Unable to save rank statement record.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    }
  };

  const handleDeleteRecord = record => {
    if (!window.confirm(`Delete the rank statement for ${record.name}?`)) return;
    try {
      setRecords(deleteRankStatementRecord(record.id));
      if (editingId === record.id) cancelForm();
      setMessage({ type: 'success', text: `${record.name} was deleted.` });
      showToast('Rank statement record deleted.', 'success');
    } catch (error) {
      console.error('Unable to delete rank statement record.', error);
      const text = error instanceof Error ? error.message : 'Unable to delete rank statement record.';
      setMessage({ type: 'error', text });
      showToast(text, 'error');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Rank Statement</h1>
        <p className="mt-1 text-sm text-slate-500">Upload and manage rank statement records by department and academic year.</p>
      </div>

      <section className="card space-y-5 p-5">
        <h2 className="section-title">1. Select Department &amp; Academic Year</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rank-department" className="label">Select Department</label>
            <select id="rank-department" className="input-field" value={department} onChange={event => {
              setDepartment(event.target.value);
              setMessage(null);
              cancelForm();
            }}>
              <option value="">Choose a department</option>
              {departmentOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="rank-academic-year" className="label">Select Academic Year</label>
            <select id="rank-academic-year" className="input-field" value={academicYear} onChange={event => {
              setAcademicYear(event.target.value);
              setMessage(null);
              cancelForm();
            }}>
              <option value="">Choose an academic year</option>
              {academicYearOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="card space-y-5 p-5">
        <div>
          <h2 className="section-title">2. Upload Rank Statement Spreadsheet</h2>
          <p className="mt-1 text-xs text-slate-500">Upload a rank statement spreadsheet.</p>
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
          {(selectedFile || uploadedFileName) && (
            <button type="button" className="btn-secondary btn-sm text-red-600" onClick={handleDeleteUploadedFile}
              disabled={isUploading || isDeletingFile} aria-label="Delete uploaded file" title="Delete uploaded file">
              <Trash2 size={14} aria-hidden="true" /> Delete Uploaded File
            </button>
          )}
          <button type="button" className="btn-primary btn-sm"
            onClick={() => selectedFile ? handleUpload() : fileInputRef.current?.click()}
            disabled={isUploading || isDeletingFile || !department || !academicYear}>
            <Upload size={14} /> {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" className="btn-secondary btn-sm"
            onClick={() => startAdd(null)}
            disabled={isUploading || isDeletingFile || !department || !academicYear}>
            <Plus size={14} /> Add Student
          </button>
        </div>
        <p className="text-xs text-slate-400">Supported spreadsheet formats: .xlsx and .xls.</p>

        {message && (
          <div role={message.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}>
            {message.type === 'error' ? <AlertCircle size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {form && (
          <form onSubmit={saveForm} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-4 font-semibold text-slate-800">{editingId ? 'Edit Rank Statement' : 'Add Student'}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="rank-serial" className="label">Serial Number</label>
                <input id="rank-serial" className="input-field" value={editingId
                  ? displayedRecords.findIndex(record => record.id === editingId) + 1
                  : insertAfterId ? displayedRecords.findIndex(record => record.id === insertAfterId) + 2 : displayedRecords.length + 1}
                readOnly />
              </div>
              {form.spreadsheetHeaders.map((header, columnIndex) => (
                <div key={`${header}-${columnIndex}`}>
                  <label htmlFor={`rank-${columnIndex}`} className="label">{header}</label>
                  <input id={`rank-${columnIndex}`} className="input-field"
                    value={form.spreadsheetValues[columnIndex] || ''}
                    onChange={event => setForm(current => ({
                      ...current,
                      spreadsheetValues: current.spreadsheetValues.map((value, index) =>
                        index === columnIndex ? event.target.value : value
                      ),
                    }))} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-primary btn-sm"><Save size={14} /> Save</button>
              <button type="button" className="btn-secondary btn-sm" onClick={cancelForm}><X size={14} /> Cancel</button>
            </div>
          </form>
        )}

        {department && academicYear ? (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h3 className="font-semibold text-slate-800">Rank Statement Records</h3>
                <p className="text-xs text-slate-500">{department} · {academicYear}</p>
              </div>
              <span className="text-xs text-slate-500">{displayedRecords.length} record{displayedRecords.length === 1 ? '' : 's'}</span>
            </div>
            {displayedRecords.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-white text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-3">S.No.</th>
                      {displayedHeaders.map((header, columnIndex) => (
                          <th key={`${header}-${columnIndex}`} className="px-3 py-3">{header}</th>
                        ))}
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {displayedRecords.map((record, index) => (
                      <tr key={record.id} className="align-top">
                        <td className="px-3 py-3 font-medium">{index + 1}</td>
                        {displayedHeaders
                          .map((header, columnIndex) => {
                            const column = RANK_COLUMNS.find(item => item.label === header);
                            const value = record.spreadsheetValues
                              ? record.spreadsheetValues[columnIndex]
                              : record[column?.key];
                            return (
                              <td key={`${header}-${columnIndex}`} className="max-w-56 px-3 py-3">
                                {value || '—'}
                              </td>
                            );
                          })}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button type="button" className="btn-secondary btn-sm" onClick={() => startEdit(record)}><Pencil size={13} /> Edit</button>
                            <button type="button" className="btn-secondary btn-sm text-red-600" onClick={() => handleDeleteRecord(record)}><Trash2 size={13} /> Delete</button>
                            <button type="button" className="btn-secondary btn-sm" onClick={() => startAdd(record.id)}><Plus size={13} /> Add Student</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No rank statement records for this selection yet.</p>
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">Select a department and academic year to view rank statement records.</p>
        )}
      </section>
    </div>
  );
}
