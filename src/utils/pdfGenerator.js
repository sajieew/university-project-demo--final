import jsPDF from 'jspdf';
import { UG_CERTIFICATES, PG_CERTIFICATES, VERIFICATION_STAGES, ELIGIBILITY_PARAMETERS } from './demoData';

const isUG = (p) => ['B.E.', 'B.Tech.'].includes(p);

const NAVY = [26, 54, 93];
const LIGHT_GRAY = [245, 245, 245];
const BORDER_COLOR = [200, 210, 220];
const TEXT_DARK = [30, 40, 55];
const TEXT_LIGHT = [100, 110, 120];

function addHeader(doc, y) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KVELL ADMISSION UNIT PORTAL', 105, 11, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificate Verification Form — Academic Year', 105, 19, { align: 'center' });
  doc.setTextColor(...TEXT_DARK);
  return 35;
}

function sectionHeader(doc, title, y) {
  doc.setFillColor(235, 241, 250);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(title, 17, y + 5);
  doc.setTextColor(...TEXT_DARK);
  return y + 10;
}

function labelValue(doc, label, value, x, y, labelW = 55) {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_LIGHT);
  doc.text(label + ':', x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text(String(value || '—'), x + labelW, y);
}

function checkMark(doc, x, y, checked) {
  // Draw the outer square box
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.4);
  doc.rect(x, y - 3.2, 4, 4);
  if (checked) {
    // Draw a tick using two lines (vector — no Unicode dependency)
    doc.setLineWidth(0.6);
    doc.setDrawColor(10, 100, 10);
    // Short leg: bottom-left corner to mid-bottom
    doc.line(x + 0.6, y - 0.8, x + 1.5, y + 0.2);
    // Long leg: mid-bottom up to top-right
    doc.line(x + 1.5, y + 0.2, x + 3.4, y - 2.6);
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.4);
  }
}

