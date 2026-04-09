// src/components/dashboard/Dashboard.jsx
import { useApp } from '../../context/AppContext';
import { useExam, EXAM_STATES, STATE_COLORS } from '../../context/ExamContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { state } = useApp();
  const { currentEvent } = useExam();
  const nav = useNavigate();

  const eventSessions = currentEvent
    ? state.sessions.filter(s => s.eventId === currentEvent.id)
    : state.sessions;
  const eventAllocs = currentEvent
    ? state.allocations.filter(a => a.eventId === currentEvent.id)
    : state.allocations;

  const stats = [
    { label: 'Faculty', value: state.faculty.length, color: '#1f6feb', link: '/faculty' },
    { label: 'Rooms', value: state.rooms.length, color: '#a371f7', link: '/rooms' },
    { label: 'Sessions', value: eventSessions.length, color: '#f0a500', link: '/schedule' },
    { label: 'Allocated', value: eventAllocs.filter(a => a.status === 'assigned').length, color: '#3fb950', link: '/allocate' },
    { label: 'Leaves', value: state.leaves.filter(l => l.status === 'pending').length, color: '#f85149', link: '/leaves' },
    { label: 'Students', value: state.students?.length || 0, color: '#58a6ff', link: '/rag' },
  ];

  const availableFac = state.faculty.filter(f => f.available).length;
  const onLeave = state.faculty.filter(f => !f.available).length;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Dashboard</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">
            {currentEvent ? `${currentEvent.name} · ${currentEvent.type} · ${currentEvent.year}` : 'No active event — select one from Exam Events'}
          </div>
        </div>
        {currentEvent && (
          <span className={`pill ${STATE_COLORS[currentEvent.status]?.bg} ${STATE_COLORS[currentEvent.status]?.text} border ${STATE_COLORS[currentEvent.status]?.border}`}>
            {currentEvent.status}
          </span>
        )}
      </div>

      {/* State machine stepper */}
      {currentEvent && (
        <div className="flex gap-0 mb-6">
          {EXAM_STATES.map((s, i) => {
            const idx = EXAM_STATES.indexOf(currentEvent.status);
            const sc = STATE_COLORS[s];
            return (
              <div key={s} className={`flex-1 py-2 px-3 border border-[#30363d] -mr-[1px] text-center font-mono text-[10px] transition-all ${
                i <= idx ? `border-transparent` : 'bg-[#1c2128] text-[#484f58]'
              }`} style={i <= idx ? { background: sc.dot + '15', color: sc.dot, borderColor: sc.dot + '40' } : {}}>
                {i <= idx ? '✓ ' : ''}{s}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} onClick={() => nav(s.link)}
            className="bg-[#161b22] border border-[#30363d] p-4 relative overflow-hidden cursor-pointer hover:border-[#7d8590] transition-colors">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: s.color }} />
            <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2">{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Faculty load overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#161b22] border border-[#30363d] p-5">
          <div className="font-mono text-[11px] text-[#7d8590] uppercase tracking-[2px] mb-4">Faculty Availability</div>
          <div className="flex gap-6 mb-3">
            <div><span className="text-2xl font-bold text-[#3fb950]">{availableFac}</span> <span className="text-xs text-[#7d8590]">available</span></div>
            <div><span className="text-2xl font-bold text-[#f85149]">{onLeave}</span> <span className="text-xs text-[#7d8590]">on leave / unavailable</span></div>
          </div>
          <div className="space-y-1">
            {state.faculty.slice(0, 8).map(f => (
              <div key={f.id} className="flex items-center gap-2">
                <div className="flex-1 font-mono text-[10px] text-[#7d8590] truncate">{f.name}</div>
                <div className="w-24 h-1.5 bg-[#30363d] overflow-hidden">
                  <div className="h-full bg-[#1f6feb]" style={{ width: `${Math.min(100, (f.duties || 0) * 25)}%` }} />
                </div>
                <div className="font-mono text-[9px] text-[#7d8590] w-4 text-right">{f.duties || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-5">
          <div className="font-mono text-[11px] text-[#7d8590] uppercase tracking-[2px] mb-4">Upcoming Sessions</div>
          {eventSessions.slice(0, 6).map(s => {
            const room = state.rooms.find(r => r.id === s.roomId);
            return (
              <div key={s.id} className="flex items-center gap-3 py-1.5 border-b border-[#30363d] last:border-0">
                <span className={`pill ${s.slot === 'FN' ? 'pill-blue' : s.slot === 'AN' ? 'pill-yellow' : 'pill-green'}`}>{s.slot}</span>
                <span className="font-mono text-xs">{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                <span className="text-xs font-medium flex-1 truncate">{s.subject}</span>
                <span className="font-mono text-[10px] text-[#7d8590]">{room?.name || '—'}</span>
              </div>
            );
          })}
          {eventSessions.length === 0 && (
            <div className="font-mono text-xs text-[#7d8590] py-4 text-center">No sessions for this event</div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => nav('/events')} className="btn btn-outline text-xs">📅 Exam Events</button>
        <button onClick={() => nav('/allocate')} className="btn btn-outline text-xs">⚡ Run Allocation</button>
        <button onClick={() => nav('/rag')} className="btn btn-outline text-xs">📄 RAG Import</button>
        <button onClick={() => nav('/seating')} className="btn btn-outline text-xs">▦ Seating</button>
      </div>
    </div>
  );
}
