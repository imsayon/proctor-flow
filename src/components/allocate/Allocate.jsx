// src/components/allocate/Allocate.jsx
import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { runGreedyAllocation, getActiveCoords } from '../../utils/algorithm';
import { exportCSV, exportPDF } from '../../utils/export';
import { batchWrite } from '../../lib/firestore';

const ALGO_STEPS = [
  { id: 'step1', num: '01', name: 'Constraint Classification', desc: 'Hard + Soft constraints' },
  { id: 'step2', num: '02', name: 'Priority Queue Init', desc: 'Sort by load factor' },
  { id: 'step3', num: '03', name: 'Greedy Allocation', desc: 'Backtrack on conflict' },
  { id: 'step4', num: '04', name: 'Student Shuffling', desc: 'Fisher-Yates + gap constraint' },
];

export default function Allocate() {
  const { state, dispatch } = useApp();
  const { institutionId, user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({ maxDutiesPerFaculty: 3, leaveBufferDays: 3, enforceRoomNonRepetition: true });
  const logRef = useRef(null);

  const appendLog = (entry) => {
    setLogs(prev => {
      const next = [...prev, entry];
      requestAnimationFrame(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; });
      return next;
    });
  };

  const runAllocation = async () => {
    if (state.sessions.length === 0) { toast('Add exam sessions first!', 'error'); return; }
    if (state.faculty.length === 0) { toast('Add faculty first!', 'error'); return; }

    setPhase('running');
    setProgress(0);
    setLogs([]);
    setCurrentStep(0);
    dispatch({ type: 'CLEAR_ALLOCATIONS' });

    const stepDuration = 600;
    for (let i = 0; i < ALGO_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, stepDuration));
      setProgress((i + 1) * 25);
    }

    const { allocations, logs: algoLogs } = runGreedyAllocation(
      state.sessions, state.faculty, state.leaves, config
    );

    algoLogs.forEach((entry, idx) => {
      setTimeout(() => appendLog(entry), idx * 80);
    });

    await new Promise(r => setTimeout(r, algoLogs.length * 80 + 300));

    dispatch({ type: 'SET_ALLOCATIONS', payload: allocations });

    // Build student-safe projections for student accounts (no invigilators, no neighbor visibility).
    try {
      const sessions = state.sessions;
      const roomsById = new Map(state.rooms.map(r => [r.id, r]));

      const views = (state.students || [])
        .filter(s => s.uid) // only provisioned students can have a secure view
        .map(s => {
          const ident = s.usn || s.rollNo || '';
          const num = parseInt(String(ident).replace(/\D/g, '').slice(-3), 10);

          const schedule = sessions.map(sess => {
            const room = roomsById.get(sess.roomId);
            const coords = room?.seatGrid ? getActiveCoords(room.seatGrid) : Array.from({ length: sess.maxStudents || 0 }, (_, i) => ({ row: Math.floor(i / 7), col: i % 7 }));
            const idx = Number.isFinite(num) && coords.length ? (num % coords.length) : 0;
            const seatNumber = coords.length ? idx + 1 : null;
            const rc = coords.length ? coords[idx] : null;

            return {
              sessionId: sess.id,
              date: sess.date,
              slot: sess.slot,
              startTime: sess.startTime,
              endTime: sess.endTime,
              subject: sess.subject,
              roomName: room?.name || null,
              seat: seatNumber ? { seatNumber, row: rc.row + 1, col: rc.col + 1 } : null,
            };
          });

          return {
            id: s.uid,
            uid: s.uid,
            name: s.name,
            usn: s.usn,
            branch: s.branch,
            semester: s.semester || null,
            updatedAt: new Date().toISOString(),
            schedule,
          };
        });

      if (institutionId && views.length) {
        await batchWrite(institutionId, 'student_views', views);
      }
    } catch (e) {
      console.warn('[Allocate] Failed to build student views', e);
    }

    setProgress(100);
    setPhase('done');
    const assigned = allocations.filter(a => a.status === 'assigned').length;
    toast(`✓ Allocation complete: ${assigned}/${state.sessions.length} sessions assigned`);
  };

  const resetAllocation = () => {
    setPhase('idle');
    setProgress(0);
    setCurrentStep(-1);
    setLogs([]);
    dispatch({ type: 'CLEAR_ALLOCATIONS' });
  };

  const handleExportCSV = () => {
    if (!state.allocations.length) { toast('Run allocation first!', 'error'); return; }
    exportCSV(state.allocations, state.sessions, state.rooms);
    toast('✓ CSV downloaded!');
  };

  const handleExportPDF = () => {
    if (!state.allocations.length) { toast('Run allocation first!', 'error'); return; }
    exportPDF(state.allocations, state.sessions, state.rooms);
    toast('✓ PDF ready — check your print dialog');
  };

  const allocations = state.allocations;
  const sessions = state.sessions;

  return (
    <div className="pb-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Allocation Engine</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">Greedy + Backtracking · Hard &amp; Soft Constraint Validation</div>
        </div>
        {/* Export buttons always visible if data exists */}
        {allocations.length > 0 && (
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="btn btn-outline text-xs flex items-center gap-1.5">
              ↓ CSV
            </button>
            <button onClick={handleExportPDF} className="btn btn-outline text-xs flex items-center gap-1.5">
              ↓ PDF
            </button>
          </div>
        )}
      </div>

      {/* Algorithm Pipeline */}
      <div className="bg-[#161b22] border border-[#30363d] p-6 mb-6">
        <div className="text-[15px] font-semibold mb-1">Algorithm Pipeline</div>
        <div className="text-xs text-[#7d8590] font-mono mb-5">Greedy allocation + backtracking with hard/soft constraint validation</div>

        <div className="flex gap-0 mb-6 overflow-x-auto">
          {ALGO_STEPS.map((s, idx) => {
            const isDone = phase === 'done' || (phase === 'running' && idx < currentStep);
            const isActive = phase === 'running' && idx === currentStep;
            return (
              <div key={s.id} className={`flex-1 min-w-[120px] p-[14px_16px] border border-[#30363d] -mr-[1px] transition-all duration-300 ${
                isDone ? 'border-[#3fb950] bg-[#3fb950]/5' : isActive ? 'border-[#f0a500] bg-[#f0a500]/5' : 'bg-[#1c2128]'
              }`}>
                <div className="font-mono text-[10px] text-[#7d8590] mb-1">{s.num}</div>
                <div className="text-xs font-semibold">{s.name}</div>
                <div className={`text-[10px] mt-1 font-mono transition-colors ${isDone ? 'text-[#3fb950]' : isActive ? 'text-[#f0a500]' : 'text-[#7d8590]'}`}>
                  {isDone ? '✓ Done' : isActive ? '⟳ Running...' : s.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Config */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Max Duties / Faculty</label>
            <input type="number" min={1} max={8} value={config.maxDutiesPerFaculty}
              onChange={e => setConfig(c => ({ ...c, maxDutiesPerFaculty: Number(e.target.value) }))}
              className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Leave Buffer (days)</label>
            <input type="number" min={0} max={7} value={config.leaveBufferDays}
              onChange={e => setConfig(c => ({ ...c, leaveBufferDays: Number(e.target.value) }))}
              className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Room Non-Repetition</label>
            <button
              onClick={() => setConfig(c => ({ ...c, enforceRoomNonRepetition: !c.enforceRoomNonRepetition }))}
              className={`py-2 px-3 font-mono text-xs border transition-colors text-left ${config.enforceRoomNonRepetition ? 'border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950]' : 'border-[#30363d] text-[#7d8590]'}`}>
              {config.enforceRoomNonRepetition ? '✓ Enforce (strict)' : '× Disabled'}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {isAdmin && <button onClick={runAllocation} disabled={phase === 'running'} className="btn btn-primary">
            {phase === 'running' ? '⟳ Running...' : '▶ Run Allocation'}
          </button>}
          {phase !== 'idle' && isAdmin && (
            <button onClick={resetAllocation} className="btn btn-outline">↺ Reset</button>
          )}
        </div>

        {/* Progress */}
        {phase !== 'idle' && (
          <div className="mt-5">
            <div className={`font-mono text-[11px] mb-2 ${phase === 'done' ? 'text-[#3fb950]' : 'text-[#7d8590]'}`}>
              {phase === 'done'
                ? `✓ Allocation complete — ${allocations.filter(a => a.status === 'assigned').length}/${sessions.length} sessions assigned`
                : 'Processing...'}
            </div>
            <div className="bg-[#1c2128] h-2 border border-[#30363d] overflow-hidden mb-3 relative">
              <div className="h-full bg-[#f0a500] transition-all duration-500 relative overflow-hidden" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation: 'shimmer 1.2s infinite' }} />
              </div>
            </div>
            <div ref={logRef} className="bg-black border border-[#30363d] p-3 h-[130px] overflow-y-auto font-mono text-[11px] leading-relaxed">
              {logs.map((entry, i) => (
                <div key={i} className={entry.type === 'ok' ? 'text-[#3fb950]' : entry.type === 'warn' ? 'text-[#f0a500]' : 'text-[#58a6ff]'}>
                  {entry.msg}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      {allocations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590]">
              Allocation Results
              <span className="ml-3 text-[#3fb950]">{allocations.filter(a => a.status === 'assigned').length}/{sessions.length} assigned</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="btn btn-outline text-[10px] !py-1 !px-3 gap-1">
                ↓ Download CSV
              </button>
              <button onClick={handleExportPDF} className="btn btn-outline text-[10px] !py-1 !px-3 gap-1">
                ↓ Print / PDF
              </button>
            </div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1c2128] border-b border-[#30363d]">
                  {['#', 'Date', 'Session', 'Subject', 'Room', 'Invigilator 1', 'Invigilator 2', 'Students', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocations.map((a, idx) => {
                  const session = sessions.find(s => s.id === a.sessionId);
                  const room = state.rooms.find(r => r.id === session?.roomId);
                  return (
                    <tr key={a.id || a.sessionId} className="hover:bg-[#1c2128] border-b border-[#30363d] last:border-0 transition-colors">
                      <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-4 py-[10px] font-mono text-xs">
                        {session ? new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-[10px] font-mono text-xs">
                        {session?.slot && <span className={`pill ${session.slot === 'FN' ? 'pill-blue' : session.slot === 'AN' ? 'pill-yellow' : 'pill-green'} mr-1`}>{session.slot}</span>}
                        {session?.startTime}
                      </td>
                      <td className="px-4 py-[10px] text-xs font-medium max-w-[140px] truncate">{session?.subject || '—'}</td>
                      <td className="px-4 py-[10px] font-mono text-xs">{room?.name?.replace('Room ', '') || '—'}</td>
                      <td className="px-4 py-[10px] text-xs">{a.f1Name || <span className="text-[#f85149]">Unassigned</span>}</td>
                      <td className="px-4 py-[10px] text-xs">{a.f2Name || <span className="text-[#f85149]">Unassigned</span>}</td>
                      <td className="px-4 py-[10px] font-mono text-xs">{a.studentCount}</td>
                      <td className="px-4 py-[10px]">
                        <span className={`pill ${a.status === 'assigned' ? 'pill-green' : 'pill-red'}`}>
                          {a.status === 'assigned' ? '✓ Valid' : '✗ Unassigned'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
