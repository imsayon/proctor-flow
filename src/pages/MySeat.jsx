// src/pages/MySeat.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Hourglass } from 'lucide-react';

const BRANCH_CONFIG = {
  ISE: { border: 'border-[#1f6feb]/50', bg: 'bg-[#1f6feb]/10', text: 'text-[#58a6ff]', hlBorder: 'border-[#58a6ff]', hlBg: 'bg-[#1f6feb]/30' },
  CSE: { border: 'border-[#3fb950]/50', bg: 'bg-[#3fb950]/10', text: 'text-[#3fb950]', hlBorder: 'border-[#3fb950]', hlBg: 'bg-[#3fb950]/30' },
  ECE: { border: 'border-[#f0a500]/50', bg: 'bg-[#f0a500]/10', text: 'text-[#f0a500]', hlBorder: 'border-[#f0a500]', hlBg: 'bg-[#f0a500]/30' },
  MECH: { border: 'border-[#f85149]/50', bg: 'bg-[#f85149]/10', text: 'text-[#f85149]', hlBorder: 'border-[#f85149]', hlBg: 'bg-[#f85149]/30' },
};

export default function MySeat() {
  const { user } = useAuth();
  const { state } = useApp();
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const schedule = state.studentView?.schedule || [];
  const assignedSessions = schedule.filter(s => s.seat);

  const effectiveSessionId = selectedSessionId || assignedSessions[0]?.sessionId || null;
  const session = assignedSessions.find(s => s.sessionId === effectiveSessionId) || null;

  const branch = user?.branch || '—';
  const bc = BRANCH_CONFIG[branch] || BRANCH_CONFIG.ISE;

  if (assignedSessions.length === 0) {
    return (
      <div>
        <div className="text-[22px] font-semibold tracking-tight mb-7">My Seat</div>
        <div className="bg-[#161b22] border border-[#30363d] p-12 text-center text-[#f0a500]">
          <Hourglass size={32} className="mx-auto mb-3" />
          <div className="text-[#e6edf3] font-semibold mb-2">Allocation Pending</div>
          <div className="text-[#7d8590] font-mono text-sm">Your seat has not been published yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex flex-wrap gap-3 items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">My Seat</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">Your allocated seat</div>
        </div>
        <select value={effectiveSessionId || ''} onChange={e => setSelectedSessionId(e.target.value)}
          className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]">
          {assignedSessions.map(s => (
            <option key={s.sessionId} value={s.sessionId}>
              {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {s.slot} · {s.subject}
            </option>
          ))}
        </select>
      </div>

      {/* Seat Card */}
      {session && session.seat && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 mb-5 flex flex-wrap gap-5 items-center">
          <div className={`w-20 h-20 border-2 flex flex-col items-center justify-center ${bc.hlBorder} ${bc.hlBg}`}>
            <div className="font-mono text-[10px] text-[#7d8590]">Seat</div>
            <div className="text-2xl font-bold">{String(session.seat.seatNumber).padStart(2, '0')}</div>
            <div className={`font-mono text-[9px] ${bc.text}`}>{branch}</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{user?.name}</div>
            <div className="font-mono text-xs text-[#7d8590]">{user?.rollNo} · {branch}</div>
            <div className="font-mono text-xs text-[#7d8590] mt-1">
              {session.roomName || '—'} · Row {session.seat.row}, Col {session.seat.col}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-mono text-[10px] text-[#7d8590]">Session</div>
            <div className="font-semibold">{session.subject}</div>
            <div className="font-mono text-xs text-[#7d8590]">
              {new Date(session.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}, {session.startTime}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#161b22] border border-[#30363d] p-5">
        <div className="font-mono text-xs text-[#7d8590]">
          Seating map is not shown to students to protect privacy. If you need help finding your desk, contact your invigilator.
        </div>
      </div>
    </div>
  );
}
