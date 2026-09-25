import jsPDF from 'jspdf';
import { BRANCH_CONFIG, COMMUNITIES } from './demoData';

const COLLEGE_NAME    = '1409 - KARPAGA VINAYAGA COLLEGE OF ENGINEERING AND TECHNOLOGY';
const COLLEGE_ADDR    = 'PALAYANOOR POST, MADURANTHAGAM TALUK, CHENGALPATTU DISTRICT - 603308';
const ACADEMIC_YEAR   = '2025 - 2026 (FIRST YEAR)';

const NAVY   = [15, 40, 90];
const BLACK  = [0, 0, 0];
const WHITE  = [255, 255, 255];
const LGRAY  = [240, 240, 240];
const MGRAY  = [220, 220, 220];

/** Draw the college header on the current page */
function drawCollegeHeader(doc, formTitle) {
  // Outer border
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.8);
  doc.rect(10, 8, 277, 30); // landscape: 297 wide

  // Inner content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(COLLEGE_NAME, 148.5, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text(COLLEGE_ADDR, 148.5, 22, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(formTitle, 148.5, 29, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`ACADEMIC YEAR: ${ACADEMIC_YEAR}`, 148.5, 35, { align: 'center' });

  return 44; // y after header
}

/** Draw college header for portrait A4 */
function drawCollegeHeaderPortrait(doc, formTitle) {
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.8);
  doc.rect(10, 8, 190, 30);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(COLLEGE_NAME, 105, 16, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.text(COLLEGE_ADDR, 105, 22, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formTitle, 105, 29, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`ACADEMIC YEAR: ${ACADEMIC_YEAR}`, 105, 35, { align: 'center' });

  return 44;
}

function addPageNumber(doc, pageNum, totalPages) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Page ${pageNum} of ${totalPages}`, 148.5, 204, { align: 'center' });
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM A – Branch / Management Quota Admission Summary
// ─────────────────────────────────────────────────────────────────────────────
export function generateFormA(students, filters = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = drawCollegeHeaderPortrait(doc, 'FORM A — BRANCH / MANAGEMENT QUOTA ADMISSION SUMMARY');

  // Build data per branch
  const branches = BRANCH_CONFIG.filter(b => !filters.branch || b.name === filters.branch);
  const filteredStudents = students.filter(s =>
    (!filters.academicYear || s.academicYear === filters.academicYear)
  );

  // Table header row
  const COL = { sl: 14, code: 22, san: 54, approv: 72, admit: 112, bal: 152 };
  const ROW_H = 8;

  doc.setFillColor(...NAVY);
  doc.rect(14, y, 182, ROW_H, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SL.', COL.sl + 2, y + 5.5);
  doc.text('BRANCH CODE', COL.code + 1, y + 5.5);
  doc.text('BRANCH NAME', COL.san - 10, y + 5.5);
  doc.text('SAN', COL.san + 20, y + 5.5);
  doc.text('MGT QUOTA\nAPPROVED', COL.approv + 2, y + 4, { lineHeightFactor: 1.3 });
  doc.text('MGT QUOTA\nADMITTED', COL.admit + 2, y + 4, { lineHeightFactor: 1.3 });
  doc.text('BALANCE', COL.bal + 2, y + 5.5);
  doc.setTextColor(...BLACK);
  y += ROW_H;

  // Column widths reference (x positions)
  // SL: 14→21 | CODE: 22→52 | NAME: 53→107 | SAN: 108→119 | APPROV: 120→149 | ADMIT: 150→179 | BAL: 180→196
  const headers2 = [14, 22, 53, 108, 120, 150, 180, 196]; // x-bounds

  let totalSan = 0, totalApproved = 0, totalAdmitted = 0;

  branches.forEach((b, i) => {
    if (y > 260) {
      doc.addPage();
      y = drawCollegeHeaderPortrait(doc, 'FORM A — BRANCH / MANAGEMENT QUOTA ADMISSION SUMMARY (contd.)');
    }
    const admitted = filteredStudents.filter(
      s => s.branch === b.name && s.category === 'Management'
    ).length;
    const approved = b.san;
    const balance  = approved - admitted;

    totalSan      += b.san;
    totalApproved += approved;
    totalAdmitted += admitted;

    const bg = i % 2 === 0 ? WHITE : LGRAY;
    doc.setFillColor(...bg);
    doc.rect(14, y, 182, ROW_H, 'F');
    doc.setDrawColor(...MGRAY);
    doc.rect(14, y, 182, ROW_H);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.text(String(i + 1), 17, y + 5.5);
    doc.text(b.code, 24, y + 5.5);
    doc.text(b.name, 55, y + 5.5, { maxWidth: 52 });
    doc.text(String(b.san), 112, y + 5.5, { align: 'center' });
    doc.text(String(approved), 135, y + 5.5, { align: 'center' });
    doc.text(String(admitted), 164, y + 5.5, { align: 'center' });

    const balColor = balance < 0 ? [200, 0, 0] : balance === 0 ? [100, 100, 100] : [0, 120, 0];
    doc.setTextColor(...balColor);
    doc.text(String(balance), 186, y + 5.5, { align: 'center' });
    doc.setTextColor(...BLACK);

    y += ROW_H;
  });

  // Total row
  if (y > 260) {
    doc.addPage();
    y = drawCollegeHeaderPortrait(doc, 'FORM A — BRANCH / MANAGEMENT QUOTA ADMISSION SUMMARY (contd.)');
  }
  doc.setFillColor(...NAVY);
  doc.rect(14, y, 182, ROW_H, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TOTAL', 24, y + 5.5);
  doc.text(String(totalSan), 112, y + 5.5, { align: 'center' });
  doc.text(String(totalApproved), 135, y + 5.5, { align: 'center' });
  doc.text(String(totalAdmitted), 164, y + 5.5, { align: 'center' });
  doc.text(String(totalApproved - totalAdmitted), 186, y + 5.5, { align: 'center' });
  doc.setTextColor(...BLACK);
  y += ROW_H + 4;

  // Signature row
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Prepared by: ___________________________', 14, y + 8);
  doc.text('Principal', 160, y + 8, { align: 'right' });

  // Page numbers
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${p} of ${total}`, 196, 290, { align: 'right' });
    doc.text(new Date().toLocaleDateString('en-IN'), 14, 290);
  }

  return doc;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM B – Student Admission Details (Landscape)
