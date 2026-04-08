// src/components/seating/Seating.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { generateSeating } from '../../utils/algorithm';

const BRANCH_CONFIG = {
  ISE: { label: 'ISE', border: 'border-[#1f6feb]/50', bg: 'bg-[#1f6feb]/10', text: 'text-[#58a6ff]' },
  CSE: { label: 'CSE', border: 'border-[#3fb950]/50', bg: 'bg-[#3fb950]/10', text: 'text-[#3fb950]' },
  ECE: { label: 'ECE', border: 'border-[#f0a500]/50', bg: 'bg-[#f0a500]/10', text: 'text-[#f0a500]' },
  MECH: { label: 'MECH', border: 'border-[#f85149]/50', bg: 'bg-[#f85149]/10', text: 'text-[#f85149]' },
};

export default function Seating() {
  const { state } = useApp();
  const [selectedAllocId, setSelectedAllocId] = useState(null);
  const [seed, setSeed] = useState(42);
  const [seats, setSeats] = useState([]);

  const hasAllocations = state.allocations.length > 0;
  const sessions = state.sessions;

  // Pick first allocation by default
  useEffect(() => {
    if (state.allocations.length > 0 && !selectedAllocId) {
      setSelectedAllocId(state.allocations[0].sessionId);
    }
  }, [state.allocations, selectedAllocId]);

  const selectedAlloc = state.allocations.find(a => a.sessionId === selectedAllocId);
  const selectedSession = sessions.find(s => s.id === selectedAllocId);
  const selectedRoom = state.rooms.find(r => r.id === selectedSession?.roomId);

  useEffect(() => {
    if (selectedAlloc) {
      // Use stored seats if available, otherwise generate
      if (selectedAlloc.seats?.length > 0) {
        setSeats(selectedAlloc.seats);
      } else if (selectedSession) {
        const { seats: generated } = generateSeating(selectedSession.maxStudents, seed);
        setSeats(generated);
      }
    }
  }, [selectedAlloc, selectedSession, seed]);

  const handleReshuffle = () => setSeed(Math.floor(Math.random() * 9999));

  const assignedSessions = sessions.filter(s => state.allocations.some(a => a.sessionId === s.id && a.status === 'assigned'));

  if (!hasAllocations) {
    return (
      <div>
        <div className="flex items-start justify-between mb-7">
          <div>
            <div className="text-[22px] font-semibold tracking-tight">Seating Chart</div>
            <div className="text-xs text-[#7d8590] mt-1 font-mono">Anti-cheating layout · Fisher-Yates + Branch-Gap Constraint</div>
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-12 text-center">
          <div className="text-[#f0a500] text-2xl mb-3">⊞</div>
          <div className="text-[#e6edf3] font-semibold mb-2">No Allocation Data</div>
          <div className="text-[#7d8590] font-mono text-sm">Run the Allocation Engine first to generate seating charts.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex flex-wrap gap-3 items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Seating Chart</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">Anti-cheating layout · Fisher-Yates + Branch-Gap Constraint</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={selectedAllocId || ''} onChange={e => setSelectedAllocId(e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]">
            {assignedSessions.map(s => {
              const room = state.rooms.find(r => r.id === s.roomId);
              return (
                <option key={s.id} value={s.id}>
                  {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {s.slot} · {s.subject} · {room?.name || s.roomId}
                </option>
              );
            })}
          </select>
          <button onClick={handleReshuffle} className="btn btn-outline">↺ Reshuffle</button>
        </div>
      </div>

      {selectedAlloc && selectedSession && selectedRoom && (
        <div className="bg-[#161b22] border border-[#30363d] p-6">
          <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
            <div>
              <div className="font-semibold text-base">{selectedRoom.name}</div>
              <div className="font-mono text-[11px] text-[#7d8590] mt-1">
                {new Date(selectedSession.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long' })} · {selectedSession.slot} {selectedSession.startTime}–{selectedSession.endTime}
              </div>
              <div className="font-mono text-[11px] text-[#7d8590] mt-0.5">
                {selectedSession.subject} · Invigilators: {selectedAlloc.f1Name}, {selectedAlloc.f2Name}
              </div>
            </div>
            <span className="pill pill-green">✓ Conflict-free</span>
          </div>

          {/* Blackboard indicator */}
          <div className="text-center mb-4">
            <div className="inline-block bg-[#30363d] font-mono text-[10px] text-[#7d8590] px-16 py-1.5 tracking-widest uppercase">
              ◄ BLACKBOARD / FRONT ►
            </div>
          </div>

          {/* Seat Grid using room layout */}
          <div className="overflow-auto">
            <div className="flex flex-col gap-1.5 items-start" style={{ minWidth: `${(selectedRoom.cols || 7) * 76}px` }}>
              {selectedRoom.benchLayout.map((row, ri) => (
                <div key={ri} className="flex gap-1.5 items-center">
                  <span className="font-mono text-[9px] text-[#7d8590] w-5 text-right flex-shrink-0">R{ri + 1}</span>
                  {row.map((cell, ci) => {
                    const seatIdx = seats.findIndex((_, sidx) => {
                      // map enabled cells in order
                      let enabledCount = 0;
                      for (let rr = 0; rr < selectedRoom.rows; rr++) {
                        for (let cc = 0; cc < selectedRoom.cols; cc++) {
                          if (selectedRoom.benchLayout[rr]?.[cc]?.enabled) {
                            if (enabledCount === sidx && rr === ri && cc === ci) return true;
                            enabledCount++;
                          }
                        }
                      }
                      return false;
                    });

                    // Compute enabled index for this cell
                    let enabledIdx = -1;
                    if (cell.enabled) {
                      let count = 0;
                      outer: for (let rr = 0; rr < selectedRoom.rows; rr++) {
                        for (let cc = 0; cc < selectedRoom.cols; cc++) {
                          if (selectedRoom.benchLayout[rr]?.[cc]?.enabled) {
                            if (rr === ri && cc === ci) { enabledIdx = count; break outer; }
                            count++;
                          }
                        }
                      }
                    }

                    const seat = enabledIdx >= 0 && enabledIdx < seats.length ? seats[enabledIdx] : null;
                    const bc = seat ? BRANCH_CONFIG[seat.branch] : null;

                    if (!cell.enabled) {
                      return <div key={ci} className="w-[68px] h-[52px] flex-shrink-0 bg-[#0d1117] border border-dashed border-[#30363d]/50" title="Aisle/Disabled" />;
                    }

                    return (
                      <div key={ci} title={seat ? `${seat.name} · ${seat.branch}` : 'Empty'}
                        className={`w-[68px] h-[52px] flex-shrink-0 border p-1.5 cursor-default transition-all duration-150 hover:scale-[1.04] ${bc ? `${bc.border} ${bc.bg}` : 'border-[#30363d] bg-[#1c2128]'}`}>
                        <div className="font-mono text-[8px] text-[#7d8590]">{String(enabledIdx + 1).padStart(2, '0')}</div>
                        {seat && (
                          <>
                            <div className="text-[9px] font-semibold leading-tight mt-0.5 truncate">{seat.name}</div>
                            <div className={`font-mono text-[8px] mt-0.5 ${bc?.text}`}>{seat.branch}</div>
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
          <div className="flex flex-wrap gap-5 mt-4">
            {Object.entries(BRANCH_CONFIG).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-[11px] text-[#7d8590]">
                <div className={`w-2.5 h-2.5 rounded-sm ${val.bg} border ${val.border}`} />
                {val.label}
              </div>
            ))}
            <div className="flex items-center gap-2 text-[11px] text-[#7d8590]">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#0d1117] border border-dashed border-[#30363d]" />
              Aisle
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-6 font-mono text-[11px] text-[#7d8590] border-t border-[#30363d] pt-3">
            <span>Total seats: <span className="text-[#e6edf3]">{selectedRoom.capacity}</span></span>
            <span>Students: <span className="text-[#e6edf3]">{seats.length}</span></span>
            <span>Seed: <span className="text-[#e6edf3]">{seed}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
