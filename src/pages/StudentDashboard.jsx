// src/pages/StudentDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { state } = useApp();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  // Include ALL sessions (even cancelled so student can see them), sorted by date
  const allSessions = [...state.sessions].sort((a, b) => a.date.localeCompare(b.date));
  const activeSessions = allSessions.filter(s => s.status !== 'cancelled');

  const nextSession = activeSessions[0] || null;
  const nextAlloc = nextSession ? state.allocations.find(a => a.sessionId === nextSession.id) : null;
  const nextRoom = nextSession ? state.rooms.find(r => r.id === nextSession.roomId) : null;

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const slotPill = (slot) => slot === 'FN' ? 'pill-blue' : slot === 'AN' ? 'pill-yellow' : 'pill-green';

  const statusPill = (session, alloc) => {
    if (session.status === 'cancelled') return { cls: 'pill-red', label: '✗ Cancelled' };
    if (session.status === 'completed') return { cls: 'pill-green', label: '✓ Completed' };
    if (alloc) return { cls: 'pill-green', label: '✓ Allocated' };
    return { cls: 'pill-yellow', label: '⏳ Pending' };
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-[#161b22] border border-[#30363d] p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3fb950]" />
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-xl font-semibold">Welcome, {user?.name?.split(' ')[0]} 👋</div>
            <div className="font-mono text-xs text-[#7d8590] mt-1">
              {user?.rollNo} · {user?.branch} Branch · ISE Dept · DSCE
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] text-[#7d8590] uppercase tracking-widest">Next Exam</div>
            {nextSession ? (
              <div className="mt-1">
                <div className="font-mono text-sm text-[#f0a500]">
                  {new Date(nextSession.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                </div>
                <div className="font-mono text-xs text-[#7d8590]">{nextSession.startTime} · {nextSession.slot}</div>
              </div>
            ) : (
              <div className="font-mono text-xs text-[#7d8590] mt-1">No upcoming exams</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0a500]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">Total Exams</div>
          <div className="text-3xl font-bold">{activeSessions.length}</div>
          <div className="text-[11px] text-[#7d8590] mt-1">CIE-II Schedule</div>
        </div>
        <div
          className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden cursor-pointer hover:border-[#f0a500] transition-colors"
          onClick={() => navigate('/student/seat')}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3fb950]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">My Seat</div>
          <div className="text-3xl font-bold">{nextAlloc ? '→' : '—'}</div>
          <div className="text-[11px] text-[#7d8590] mt-1">{nextRoom?.name || 'Allocation pending'}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1f6feb]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">Branch</div>
          <div className="text-3xl font-bold">{user?.branch || 'ISE'}</div>
          <div className="text-[11px] text-[#7d8590] mt-1">Semester 5</div>
        </div>
      </div>

      {/* Full Schedule — All sessions clickable */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590]">
            CIE-II Schedule — Click any row for details
          </div>
          <button onClick={() => navigate('/student/seat')} className="btn btn-primary text-xs !py-1.5">
            ▦ View My Seat
          </button>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
          {allSessions.length === 0 ? (
            <div className="py-10 text-center text-[#7d8590] font-mono text-sm">No sessions scheduled yet.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1c2128] border-b border-[#30363d]">
                  {['#', 'Date', 'Slot', 'Time', 'Subject', 'Room', 'Status', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSessions.map((s, idx) => {
                  const room = state.rooms.find(r => r.id === s.roomId);
                  const alloc = state.allocations.find(a => a.sessionId === s.id);
                  const { cls, label } = statusPill(s, alloc);
                  const isExpanded = expandedId === s.id;
                  const isCancelled = s.status === 'cancelled';

                  return (
                    <>
                      <tr
                        key={s.id}
                        onClick={() => toggleExpand(s.id)}
                        className={`border-b border-[#30363d] cursor-pointer select-none transition-colors ${
                          isExpanded
                            ? 'bg-[#f0a500]/5 border-[#f0a500]/30'
                            : isCancelled
                            ? 'opacity-50 hover:opacity-70 hover:bg-[#1c2128]'
                            : 'hover:bg-[#1c2128]'
                        }`}
                      >
                        <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-[10px] font-mono text-xs">
                          {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-4 py-[10px]">
                          <span className={`pill ${slotPill(s.slot)}`}>{s.slot}</span>
                        </td>
                        <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{s.startTime}–{s.endTime}</td>
                        <td className="px-4 py-[10px] text-sm font-medium">
                          {s.subject}
                          {isCancelled && <span className="ml-2 font-mono text-[9px] text-[#f85149] uppercase tracking-widest">[Cancelled]</span>}
                        </td>
                        <td className="px-4 py-[10px] font-mono text-xs">{room?.name || s.roomId}</td>
                        <td className="px-4 py-[10px]">
                          <span className={`pill ${cls}`}>{label}</span>
                        </td>
                        <td className="px-4 py-[10px] text-[#7d8590] text-xs font-mono">
                          {isExpanded ? '▲' : '▼'}
                        </td>
                      </tr>

                      {/* Expandable detail row */}
                      {isExpanded && (
                        <tr key={`${s.id}-detail`} className="border-b border-[#30363d] bg-[#0d1117]">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <DetailCell label="Full Date" value={new Date(s.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} />
                              <DetailCell label="Timing" value={`${s.startTime} – ${s.endTime} (${s.slot === 'FN' ? 'Forenoon' : s.slot === 'AN' ? 'Afternoon' : 'Evening'})`} />
                              <DetailCell label="Examination Room" value={room?.name || '—'} highlight />
                              <DetailCell label="Max Students" value={String(s.maxStudents)} />
                              {alloc ? (
                                <>
                                  <DetailCell label="Invigilator 1" value={alloc.f1Name || 'TBD'} />
                                  <DetailCell label="Invigilator 2" value={alloc.f2Name || 'TBD'} />
                                  <DetailCell label="Your Seat (est.)" value={`Seat in ${room?.name || 'TBD'}`} />
                                  <div className="flex flex-col gap-2">
                                    <div className="font-mono text-[9px] uppercase tracking-[1px] text-[#7d8590]">Actions</div>
                                    <button
                                      onClick={e => { e.stopPropagation(); navigate('/student/seat'); }}
                                      className="btn btn-primary text-[10px] !py-1.5 !px-3 w-fit"
                                    >
                                      ▦ View My Seat
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="col-span-4 font-mono text-xs text-[#7d8590] italic">
                                  Invigilator assignment pending — check back after allocation is run.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="font-mono text-[10px] text-[#7d8590] mt-2">
          ↑ Click any row to expand exam details · Cancelled exams shown at reduced opacity
        </div>
      </div>
    </div>
  );
}

function DetailCell({ label, value, highlight }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[1px] text-[#7d8590] mb-1">{label}</div>
      <div className={`text-[12px] font-medium ${highlight ? 'text-[#f0a500]' : 'text-[#e6edf3]'}`}>{value}</div>
    </div>
  );
}
