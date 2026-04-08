// src/components/dashboard/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { faculty, rooms, sessions, leaves, allocations } = state;

  const availableFaculty = faculty.filter(f => f.available).length;
  const onLeave = faculty.filter(f => !f.available).length;
  const totalStudents = sessions.reduce((acc, s) => acc + s.maxStudents, 0);
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const assignedSessions = allocations.filter(a => a.status === 'assigned').length;

  const recentActivity = [
    ...leaves.filter(l => l.status === 'pending').slice(0, 2).map(l => ({ type: 'warn', msg: `Leave conflict: ${l.facultyName} (${l.from} → ${l.to})` })),
    allocations.length > 0
      ? { type: 'ok', msg: `Allocation complete — ${assignedSessions}/${sessions.length} sessions assigned` }
      : { type: 'info', msg: 'No allocation run yet. Click "Run Allocation" to begin.' },
  ];

  const stats = [
    { label: 'Faculty Available', value: availableFaculty, sub: `${onLeave} on leave/restricted`, color: '#f0a500' },
    { label: 'Exam Sessions', value: sessions.length, sub: `${rooms.length} rooms configured`, color: '#1f6feb' },
    { label: 'Students Enrolled', value: totalStudents, sub: 'Across 4 branches', color: '#3fb950' },
    { label: 'Leave Conflicts', value: pendingLeaves, sub: 'Pending review', color: '#f85149' },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Dashboard</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">CIE-II · Nov 17–22, 2025 · {sessions.length} Exam Sessions</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/allocate')}>⊞ Run Allocation</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="bg-[#161b22] border border-[#30363d] p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: s.color }} />
            <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] mb-2.5">{s.label}</div>
            <div className="text-[32px] font-bold tracking-tight">{s.value}</div>
            <div className="text-[11px] text-[#7d8590] mt-1.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Faculty Load */}
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">Faculty Load — CIE II</div>
          <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1c2128] border-b border-[#30363d]">
                  {['Faculty', 'Duties', 'Load', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {faculty.slice(0, 9).map(f => {
                  const pct = Math.round((f.duties / 3) * 100);
                  const bColor = pct >= 100 ? '#f85149' : pct >= 66 ? '#f0a500' : '#3fb950';
                  return (
                    <tr key={f.id} className="hover:bg-[#1c2128] border-b border-[#30363d] last:border-0 transition-colors">
                      <td className="px-4 py-[10px] text-[12px]">{f.name.replace('Prof. ', '')}</td>
                      <td className="px-4 py-[10px] font-mono text-[11px]">{f.duties}/3</td>
                      <td className="px-4 py-[10px]">
                        <div className="bg-[#1c2128] h-[5px] rounded-sm overflow-hidden w-20 inline-block align-middle">
                          <div className="h-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: bColor }} />
                        </div>
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={`pill ${f.available ? 'pill-green' : 'pill-red'}`}>{f.available ? 'Active' : 'Leave'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exam Schedule */}
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">Exam Schedule</div>
          <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1c2128] border-b border-[#30363d]">
                  {['Date', 'Slot', 'Subject', 'Room'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const room = rooms.find(r => r.id === s.roomId);
                  return (
                    <tr key={s.id} className="hover:bg-[#1c2128] border-b border-[#30363d] last:border-0 transition-colors">
                      <td className="px-4 py-[10px] font-mono text-[11px]">{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                      <td className="px-4 py-[10px] font-mono text-[11px]">{s.slot} {s.startTime}</td>
                      <td className="px-4 py-[10px] text-[12px]">{s.subject}</td>
                      <td className="px-4 py-[10px] font-mono text-[11px]">{room?.name.replace('Room ', '') || s.roomId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">System Activity</div>
        <div className="bg-black border border-[#30363d] p-4 font-mono text-[11px] space-y-1">
          {recentActivity.map((a, i) => (
            <div key={i} className={
              a.type === 'ok' ? 'text-[#3fb950]' : a.type === 'warn' ? 'text-[#f0a500]' : 'text-[#58a6ff]'
            }>
              [{a.type.toUpperCase()}] {a.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