export const generateStudentPDF = (student) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const certs = isUG(student.programme) ? UG_CERTIFICATES : PG_CERTIFICATES;

  let y = addHeader(doc, 0);

  // Section A: Student Details
  y = sectionHeader(doc, 'SECTION A — STUDENT DETAILS', y);
  const col1x = 14, col2x = 110;
  labelValue(doc, 'Application No.', student.applicationNo, col1x, y);
  labelValue(doc, 'Admission No.', student.admissionNo, col2x, y);
  y += 7;
  labelValue(doc, 'Name of Student', student.name, col1x, y);
  labelValue(doc, 'Date of Birth', student.dob, col2x, y);
  y += 7;
  labelValue(doc, 'Gender', student.gender, col1x, y);
  labelValue(doc, 'Academic Year', student.academicYear, col2x, y);
  y += 7;
  labelValue(doc, 'Programme', student.programme, col1x, y);
  labelValue(doc, 'Branch / Specialization', student.branch, col2x, y);
  y += 7;
  labelValue(doc, 'Admission Category', student.category, col1x, y);
  labelValue(doc, 'Mobile Number', student.mobile, col2x, y);
  y += 7;
  labelValue(doc, 'Email ID', student.email, col1x, y);
  y += 10;

  // Section B: Certificate Checklist
  y = sectionHeader(doc, 'SECTION B — CERTIFICATE VERIFICATION CHECKLIST', y);
  // Table header
  doc.setFillColor(...NAVY);
  doc.rect(14, y, 182, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate / Document', 17, y + 4);
  doc.text('Original', 132, y + 4, { align: 'center' });
  doc.text('Photocopy', 153, y + 4, { align: 'center' });
  doc.text('Verified', 172, y + 4, { align: 'center' });
  doc.text('Remarks', 186, y + 4);
  y += 6;
  doc.setTextColor(...TEXT_DARK);

  certs.forEach((cert, idx) => {
    const row = student.certificates?.[cert.id] || {};
    if (y > 260) {
      doc.addPage();
      y = addHeader(doc, 0);
    }
    const bg = idx % 2 === 0 ? [255, 255, 255] : LIGHT_GRAY;
    doc.setFillColor(...bg);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${idx + 1}. ${cert.name}`, 17, y + 4, { maxWidth: 112 });
    checkMark(doc, 130, y + 4, row.originalProduced);
    checkMark(doc, 151, y + 4, row.photocopySubmitted);
    checkMark(doc, 170, y + 4, row.verified);
    if (row.remarks) {
      doc.setFontSize(6.5);
      doc.text(String(row.remarks), 182, y + 4, { maxWidth: 26 });
      doc.setFontSize(7);
    }
    y += 6;
  });
  y += 5;

  if (y > 220) { doc.addPage(); y = addHeader(doc, 0); }

  // Section C: Verification Process
  y = sectionHeader(doc, 'SECTION C — VERIFICATION PROCESS', y);
  doc.setFillColor(...NAVY);
  doc.rect(14, y, 182, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Stage', 17, y + 4);
  doc.text('Status', 107, y + 4, { align: 'center' });
  doc.text('Verified By', 135, y + 4);
  doc.text('Date', 167, y + 4);
  y += 6;
  doc.setTextColor(...TEXT_DARK);

  VERIFICATION_STAGES.forEach((stage, idx) => {
    const s = student.stages?.[stage.id] || {};
    if (y > 265) { doc.addPage(); y = addHeader(doc, 0); }
    const bg = idx % 2 === 0 ? [255, 255, 255] : LIGHT_GRAY;
    doc.setFillColor(...bg);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${stage.id}. ${stage.name}`, 17, y + 4, { maxWidth: 88 });
    doc.text(s.status || 'Pending', 107, y + 4, { align: 'center' });
    doc.text(s.verifiedBy || '—', 135, y + 4);
    doc.text(s.date || '—', 167, y + 4);
    y += 6;
  });
  y += 5;

  if (y > 200) { doc.addPage(); y = addHeader(doc, 0); }

  // Section D: Eligibility
  y = sectionHeader(doc, 'SECTION D — ELIGIBILITY VERIFICATION', y);
  ELIGIBILITY_PARAMETERS.forEach((p) => {
    if (y > 265) { doc.addPage(); y = addHeader(doc, 0); }
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`• ${p.label}`, 17, y);
    doc.setFont('helvetica', 'bold');
    const val = student.eligibility?.[p.id] || 'NA';
    const color = val === 'Yes' ? [5, 150, 105] : val === 'No' ? [220, 38, 38] : [100, 116, 139];
    doc.setTextColor(...color);
    doc.text(val, 175, y, { align: 'right' });
    doc.setTextColor(...TEXT_DARK);
    y += 6;
  });
  y += 3;

  // Final Eligibility Status
  doc.setFillColor(235, 241, 250);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('Final Verification Status:', 17, y + 5.5);
  doc.text(student.eligibility?.finalStatus || '—', 196, y + 5.5, { align: 'right' });
  doc.setTextColor(...TEXT_DARK);
  y += 14;

  if (y > 220) { doc.addPage(); y = addHeader(doc, 0); }

  // Section E: Declaration
  y = sectionHeader(doc, 'SECTION E — STUDENT DECLARATION', y);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'I hereby declare that all the information furnished above is true and correct to the best of my knowledge\n' +
    'and belief. I understand that suppression of facts or submission of false documents will result in\n' +
    'cancellation of my admission.',
    17, y, { maxWidth: 178 }
  );
  y += 18;
  labelValue(doc, 'Name', student.declaration?.name, 14, y);
  labelValue(doc, 'Date', student.declaration?.date, 110, y);
  y += 7;
  labelValue(doc, 'Signature', student.declaration?.signature || '_______________', 14, y);
  y += 12;

  // Section F: Verification Officer
  y = sectionHeader(doc, 'SECTION F — VERIFICATION OFFICER', y);
  labelValue(doc, 'Name', student.officer?.name, 14, y);
  labelValue(doc, 'Designation', student.officer?.designation, 110, y);
  y += 7;
  labelValue(doc, 'Date', student.officer?.date, 14, y);
  labelValue(doc, 'Signature', student.officer?.signature || '_______________', 110, y);
  y += 12;

  // Section G: Admission Approval
  y = sectionHeader(doc, 'SECTION G — ADMISSION APPROVAL', y);
  const status = student.approval?.status || 'Pending';
  const statusColors = { Approved: [5, 150, 105], 'Provisionally Approved': [245, 158, 11], Pending: [100, 116, 139], Rejected: [220, 38, 38] };
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(statusColors[status] || [100, 116, 139]));
  doc.text(`Admission Status: ${status}`, 17, y + 2);
  doc.setTextColor(...TEXT_DARK);
  y += 9;
  if (student.approval?.remarks) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Remarks: ${student.approval.remarks}`, 17, y, { maxWidth: 178 });
    y += 8;
  }
  labelValue(doc, 'Officer Name', student.approval?.officer, 14, y);
  labelValue(doc, 'Date', student.approval?.date, 110, y);
  y += 7;
  labelValue(doc, 'Signature', student.approval?.signature || '_______________', 14, y);

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_LIGHT);
    doc.text('KVELL Admission Unit Portal — Certificate Verification Form', 105, 290, { align: 'center' });
    doc.text(`Page ${i} of ${totalPages}`, 196, 290, { align: 'right' });
    doc.text(new Date().toLocaleDateString('en-IN'), 14, 290);
  }

  return doc;
};

export const downloadPDF = (student) => {
  const doc = generateStudentPDF(student);
  const filename = `Verification_${student.applicationNo || student.id}_${student.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};

export const printPDF = (student) => {
  const doc = generateStudentPDF(student);
  const url = doc.output('bloburl');
  window.open(url);
};
