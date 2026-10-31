import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Clock, Circle, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import SearchBar from '../components/students/SearchBar';
import { VERIFICATION_STAGES } from '../utils/demoData';
import { isVerificationStageAssignedToUser, VERIFICATION_UPDATED_EVENT } from '../utils/localStorage';
import { getAssignedStudentIdsForOfficer } from '../utils/verification';
import { getOverallVerificationStatus, getPendingVerificationItems } from '../utils/verification';

const verificationPageStateByKey = new Map();

export default function VerificationPage() {
  const { students } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState(() => verificationPageStateByKey.get(location.key)?.search || '');
  const [expandedStages, setExpandedStages] = useState(
    () => verificationPageStateByKey.get(location.key)?.expandedStages || {}
  );
  const [, setVerificationRevision] = useState(0);

  useEffect(() => {
    verificationPageStateByKey.set(location.key, { search, expandedStages });
  }, [expandedStages, location.key, search]);

  useEffect(() => {
    const refreshVerification = () => setVerificationRevision(revision => revision + 1);
    window.addEventListener(VERIFICATION_UPDATED_EVENT, refreshVerification);
    window.addEventListener('storage', refreshVerification);
    return () => {
      window.removeEventListener(VERIFICATION_UPDATED_EVENT, refreshVerification);
      window.removeEventListener('storage', refreshVerification);
    };
  }, []);

  const records = students.map(student => ({
    ...student,
    pendingStages: VERIFICATION_STAGES.map(stage => ({
      ...stage,
      pendingItems: getPendingVerificationItems(stage.id, student.id),
    })).filter(stage =>
      stage.pendingItems.length > 0 &&
      isVerificationStageAssignedToUser(student.id, stage.id, user)
    ),
  })).filter(student =>
    student.pendingStages.some(stage => stage.pendingItems.length > 0) &&
    (user?.role !== 'Faculty' || getAssignedStudentIdsForOfficer(user.id).includes(student.id)) &&
    (student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.applicationNo.toLowerCase().includes(search.toLowerCase()))
  );

  const openVerificationItem = (studentId, stageId, itemId) => {
    const state = {
      recordId: studentId,
      returnTo: '/verify',
      returnToKey: location.key,
      openSection: 2,
      focusItem: itemId,
    };
    if (stageId === 1) {
      navigate('/verification/stage-1', { state });
      return;
    }
    navigate(`/verification/stage-${stageId}/${studentId}`, { state });
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pending Verification</h1>
          <p className="text-sm text-slate-400">{records.length} records awaiting verification</p>
        </div>
        <button onClick={() => navigate('/students/new')} className="btn-primary">
          <UserPlus size={15} /> New Admission
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search pending records..." />

      {records.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No pending verifications</p>
          <p className="text-xs text-slate-400 mt-1">All records are verified or search returned no results</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(student => (
            <section key={student.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{student.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <span className="font-mono text-blue-700">{student.applicationNo}</span>
                    <span className="mx-2">·</span>
                    {student.programme} · {student.branch}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={getOverallVerificationStatus(student.id)} />
                  <button
                    onClick={() => openVerificationItem(
                      student.id,
                      student.pendingStages[0].id,
                      student.pendingStages[0].pendingItems[0].id
                    )}
                    className="btn-primary btn-sm"
                  >
                    Verify Now
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {student.pendingStages.map(stage => {
                  const expanded = expandedStages[student.id]?.[stage.id] ?? false;
                  return (
                    <section key={stage.id} className="px-4 py-3 sm:px-5">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`pending-items-${student.id}-${stage.id}`}
                        onClick={() => setExpandedStages(previous => ({
                          ...previous,
                          [student.id]: {
                            ...previous[student.id],
                            [stage.id]: !expanded,
                          },
                        }))}
                        className="flex w-full items-center gap-2 text-left"
                      >
                        {expanded
                          ? <ChevronDown size={15} className="flex-shrink-0 text-slate-400" />
                          : <ChevronRight size={15} className="flex-shrink-0 text-slate-400" />}
                        <Circle size={9} className="flex-shrink-0 fill-red-500 text-red-500" />
                        <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">
                          Stage {stage.id} – {stage.name}
                        </span>
                        <span className="flex-shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          {stage.pendingItems.length} Pending
                        </span>
                      </button>

                      <div
                        id={`pending-items-${student.id}-${stage.id}`}
                        className="ml-8 mt-2"
                        hidden={!expanded}
                      >
                        <ul className="space-y-1">
                          {stage.pendingItems.map(item => (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => openVerificationItem(student.id, stage.id, item.id)}
                                className="flex items-start gap-2 rounded px-2 py-1 text-left text-xs text-slate-600 hover:bg-red-50 hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                              >
                                <Circle size={7} className="mt-1 flex-shrink-0 fill-red-500 text-red-500" />
                                <span>{item.label}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
