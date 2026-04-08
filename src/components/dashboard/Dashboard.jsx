import { useNavigate } from 'react-router-dom';
import { facultyData, scheduleData } from '../../lib/dummyData';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Dashboard</div>
          <div className="text-xs text-muted mt-1 font-mono">
            CIE-II · Nov 17–22, 2025 · 8 Exam Sessions
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/allocate')}
        >
          ⊞ Run Allocation
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        <StatCard color="var(--color-accent)" label="Faculty Available" value="15" sub="3 on leave / restricted" />
        <StatCard color="var(--color-accent2)" label="Exam Sessions" value="8" sub="4 rooms × 2 slots/day" />
        <StatCard color="var(--color-green)" label="Students Enrolled" value="312" sub="Across 4 branches" />
        <StatCard color="var(--color-red)" label="Conflicts Detected" value="3" sub="Leave window violations" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="flex items-center justify-between mb-[14px]">
            <div className="font-mono text-[11px] uppercase tracking-[2px] text-muted">Faculty Load — CIE II</div>
          </div>
          <div className="bg-surface border border-border overflow-hidden mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface2 border-b border-border">
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Faculty</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Duties</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Load</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {facultyData.slice(0, 8).map((f) => {
                  const pct = Math.round((f.duties / 3) * 100);
                  const color = pct >= 100 ? '#f85149' : pct >= 66 ? '#f0a500' : '#3fb950';
                  return (
                    <tr key={f.id} className="hover:bg-surface2 transition-colors border-b border-border last:border-0">
                      <td className="px-4 py-[11px] text-[13px]">{f.name.replace('Prof. ', '')}</td>
                      <td className="px-4 py-[11px] text-[12px] font-mono">{f.duties}/3</td>
                      <td className="px-4 py-[11px]">
                        <div className="bg-surface2 h-[6px] rounded-[1px] overflow-hidden w-[90px] inline-block align-middle">
                          <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </td>
                      <td className="px-4 py-[11px]">
                        {f.available ? (
                          <span className="pill pill-green">Active</span>
                        ) : (
                          <span className="pill pill-red">Leave</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-[14px]">
            <div className="font-mono text-[11px] uppercase tracking-[2px] text-muted">Exam Schedule</div>
          </div>
          <div className="bg-surface border border-border overflow-hidden mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface2 border-b border-border">
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Slot</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Subject</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Room</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((s) => (
                  <tr key={s.id} className="hover:bg-surface2 transition-colors border-b border-border last:border-0">
                    <td className="px-4 py-[11px] text-[12px] font-mono">{s.date}</td>
                    <td className="px-4 py-[11px] text-[12px] font-mono">{s.slot}</td>
                    <td className="px-4 py-[11px] text-[13px]">{s.subject}</td>
                    <td className="px-4 py-[11px] text-[12px] font-mono">{s.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ color, label, value, sub }) {
  return (
    <div className="bg-surface border border-border p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
      <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-muted mb-2.5">{label}</div>
      <div className="text-[32px] font-bold tracking-tight">{value}</div>
      <div className="text-[11px] text-muted mt-1.5">{sub}</div>
    </div>
  );
}
