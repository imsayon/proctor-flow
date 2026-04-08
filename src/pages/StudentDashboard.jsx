// src/pages/StudentDashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { state } = useApp();
  const navigate = useNavigate();

  const upcomingSessions = [...state.sessions]
    .filter(s => s.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextSession = upcomingSessions[0];
  const nextRoom = nextSession ? state.rooms.find(r => r.id === nextSession.roomId) : null;
  const nextAlloc = nextSession ? state.allocations.find(a => a.sessionId === nextSession.id) : null;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-[#161b22] border border-[#30363d] p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3fb950]" />
        <div className="flex items-start justify-between">
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
          <div className="text-3xl font-bold">{upcomingSessions.length}</div>
          <div className="text-[11px] text-[#7d8590] mt-1">CIE-II Schedule</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden cursor-pointer hover:border-[#f0a500] transition-colors" onClick={() => navigate('/student/seat')}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3fb950]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">My Seat</div>
          <div className="text-3xl font-bold">
            {nextAlloc ? state.sessions.indexOf(nextSession) + 1 : '—'}
          </div>
          <div className="text-[11px] text-[#7d8590] mt-1">{nextRoom?.name || 'Allocation pending'}</div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1f6feb]" />
          <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">Branch</div>
          <div className="text-3xl font-bold">{user?.branch || 'ISE'}</div>
          <div className="text-[11px] text-[#7d8590] mt-1">Semester 5</div>
        </div>
      </div>

      {/* Next Exam Detail */}
      {nextSession && (
        <div className="mb-6">
          <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">Next Examination</div>
          <div className="bg-[#161b22] border border-[#f0a500]/30 p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">{nextSession.subject}</div>
                <div className="font-mono text-xs text-[#7d8590] mt-1">
                  {new Date(nextSession.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="font-mono text-xs text-[#7d8590]">{nextSession.startTime} – {nextSession.endTime} ({nextSession.slot})</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-[#7d8590] uppercase">Room</div>
                <div className="text-[#f0a500] font-semibold">{nextRoom?.name || '—'}</div>
                {nextAlloc && (
                  <div className="font-mono text-[10px] text-[#7d8590] mt-1">
                    Invigilators: {nextAlloc.f1Name}, {nextAlloc.f2Name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate('/student/seat')} className="btn btn-primary text-xs">▦ View My Seat</button>
              <button onClick={() => navigate('/student/schedule')} className="btn btn-outline text-xs">📅 Full Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Preview */}
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">CIE-II Schedule</div>
        <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1c2128] border-b border-[#30363d]">
                {['Date', 'Slot', 'Time', 'Subject', 'Room', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcomingSessions.map(s => {
                const room = state.rooms.find(r => r.id === s.roomId);
                const alloc = state.allocations.find(a => a.sessionId === s.id);
                return (
                  <tr key={s.id} className="hover:bg-[#1c2128] border-b border-[#30363d] last:border-0">
                    <td className="px-4 py-[10px] font-mono text-xs">
                      {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-[10px]">
                      <span className={`pill ${s.slot === 'FN' ? 'pill-blue' : 'pill-yellow'}`}>{s.slot}</span>
                    </td>
                    <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{s.startTime}–{s.endTime}</td>
                    <td className="px-4 py-[10px] text-sm font-medium">{s.subject}</td>
                    <td className="px-4 py-[10px] font-mono text-xs">{room?.name || s.roomId}</td>
                    <td className="px-4 py-[10px]">
                      <span className={`pill ${alloc ? 'pill-green' : 'pill-yellow'}`}>
                        {alloc ? '✓ Allocated' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
