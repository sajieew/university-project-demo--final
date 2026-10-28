export default function FlowchartPage() {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Project Flowchart</h1>
        <p className="text-sm text-slate-400">End-to-end flow of the Admission & Certificate Verification Portal</p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 900 1600"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-3xl mx-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {/* ── Definitions ── */}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
            </marker>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0001" />
            </filter>
          </defs>

          {/* ── Helper components as inline shapes ── */}

          {/* ===== START ===== */}
          <ellipse cx="450" cy="50" rx="80" ry="28" fill="#1e3a8a" filter="url(#shadow)" />
          <text x="450" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">START</text>

          {/* arrow */}
          <line x1="450" y1="78" x2="450" y2="108" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* ===== App Boot / Seed Demo Data ===== */}
          <rect x="300" y="110" width="300" height="50" rx="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="450" y="130" textAnchor="middle" fill="#1e3a8a" fontSize="12" fontWeight="600">App Boot</text>
          <text x="450" y="148" textAnchor="middle" fill="#3b82f6" fontSize="10">Seed Demo Data · Load Auth from localStorage</text>

          {/* arrow */}
          <line x1="450" y1="160" x2="450" y2="190" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* ===== Auth Check Diamond ===== */}
          <polygon points="450,195 560,240 450,285 340,240" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="450" y="235" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="600">User</text>
          <text x="450" y="252" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="600">Logged In?</text>

          {/* NO → Login */}
          <line x1="340" y1="240" x2="220" y2="240" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="275" y="232" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="600">No</text>

          {/* YES → Dashboard */}
          <line x1="450" y1="285" x2="450" y2="315" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="462" y="305" fill="#16a34a" fontSize="11" fontWeight="600">Yes</text>

          {/* ===== Login Page ===== */}
          <rect x="90" y="210" width="130" height="60" rx="10" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="155" y="234" textAnchor="middle" fill="#991b1b" fontSize="12" fontWeight="600">Login Page</text>
          <text x="155" y="252" textAnchor="middle" fill="#ef4444" fontSize="10">username + password</text>

          {/* Login → Valid? */}
          <line x1="155" y1="270" x2="155" y2="330" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <polygon points="155,335 240,365 155,395 70,365" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="155" y="360" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="600">Valid</text>
          <text x="155" y="376" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="600">Credentials?</text>

          {/* Invalid → back to Login */}
          <line x1="70" y1="365" x2="50" y2="365" stroke="#64748b" strokeWidth="2" />
          <line x1="50" y1="365" x2="50" y2="240" stroke="#64748b" strokeWidth="2" />
          <line x1="50" y1="240" x2="90" y2="240" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="32" y="310" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600" transform="rotate(-90,32,310)">Invalid</text>

          {/* Valid → Dashboard (join arrow) */}
          <line x1="155" y1="395" x2="155" y2="450" stroke="#64748b" strokeWidth="2" />
          <line x1="155" y1="450" x2="430" y2="450" stroke="#64748b" strokeWidth="2" />
          <line x1="430" y1="450" x2="430" y2="360" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* ===== AppLayout / Dashboard ===== */}
          <rect x="300" y="318" width="300" height="55" rx="10" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="450" y="340" textAnchor="middle" fill="#065f46" fontSize="12" fontWeight="600">AppLayout + Dashboard</text>
          <text x="450" y="358" textAnchor="middle" fill="#059669" fontSize="10">Stats · Recent · Quick Actions</text>

          {/* ── Navigation arrows from Dashboard ── */}
          {/* Down to Students */}
          <line x1="450" y1="373" x2="450" y2="470" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* ===== NAVIGATION ROW label ===== */}
          <text x="450" y="465" textAnchor="middle" fill="#94a3b8" fontSize="10">Navigate to section</text>

          {/* Horizontal nav bar */}
          <line x1="120" y1="490" x2="780" y2="490" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Arrow down to each section */}
          <line x1="160" y1="490" x2="160" y2="518" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1="330" y1="490" x2="330" y2="518" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1="450" y1="490" x2="450" y2="518" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1="600" y1="490" x2="600" y2="518" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1="750" y1="490" x2="750" y2="518" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* ===== SECTION BOXES ===== */}

          {/* Students Page */}
          <rect x="80" y="520" width="160" height="55" rx="10" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="542" textAnchor="middle" fill="#1e3a8a" fontSize="12" fontWeight="600">Students Page</text>
          <text x="160" y="558" textAnchor="middle" fill="#3b82f6" fontSize="10">Search · Filter · Table</text>

          {/* Verification Page */}
          <rect x="255" y="520" width="150" height="55" rx="10" fill="#fefce8" stroke="#eab308" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="330" y="542" textAnchor="middle" fill="#713f12" fontSize="12" fontWeight="600">Verification</text>
          <text x="330" y="558" textAnchor="middle" fill="#ca8a04" fontSize="10">Pending list · Verify Now</text>

          {/* Reports Page (Admin) */}
          <rect x="375" y="520" width="150" height="55" rx="10" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="450" y="542" textAnchor="middle" fill="#14532d" fontSize="12" fontWeight="600">Reports</text>
          <text x="450" y="558" textAnchor="middle" fill="#16a34a" fontSize="10">Admin only · PDF export</text>

          {/* Users Page (Admin) */}
          <rect x="530" y="520" width="140" height="55" rx="10" fill="#fdf4ff" stroke="#a855f7" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="600" y="542" textAnchor="middle" fill="#581c87" fontSize="12" fontWeight="600">Users</text>
          <text x="600" y="558" textAnchor="middle" fill="#9333ea" fontSize="10">Admin only · CRUD users</text>

          {/* Settings Page (Admin) */}
          <rect x="675" y="520" width="150" height="55" rx="10" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="750" y="542" textAnchor="middle" fill="#7c2d12" fontSize="12" fontWeight="600">Settings</text>
          <text x="750" y="558" textAnchor="middle" fill="#ea580c" fontSize="10">Admin only</text>

          {/* ===== Students Page sub-flow ===== */}

          {/* Arrow down from Students */}
          <line x1="160" y1="575" x2="160" y2="615" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* New / Edit Student → StudentFormPage */}
          <rect x="60" y="618" width="200" height="55" rx="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="640" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="600">Student Form Page</text>
          <text x="160" y="656" textAnchor="middle" fill="#2563eb" fontSize="10">Add / Edit student record</text>

          {/* Arrow down */}
          <line x1="160" y1="673" x2="160" y2="710" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* Validation diamond */}
          <polygon points="160,715 255,745 160,775 65,745" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="740" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="600">Form</text>
          <text x="160" y="756" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="600">Valid?</text>

          {/* Invalid loop */}
          <line x1="65" y1="745" x2="40" y2="745" stroke="#64748b" strokeWidth="2" />
          <line x1="40" y1="745" x2="40" y2="640" stroke="#64748b" strokeWidth="2" />
          <line x1="40" y1="640" x2="60" y2="640" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="22" y="695" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600" transform="rotate(-90,22,695)">Invalid</text>

          {/* Valid → Save */}
          <line x1="160" y1="775" x2="160" y2="810" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="172" y="797" fill="#16a34a" fontSize="11" fontWeight="600">Valid</text>

          <rect x="65" y="812" width="190" height="50" rx="10" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="832" textAnchor="middle" fill="#065f46" fontSize="12" fontWeight="600">Save to localStorage</text>
          <text x="160" y="849" textAnchor="middle" fill="#059669" fontSize="10">AppContext · Toast notification</text>

          {/* Arrow → Student Detail */}
          <line x1="160" y1="862" x2="160" y2="898" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="55" y="900" width="210" height="55" rx="10" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="922" textAnchor="middle" fill="#1e3a8a" fontSize="12" fontWeight="600">Student Detail Page</text>
          <text x="160" y="938" textAnchor="middle" fill="#3b82f6" fontSize="10">View · Edit · Delete · Verify</text>

          {/* Arrow → Verification Stepper */}
          <line x1="160" y1="955" x2="160" y2="988" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="50" y="990" width="220" height="55" rx="10" fill="#fefce8" stroke="#eab308" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="1012" textAnchor="middle" fill="#713f12" fontSize="12" fontWeight="600">Verification Stepper</text>
          <text x="160" y="1028" textAnchor="middle" fill="#ca8a04" fontSize="10">Eligibility · Checklist · Officer · Declaration</text>

          {/* Arrow → Admission Form */}
          <line x1="160" y1="1045" x2="160" y2="1078" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="50" y="1080" width="220" height="55" rx="10" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="1102" textAnchor="middle" fill="#14532d" fontSize="12" fontWeight="600">Admission Approval Form</text>
          <text x="160" y="1118" textAnchor="middle" fill="#16a34a" fontSize="10">Approve / Provision / Reject</text>

          {/* Arrow → Update Status */}
          <line x1="160" y1="1135" x2="160" y2="1165" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="65" y="1167" width="190" height="50" rx="10" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="1187" textAnchor="middle" fill="#065f46" fontSize="12" fontWeight="600">Update Admission Status</text>
          <text x="160" y="1203" textAnchor="middle" fill="#059669" fontSize="10">verificationStatus · admissionStatus</text>

          {/* Arrow → PDF */}
          <line x1="160" y1="1217" x2="160" y2="1248" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="65" y="1250" width="190" height="50" rx="10" fill="#fdf4ff" stroke="#a855f7" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="160" y="1270" textAnchor="middle" fill="#581c87" fontSize="12" fontWeight="600">Generate PDF Report</text>
          <text x="160" y="1286" textAnchor="middle" fill="#9333ea" fontSize="10">pdfGenerator utility · download</text>

          {/* ===== Verification Page sub-flow ===== */}
          <line x1="330" y1="575" x2="330" y2="615" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="240" y="618" width="180" height="50" rx="10" fill="#fefce8" stroke="#eab308" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="330" y="638" textAnchor="middle" fill="#713f12" fontSize="12" fontWeight="600">Filter Pending Records</text>
          <text x="330" y="653" textAnchor="middle" fill="#ca8a04" fontSize="10">verificationStatus = Not Verified</text>

          <line x1="330" y1="668" x2="330" y2="700" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <rect x="240" y="702" width="180" height="50" rx="10" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" filter="url(#shadow)" />
          <text x="330" y="722" textAnchor="middle" fill="#991b1b" fontSize="12" fontWeight="600">Click "Verify Now"</text>
          <text x="330" y="737" textAnchor="middle" fill="#ef4444" fontSize="10">Navigates to /students/:id/edit</text>

          {/* join arrow to Student Form */}
          <line x1="330" y1="752" x2="330" y2="790" stroke="#64748b" strokeWidth="2" />
          <line x1="330" y1="790" x2="265" y2="790" stroke="#64748b" strokeWidth="2" />
          <line x1="265" y1="790" x2="265" y2="640" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          {/* ===== END ===== */}
          <line x1="160" y1="1300" x2="160" y2="1410" stroke="#64748b" strokeWidth="2" />
          <line x1="160" y1="1410" x2="440" y2="1410" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

          <ellipse cx="480" cy="1410" rx="80" ry="28" fill="#1e3a8a" filter="url(#shadow)" />
          <text x="480" y="1415" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">END</text>

          {/* ===== LEGEND ===== */}
          <rect x="560" y="900" width="290" height="280" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="705" y="925" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="700">Legend</text>

          {/* Rounded rect */}
          <rect x="580" y="940" width="60" height="24" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2" />
          <text x="650" y="957" fill="#334155" fontSize="10">Page / Screen</text>

          {/* Diamond */}
          <polygon points="610,980 630,994 610,1008 590,994" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.2" />
          <text x="650" y="999" fill="#334155" fontSize="10">Decision</text>

          {/* Ellipse */}
          <ellipse cx="610" cy="1030" rx="30" ry="14" fill="#1e3a8a" />
          <text x="650" y="1035" fill="#334155" fontSize="10">Start / End</text>

          {/* Green rect */}
          <rect x="580" y="1056" width="60" height="24" rx="6" fill="#d1fae5" stroke="#10b981" strokeWidth="1.2" />
          <text x="650" y="1073" fill="#334155" fontSize="10">Data Action</text>

          {/* Purple rect */}
          <rect x="580" y="1092" width="60" height="24" rx="6" fill="#fdf4ff" stroke="#a855f7" strokeWidth="1.2" />
          <text x="650" y="1109" fill="#334155" fontSize="10">PDF Output</text>

          {/* Dashed line */}
          <line x1="580" y1="1130" x2="640" y2="1130" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="650" y="1134" fill="#334155" fontSize="10">Navigation Hub</text>

          {/* Admin badge */}
          <rect x="580" y="1148" width="60" height="22" rx="6" fill="#fdf4ff" stroke="#a855f7" strokeWidth="1.2" />
          <text x="610" y="1163" textAnchor="middle" fill="#7c3aed" fontSize="9" fontWeight="600">Admin only</text>
          <text x="650" y="1162" fill="#334155" fontSize="10">Role-gated route</text>

          {/* Note */}
          <text x="705" y="1200" textAnchor="middle" fill="#94a3b8" fontSize="9">Reports / Users / Settings</text>
          <text x="705" y="1214" textAnchor="middle" fill="#94a3b8" fontSize="9">require Admin role</text>

        </svg>
      </div>
    </div>
  );
}
