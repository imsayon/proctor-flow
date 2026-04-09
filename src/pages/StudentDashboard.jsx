// src/pages/StudentDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useExam, STATE_COLORS } from '../context/ExamContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Grid, Lock, CheckCircle2, Clock, Hand } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { state } = useApp();
  const { currentEvent } = useExam();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  // Only show sessions from published/completed events (or all in demo)
  const visibleEvents = state.examEvents.filter(e => ['published', 'completed'].includes(e.status));
  const allSessions = state.sessions
    .filter(s => visibleEvents.some(e => e.id === s.eventId) || !s.eventId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const isPublished = currentEvent?.status === 'published' || currentEvent?.status === 'completed';
  const nextSession = allSessions[0];
  const nextAlloc = nextSession ? state.allocations.find(a => a.sessionId === nextSession.id) : null;
  const nextRoom = nextSession ? state.rooms.find(r => r.id === nextSession.roomId) : null;

  return (
    <div>
      {/* Welcome */}
      <div className="bg-[#161b22] border border-[#30363d] p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3fb950]" />
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-xl font-semibold flex items-center gap-2">Welcome, {user?.name?.split(' ')[0]} <Hand size={18} className="text-[#f0a500]" /></div>
            <div className="font-mono text-xs text-[#7d8590] mt-1">{user?.rollNo} · {user?.branch} Branch · ISE Dept · DSCE</div>
          </div>
          <div className="text-right">
            {currentEvent && (
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATE_COLORS[currentEvent.status]?.dot }} />
                <span className="font-mono text-[9px]" style={{ color: STATE_COLORS[currentEvent.status]?.dot }}>{currentEvent.name} · {currentEvent.status}</span>
              </div>
            )}
            {nextSession && (
              <div>
                <div className="font-mono text-sm text-[#f0a500]">
                  {new Date(nextSession.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                </div>
                <div className="font-mono text-xs text-[#7d8590]">{nextSession.startTime} · {nextSession.slot}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0a500]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">Exams</div>
          <div className="text-3xl font-bold">{allSessions.length}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden cursor-pointer hover:border-[#f0a500] transition-colors"
          onClick={() => isPublished && navigate('/student/seat')}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3fb950]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">My Seat</div>
          <div className="text-3xl font-bold flex items-center">{isPublished ? <Grid size={28} /> : <Lock size={28} className="text-[#7d8590]" />}</div>
          <div className="text-[11px] text-[#7d8590] mt-1">{isPublished ? nextRoom?.name || 'View seat' : 'Available after publish'}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1f6feb]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">Branch</div>
          <div className="text-3xl font-bold">{user?.branch || 'ISE'}</div>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">
          Exam Schedule — Click any row for details
        </div>
        <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
          {allSessions.length === 0 ? (
            <div className="py-10 text-center text-[#7d8590] font-mono text-sm">
              {state.examEvents.length === 0 ? 'No exam events yet.' : 'Schedule not yet published.'}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1c2128] border-b border-[#30363d]">
                  {['#', 'Date', 'Slot', 'Time', 'Subject', 'Room', 'Status', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSessions.map((s, idx) => {
                  const room = state.rooms.find(r => r.id === s.roomId);
                  const alloc = state.allocations.find(a => a.sessionId === s.id);
                  const isExpanded = expandedId === s.id;
                  return (
                    <>
                      <tr key={s.id} onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className={`border-b border-[#30363d] cursor-pointer select-none transition-colors ${isExpanded ? 'bg-[#f0a500]/5' : 'hover:bg-[#1c2128]'}`}>
                        <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-[10px] font-mono text-xs">{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                        <td className="px-4 py-[10px]"><span className={`pill ${s.slot === 'FN' ? 'pill-blue' : 'pill-yellow'}`}>{s.slot}</span></td>
                        <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{s.startTime}–{s.endTime}</td>
                        <td className="px-4 py-[10px] text-sm font-medium">{s.subject}</td>
                        <td className="px-4 py-[10px] font-mono text-xs">{room?.name || '—'}</td>
                        <td className="px-4 py-[10px]">
                          <span className={`pill flex items-center w-max gap-1.5 ${alloc ? 'pill-green' : 'pill-yellow'}`}>{alloc ? <><CheckCircle2 size={12}/> Ready</> : <><Clock size={12}/> Pending</>}</span>
                        </td>
                        <td className="px-4 py-[10px] text-[#7d8590] text-xs font-mono">{isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${s.id}-d`} className="border-b border-[#30363d] bg-[#0d1117]">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div><div className="font-mono text-[9px] text-[#7d8590] uppercase mb-1">Full Date</div><div className="text-xs">{new Date(s.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
                              <div><div className="font-mono text-[9px] text-[#7d8590] uppercase mb-1">Timing</div><div className="text-xs">{s.startTime} – {s.endTime}</div></div>
                              <div><div className="font-mono text-[9px] text-[#7d8590] uppercase mb-1">Room</div><div className="text-xs text-[#f0a500]">{room?.name || '—'}</div></div>
                              {alloc ? (
                                <>
                                  <div><div className="font-mono text-[9px] text-[#7d8590] uppercase mb-1">Invigilators</div><div className="text-xs">{alloc.f1Name}, {alloc.f2Name}</div></div>
                                  {isPublished && (
                                    <button onClick={e => { e.stopPropagation(); navigate('/student/seat'); }} className="btn btn-primary text-[10px] !py-1.5 w-fit mt-2 flex items-center gap-1.5"><Grid size={12}/> View My Seat</button>
                                  )}
                                </>
                              ) : (
                                <div className="col-span-2 font-mono text-xs text-[#7d8590] italic">Allocation pending</div>
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
      </div>
    </div>
  );
}
