// src/components/seating/Seating.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';
import { generateSeating, getActiveCoords } from '../../utils/algorithm';

const BRANCH_CONFIG = {
  ISE: { border: 'border-[#1f6feb]/50', bg: 'bg-[#1f6feb]/10', text: 'text-[#58a6ff]' },
  CSE: { border: 'border-[#3fb950]/50', bg: 'bg-[#3fb950]/10', text: 'text-[#3fb950]' },
  ECE: { border: 'border-[#f0a500]/50', bg: 'bg-[#f0a500]/10', text: 'text-[#f0a500]' },
  MECH: { border: 'border-[#f85149]/50', bg: 'bg-[#f85149]/10', text: 'text-[#f85149]' },
};

export default function Seating() {
  const { state } = useApp();
  const { user, isStudent } = useAuth();
  const { currentEvent } = useExam();
  const [selectedSession, setSelectedSession] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seed, setSeed] = useState(42);

  const eventSessions = currentEvent
    ? state.sessions.filter(s => s.eventId === currentEvent.id)
    : state.sessions;

  useEffect(() => {
    if (eventSessions.length && !selectedSession) setSelectedSession(eventSessions[0].id);
  }, [eventSessions, selectedSession]);

  const session = state.sessions.find(s => s.id === selectedSession);
  const room = state.rooms.find(r => r.id === session?.roomId);
  const alloc = state.allocations.find(a => a.sessionId === selectedSession);

  useEffect(() => {
    if (!room) return;
    const grid = room.seatGrid || room.benchLayout;
    if (grid) {
      const { seats: gen } = generateSeating(grid, seed);
      setSeats(gen);
    } else {
      const { seats: gen } = generateSeating(session?.maxStudents || 40, seed);
      setSeats(gen);
    }
  }, [room, seed, session]);

  const reshuffle = () => setSeed(s => s + 1);

  // Student's seat index (deterministic)
  const mySeatIdx = isStudent && user?.rollNo
    ? parseInt(user.rollNo.replace(/\D/g, '').slice(-3), 10) % Math.max(seats.length, 1)
    : -1;

  const rows = room?.rows || 6;
  const cols = room?.cols || 7;
  const grid = room?.seatGrid;

  return (
    <div className="pb-10">
      <div className="flex flex-wrap gap-3 items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Seating Chart</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">
            {isStudent ? 'Your seat is highlighted · Other students shown anonymously' : 'Fisher-Yates + Branch-Gap · Void-grid aware'}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <select value={selectedSession || ''} onChange={e => setSelectedSession(e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]">
            {eventSessions.map(s => (
              <option key={s.id} value={s.id}>
                {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {s.slot} · {s.subject}
              </option>
            ))}
          </select>
          {!isStudent && <button onClick={reshuffle} className="btn btn-outline text-xs">↻ Reshuffle</button>}
        </div>
      </div>

      {session && room && (
        <div className="bg-[#161b22] border border-[#30363d] p-5">
          {/* Room header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">{room.name}</div>
              <div className="font-mono text-xs text-[#7d8590]">{room.building} · {rows}×{cols} · {seats.length} students</div>
            </div>
            {alloc && (
              <div className="font-mono text-[10px] text-[#7d8590] text-right">
                <div>Invigilator 1: {alloc.f1Name || 'TBD'}</div>
                <div>Invigilator 2: {alloc.f2Name || 'TBD'}</div>
              </div>
            )}
          </div>

          {/* Blackboard */}
          <div className="text-center mb-3">
            <div className="inline-block bg-[#30363d] font-mono text-[9px] text-[#7d8590] px-12 py-1.5 tracking-widest uppercase">◄ BLACKBOARD / FRONT ►</div>
          </div>

          {/* Grid */}
          <div className="overflow-auto">
            <div className="flex flex-col gap-1 items-start" style={{ minWidth: `${cols * 52}px` }}>
              {Array.from({ length: rows }, (_, ri) => (
                <div key={ri} className="flex gap-1 items-center">
                  <span className="font-mono text-[8px] text-[#7d8590] w-4 text-right flex-shrink-0">R{ri + 1}</span>
                  {Array.from({ length: cols }, (_, ci) => {
                    const cell = grid?.[ri]?.[ci];
                    const isVoid = cell?.state === 'VOID' || (cell?.enabled === false);

                    if (isVoid) {
                      return <div key={ci} className="w-12 h-10 flex-shrink-0 bg-[#0d1117] border border-dashed border-[#30363d]/30" />;
                    }

                    // Find seat at this coord
                    const seat = seats.find(s => s.row === ri && s.col === ci);
                    const seatIdx = seat?.seatIndex ?? -1;
                    const isMySeat = isStudent && seatIdx === mySeatIdx;
                    const bc = seat ? BRANCH_CONFIG[seat.branch] : null;

                    return (
                      <div key={ci} className={`w-12 h-10 flex-shrink-0 border flex flex-col items-center justify-center transition-all duration-100
                        ${isMySeat
                          ? 'border-[#f0a500] bg-[#f0a500]/25 scale-[1.1] z-10 relative shadow-lg'
                          : bc ? `${bc.border} ${bc.bg}` : 'border-[#30363d] bg-[#1c2128]'
                        }`}>
                        {seat && (
                          <>
                            <div className="font-mono text-[7px] text-[#7d8590]">{String(seatIdx + 1).padStart(2, '0')}</div>
                            <div className={`font-mono text-[7px] ${isMySeat ? 'text-[#f0a500] font-bold' : bc?.text}`}>{seat.branch}</div>
                            {/* Student privacy: only show name to admin or if it's your seat */}
                            {(isMySeat || !isStudent) && (
                              <div className="font-mono text-[5px] text-[#484f58] truncate max-w-[44px]">{seat.name}</div>
                            )}
                            {isMySeat && <div className="font-mono text-[6px] text-[#f0a500] font-bold">YOU</div>}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-5 mt-4 font-mono text-[10px] text-[#7d8590] border-t border-[#30363d] pt-3">
            {isStudent && <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#f0a500]/30 border border-[#f0a500]" /> Your Seat</span>}
            {Object.entries(BRANCH_CONFIG).map(([key, v]) => (
              <span key={key} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 ${v.bg} border ${v.border}`} />{key}</span>
            ))}
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#0d1117] border border-dashed border-[#30363d]/30" /> Void</span>
          </div>
        </div>
      )}
    </div>
  );
}
