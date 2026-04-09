// src/pages/MySeat.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { generateSeating, getActiveCoords } from '../utils/algorithm';
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
  const { currentEvent } = useExam();
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [seats, setSeats] = useState([]);

  const assignedSessions = state.sessions.filter(s =>
    state.allocations.some(a => a.sessionId === s.id && a.status === 'assigned')
  );

  useEffect(() => {
    if (assignedSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(assignedSessions[0].id);
    }
  }, [assignedSessions, selectedSessionId]);

  const session = state.sessions.find(s => s.id === selectedSessionId);
  const alloc = state.allocations.find(a => a.sessionId === selectedSessionId);
  const room = state.rooms.find(r => r.id === session?.roomId);

  useEffect(() => {
    if (session && room) {
      const grid = room.seatGrid;
      if (grid) {
        const { seats: gen } = generateSeating(grid, state.sessions.indexOf(session) + 42);
        setSeats(gen);
      } else {
        const { seats: gen } = generateSeating(session.maxStudents, state.sessions.indexOf(session) + 42);
        setSeats(gen);
      }
    }
  }, [session, room, state.sessions]);

  const branch = user?.branch || 'ISE';
  const mySeatIdx = user?.rollNo
    ? parseInt(user.rollNo.replace(/\D/g, '').slice(-3), 10) % Math.max(seats.length, 1)
    : 5;
  const bc = BRANCH_CONFIG[branch] || BRANCH_CONFIG.ISE;

  if (assignedSessions.length === 0) {
    return (
      <div>
        <div className="text-[22px] font-semibold tracking-tight mb-7">My Seat</div>
        <div className="bg-[#161b22] border border-[#30363d] p-12 text-center text-[#f0a500]">
          <Hourglass size={32} className="mx-auto mb-3" />
          <div className="text-[#e6edf3] font-semibold mb-2">Allocation Pending</div>
          <div className="text-[#7d8590] font-mono text-sm">Seat allocation has not been completed yet.</div>
        </div>
      </div>
    );
  }

  const rows = room?.rows || 6;
  const cols = room?.cols || 7;

  return (
    <div className="pb-10">
      <div className="flex flex-wrap gap-3 items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">My Seat</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">Your allocated seat · Others shown anonymously</div>
        </div>
        <select value={selectedSessionId || ''} onChange={e => setSelectedSessionId(e.target.value)}
          className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]">
          {assignedSessions.map(s => (
            <option key={s.id} value={s.id}>
              {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {s.slot} · {s.subject}
            </option>
          ))}
        </select>
      </div>

      {/* Seat Card */}
      {session && alloc && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 mb-5 flex flex-wrap gap-5 items-center">
          <div className={`w-20 h-20 border-2 flex flex-col items-center justify-center ${bc.hlBorder} ${bc.hlBg}`}>
            <div className="font-mono text-[10px] text-[#7d8590]">Seat</div>
            <div className="text-2xl font-bold">{String(mySeatIdx + 1).padStart(2, '0')}</div>
            <div className={`font-mono text-[9px] ${bc.text}`}>{branch}</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{user?.name}</div>
            <div className="font-mono text-xs text-[#7d8590]">{user?.rollNo} · {branch}</div>
            <div className="font-mono text-xs text-[#7d8590] mt-1">
              {room?.name} · Row {Math.floor(mySeatIdx / cols) + 1}, Col {(mySeatIdx % cols) + 1}
            </div>
            <div className="font-mono text-xs text-[#7d8590]">Invigilators: {alloc.f1Name}, {alloc.f2Name}</div>
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

      {/* Room Grid */}
      {session && alloc && room && (
        <div className="bg-[#161b22] border border-[#30363d] p-5">
          <div className="font-mono text-[11px] text-[#7d8590] uppercase tracking-[2px] mb-4">{room.name} · Seating Map</div>
          <div className="text-center mb-4">
            <div className="inline-block bg-[#30363d] font-mono text-[9px] text-[#7d8590] px-12 py-1.5 tracking-widest uppercase">◄ BLACKBOARD / FRONT ►</div>
          </div>
          <div className="overflow-auto">
            <div className="flex flex-col gap-1 items-start" style={{ minWidth: `${cols * 52}px` }}>
              {Array.from({ length: rows }, (_, ri) => (
                <div key={ri} className="flex gap-1 items-center">
                  <span className="font-mono text-[8px] text-[#7d8590] w-4 text-right flex-shrink-0">R{ri + 1}</span>
                  {Array.from({ length: cols }, (_, ci) => {
                    const cell = room.seatGrid?.[ri]?.[ci];
                    const isVoid = cell?.state === 'VOID';

                    if (isVoid) {
                      return <div key={ci} className="w-12 h-10 flex-shrink-0 bg-[#0d1117] border border-dashed border-[#30363d]/40" />;
                    }

                    const seat = seats.find(s => s.row === ri && s.col === ci);
                    const seatIdx = seat?.seatIndex ?? -1;
                    const isMySeat = seatIdx === mySeatIdx;
                    const bc2 = seat ? BRANCH_CONFIG[seat.branch] : null;

                    return (
                      <div key={ci} className={`w-12 h-10 flex-shrink-0 border flex flex-col items-center justify-center transition-all duration-150 ${
                        isMySeat
                          ? 'border-[#f0a500] bg-[#f0a500]/30 scale-[1.1] z-10 relative shadow-lg'
                          : bc2 ? `${bc2.border} ${bc2.bg}` : 'border-[#30363d] bg-[#1c2128]'
                      }`}>
                        <div className="font-mono text-[7px] text-[#7d8590]">{String(seatIdx + 1).padStart(2, '0')}</div>
                        {seat && <div className={`font-mono text-[7px] ${isMySeat ? 'text-[#f0a500] font-bold' : bc2?.text}`}>{seat.branch}</div>}
                        {isMySeat && <div className="font-mono text-[7px] text-[#f0a500]">YOU</div>}
                        {/* Privacy: no names for other students */}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-5 mt-4 font-mono text-[10px] text-[#7d8590] border-t border-[#30363d] pt-3">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#f0a500]/30 border border-[#f0a500]" /> Your Seat</span>
            {Object.entries(BRANCH_CONFIG).map(([key, v]) => (
              <span key={key} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 ${v.bg} border ${v.border}`} />{key}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