// ─────────────────────────────────────────────────────────────────────────────
export function generateFormB(students, filters = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const filteredStudents = students.filter(s =>
    (!filters.academicYear    || s.academicYear === filters.academicYear) &&
    (!filters.branch          || s.branch === filters.branch) &&
    (!filters.quota           || s.category === filters.quota) &&
    (!filters.community       || s.community === filters.community)
  );

  // Sort by applicationNo numerically if possible
  const sorted = [...filteredStudents].sort((a, b) => {
    const na = parseInt((a.applicationNo || '').replace(/\D/g, ''), 10) || 0;
    const nb = parseInt((b.applicationNo || '').replace(/\D/g, ''), 10) || 0;
    return na - nb;
  });

  let y = drawCollegeHeader(doc, 'FORM B — STUDENT ADMISSION DETAILS');

  // Column x-positions (landscape 297mm, margins 10)
  // SL | APP NO | REG NO | QUOTA | NAME | NATL | COMM | GRP | M-OBT | M-MAX | P-OBT | P-MAX | C-OBT | C-MAX | T-OBT | T-MAX | % | FG | AFW
  const C = {
    sl:    10,
    app:   16,
    reg:   36,
    quota: 56,
    name:  71,
    natl:  108,
    comm:  120,
    grp:   131,
    mobt:  142, mmax: 150,
    pobt:  158, pmax: 166,
    cobt:  174, cmax: 182,
    tobt:  190, tmax: 198,
    pct:   206,
    fg:    218,
    afw:   226,
    end:   237,
  };

  const ROW_H = 6;

  // Draw two-level header
  // Level 1: groups
  doc.setFillColor(...NAVY);
  doc.rect(C.sl, y, C.end - C.sl, ROW_H, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  // Top-level group labels
  const groups1 = [
    [C.sl,    'SL'],
    [C.app,   'APP NO'],
    [C.reg,   'REG NO'],
    [C.quota, 'QUOTA'],
    [C.name,  'STUDENT NAME'],
    [C.natl,  'NATL'],
    [C.comm,  'COMM'],
    [C.grp,   'GRP'],
    [(C.mobt + C.mmax) / 2, 'MATHS'],
    [(C.pobt + C.pmax) / 2, 'PHYSICS'],
    [(C.cobt + C.cmax) / 2, 'CHEMISTRY'],
    [(C.tobt + C.tmax) / 2, 'TOTAL'],
    [C.pct,   '%'],
    [C.fg,    'FG'],
    [C.afw,   'AFW'],
  ];
  groups1.forEach(([x, lbl]) => doc.text(lbl, x + 1, y + 4));
  doc.setTextColor(...BLACK);
  y += ROW_H;

  // Level 2: sub-headers OBT/MAX for subjects
  doc.setFillColor(50, 80, 140);
  doc.rect(C.sl, y, C.end - C.sl, ROW_H - 1, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(5.5);
  const subs = [
    [C.mobt, 'OBT'], [C.mmax, 'MAX'],
    [C.pobt, 'OBT'], [C.pmax, 'MAX'],
    [C.cobt, 'OBT'], [C.cmax, 'MAX'],
    [C.tobt, 'OBT'], [C.tmax, 'MAX'],
  ];
  subs.forEach(([x, lbl]) => doc.text(lbl, x + 1, y + 3.5));
  doc.setTextColor(...BLACK);
  y += ROW_H - 1;

  // Data rows
  sorted.forEach((s, i) => {
    if (y > 195) {
      doc.addPage();
      y = drawCollegeHeader(doc, 'FORM B — STUDENT ADMISSION DETAILS (contd.)');
    }

    const mo = Number(s.mathsObt)   || 0;
    const mm = 100;
    const po = Number(s.physicsObt) || 0;
    const pm = 100;
    const co = Number(s.chemObt)    || 0;
    const cm = 100;
    const to = mo + po + co;
    const tm = 300;
    const pct = ((to / tm) * 100).toFixed(2);

    const bg = i % 2 === 0 ? WHITE : LGRAY;
    doc.setFillColor(...bg);
    doc.rect(C.sl, y, C.end - C.sl, ROW_H, 'F');
    doc.setDrawColor(...MGRAY);
    doc.rect(C.sl, y, C.end - C.sl, ROW_H);

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);

    const cell = (x, val, maxW = 18) => doc.text(String(val ?? '—'), x + 0.5, y + 4, { maxWidth: maxW });
    cell(C.sl,    i + 1, 5);
    cell(C.app,   s.applicationNo || '—', 18);
    cell(C.reg,   s.registerNo || '—', 18);
    cell(C.quota, s.category || '—', 14);
    cell(C.name,  s.name || '—', 36);
    cell(C.natl,  s.nationality === 'Other' ? (s.nationalityOther || 'OTH') : (s.nationality || '—'), 11);
    cell(C.comm,  s.community || '—', 10);
    cell(C.grp,   s.group || '—', 10);
    cell(C.mobt,  mo, 7); cell(C.mmax, mm, 7);
    cell(C.pobt,  po, 7); cell(C.pmax, pm, 7);
    cell(C.cobt,  co, 7); cell(C.cmax, cm, 7);
    cell(C.tobt,  to, 7); cell(C.tmax, tm, 7);
    cell(C.pct,   pct, 11);
    cell(C.fg,    s.fg || '—', 7);
    cell(C.afw,   s.afw || '—', 7);

    y += ROW_H;
  });

  // Total row
  if (y > 195) {
    doc.addPage();
    y = drawCollegeHeader(doc, 'FORM B — STUDENT ADMISSION DETAILS (contd.)');
  }
  doc.setFillColor(...NAVY);
  doc.rect(C.sl, y, C.end - C.sl, ROW_H, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text(`TOTAL: ${sorted.length} STUDENTS`, C.sl + 1, y + 4);
  doc.setTextColor(...BLACK);
  y += ROW_H + 4;

  // Signature
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Prepared by: ___________________________', 14, y + 6);
  doc.text('Principal', 225, y + 6, { align: 'right' });

  // Page numbers
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${p} of ${total}`, 287, 204, { align: 'right' });
    doc.text(new Date().toLocaleDateString('en-IN'), 10, 204);
  }

  return doc;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM C – Branch + Community + Gender-wise Summary (Landscape)
// ─────────────────────────────────────────────────────────────────────────────
export function generateFormC(students, filters = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const filteredStudents = students.filter(s =>
    (!filters.academicYear || s.academicYear === filters.academicYear) &&
    (!filters.branch       || s.branch === filters.branch)
  );

  const branches = BRANCH_CONFIG.filter(b => !filters.branch || b.name === filters.branch);

  let y = drawCollegeHeader(doc, 'FORM C — COMMUNITY-WISE ADMISSION SUMMARY (BRANCH-WISE)');

  const ROW_H  = 7;
  const ROW_H2 = 5.5;

  // Column layout:
  // SL | BRANCH | SAN | [OC B G] [BC B G] [BCM B G] [MBC B G] [SC B G] [ST B G] | TOTAL B G
  // Total width: 277mm (10 to 287)
  const startX = 10;
  const endX   = 287;

  // Community block widths: 6 comms × (B+G = 2×8mm) = 96mm + fixed cols
  // Fixed: SL(8) + BRANCH(30) + SAN(10) + TOTAL-B(9) + TOTAL-G(9) = 66mm
  // Remaining: 277 - 66 = 211mm / 6 = 35.16 per community → 2 cols × 17.5 each
  const SL_W     = 8;
  const BR_W     = 32;
  const SAN_W    = 10;
  const COMM_W   = 34; // per community (Boys + Girls)
  const CELL_W   = 17; // each boys/girls cell
  const TOT_W    = 18; // total boys + girls combined

  let cx = startX;
  const POS = {
    sl:   cx,
    br:   (cx += SL_W),
    san:  (cx += BR_W),
    comms: COMMUNITIES.map(() => { const p = (cx += SAN_W); cx += COMM_W - SAN_W; return p; }),
    tot:  cx + SAN_W,
  };

  // Recalculate properly
  const colX = {
    sl:   startX,
    br:   startX + SL_W,
    san:  startX + SL_W + BR_W,
  };
  let commStart = colX.san + SAN_W;
  const communityX = COMMUNITIES.map(c => {
    const x = commStart;
    commStart += COMM_W;
    return x;
  });
  const totalX = commStart;

  // Level 1 header: group labels
  doc.setFillColor(...NAVY);
  doc.rect(startX, y, endX - startX, ROW_H, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');

  doc.text('SL', colX.sl + 1, y + 4.5);
  doc.text('BRANCH', colX.br + 1, y + 4.5);
  doc.text('SAN', colX.san + 1, y + 4.5);
  COMMUNITIES.forEach((comm, i) => {
    doc.text(comm, communityX[i] + COMM_W / 2 - 2, y + 4.5);
  });
  doc.text('TOTAL', totalX + TOT_W / 2 - 4, y + 4.5);
  doc.setTextColor(...BLACK);
  y += ROW_H;

  // Level 2 header: Boys / Girls per community
  doc.setFillColor(50, 80, 140);
  doc.rect(startX, y, endX - startX, ROW_H2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(5.5);
  COMMUNITIES.forEach((_, i) => {
    doc.text('Boys', communityX[i] + 1, y + 3.8);
    doc.text('Girls', communityX[i] + CELL_W + 1, y + 3.8);
  });
  doc.text('Boys', totalX + 1, y + 3.8);
  doc.text('Girls', totalX + CELL_W + 1, y + 3.8);
  doc.setTextColor(...BLACK);
  y += ROW_H2;

  let grandTotalBoys = 0, grandTotalGirls = 0;
  const grandCommBoys  = Object.fromEntries(COMMUNITIES.map(c => [c, 0]));
  const grandCommGirls = Object.fromEntries(COMMUNITIES.map(c => [c, 0]));

  branches.forEach((b, i) => {
    if (y > 190) {
      doc.addPage();
      y = drawCollegeHeader(doc, 'FORM C — COMMUNITY-WISE ADMISSION SUMMARY (contd.)');
      // Redraw sub-header
      doc.setFillColor(50, 80, 140);
      doc.rect(startX, y, endX - startX, ROW_H2, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(5.5);
      COMMUNITIES.forEach((_, ci) => {
        doc.text('Boys', communityX[ci] + 1, y + 3.8);
        doc.text('Girls', communityX[ci] + CELL_W + 1, y + 3.8);
      });
      doc.text('Boys', totalX + 1, y + 3.8);
      doc.text('Girls', totalX + CELL_W + 1, y + 3.8);
      doc.setTextColor(...BLACK);
      y += ROW_H2;
    }

    const branchStudents = filteredStudents.filter(s => s.branch === b.name);
    let branchBoys = 0, branchGirls = 0;

    const bg = i % 2 === 0 ? WHITE : LGRAY;
    doc.setFillColor(...bg);
    doc.rect(startX, y, endX - startX, ROW_H, 'F');
    doc.setDrawColor(...MGRAY);
    doc.rect(startX, y, endX - startX, ROW_H);

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLACK);
    doc.text(String(i + 1), colX.sl + 1, y + 4.5);
    doc.text(b.code, colX.br + 1, y + 4.5, { maxWidth: BR_W - 1 });
    doc.text(String(b.san), colX.san + 1, y + 4.5);

    COMMUNITIES.forEach((comm, ci) => {
      const boys  = branchStudents.filter(s => s.community === comm && s.gender === 'Male').length;
      const girls = branchStudents.filter(s => s.community === comm && (s.gender === 'Female' || s.gender === 'Transgender')).length;
      doc.text(String(boys  || 0), communityX[ci] + 1,           y + 4.5);
      doc.text(String(girls || 0), communityX[ci] + CELL_W + 1,  y + 4.5);
      branchBoys  += boys;
      branchGirls += girls;
      grandCommBoys[comm]  += boys;
      grandCommGirls[comm] += girls;
    });

    doc.text(String(branchBoys),  totalX + 1,           y + 4.5);
    doc.text(String(branchGirls), totalX + CELL_W + 1,  y + 4.5);
    grandTotalBoys  += branchBoys;
    grandTotalGirls += branchGirls;

    y += ROW_H;
  });

  // Grand Total row
  if (y > 190) {
    doc.addPage();
    y = drawCollegeHeader(doc, 'FORM C — COMMUNITY-WISE ADMISSION SUMMARY (contd.)');
  }
  doc.setFillColor(...NAVY);
  doc.rect(startX, y, endX - startX, ROW_H, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('TOTAL', colX.br + 1, y + 4.5);
  COMMUNITIES.forEach((comm, ci) => {
    doc.text(String(grandCommBoys[comm]),  communityX[ci] + 1,          y + 4.5);
    doc.text(String(grandCommGirls[comm]), communityX[ci] + CELL_W + 1, y + 4.5);
  });
  doc.text(String(grandTotalBoys),  totalX + 1,           y + 4.5);
  doc.text(String(grandTotalGirls), totalX + CELL_W + 1,  y + 4.5);
  doc.setTextColor(...BLACK);
  y += ROW_H + 4;

  // Signature
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Prepared by: ___________________________', 14, y + 6);
  doc.text('Principal', 276, y + 6, { align: 'right' });

  // Page numbers
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${p} of ${total}`, 287, 204, { align: 'right' });
    doc.text(new Date().toLocaleDateString('en-IN'), 10, 204);
  }

  return doc;
}

// ── Download / Print helpers ────────────────────────────────────────────────
export function downloadFormA(students, filters = {}) {
  const doc = generateFormA(students, filters);
  doc.save(`Form_A_${filters.academicYear || 'All'}.pdf`);
}

export function downloadFormB(students, filters = {}) {
  const doc = generateFormB(students, filters);
  doc.save(`Form_B_${filters.academicYear || 'All'}.pdf`);
}

export function downloadFormC(students, filters = {}) {
  const doc = generateFormC(students, filters);
  doc.save(`Form_C_${filters.academicYear || 'All'}.pdf`);
}

export function printForm(doc) {
  const url = doc.output('bloburl');
  window.open(url);
}
