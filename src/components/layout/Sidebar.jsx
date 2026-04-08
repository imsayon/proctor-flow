// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { user } = useAuth();
  const { state } = useApp();

  const pendingLeaves = state.leaves.filter(l => l.status === 'pending').length;
  const unassigned = state.allocations.filter(a => a.status === 'unassigned').length;

  const adminRoutes = [
    { path: '/', name: 'Dashboard', icon: '◈', end: true },
    { path: '/faculty', name: 'Faculty', icon: '◉', count: String(state.faculty.length) },
    { path: '/rooms', name: 'Room Config', icon: '⊟' },
    { path: '/schedule', name: 'Exam Schedule', icon: '📅' },
    { path: '/leaves', name: 'Leave Requests', icon: '◷', count: pendingLeaves > 0 ? String(pendingLeaves) : null, alert: pendingLeaves > 0 },
    { path: '/allocate', name: 'Run Allocation', icon: '⊞', count: unassigned > 0 ? `${unassigned} pending` : null, alert: unassigned > 0 },
    { path: '/seating', name: 'Seating Chart', icon: '▦' },
  ];

  const studentRoutes = [
    { path: '/student', name: 'My Dashboard', icon: '◈', end: true },
    { path: '/student/schedule', name: 'My Schedule', icon: '📅' },
    { path: '/student/seat', name: 'My Seat', icon: '▦' },
  ];

  const routes = user?.role === 'student' ? studentRoutes : adminRoutes;

  return (
    <div className="w-[220px] bg-[#161b22] border-r border-[#30363d] py-5 flex-shrink-0 flex flex-col">
      <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#7d8590] px-5 pt-2 pb-2">
        {user?.role === 'student' ? 'Student Portal' : 'Administration'}
      </div>
      {routes.map((r) => (
        <NavLink
          key={r.path}
          to={r.path}
          end={r.end}
          className={({ isActive }) =>
            `flex items-center gap-[10px] py-[9px] px-5 text-[13px] cursor-pointer transition-all duration-150 border-l-2 ${
              isActive
                ? 'text-[#f0a500] border-[#f0a500] bg-[#f0a500]/10'
                : 'text-[#7d8590] border-transparent hover:text-[#e6edf3] hover:bg-[#1c2128]'
            }`
          }
        >
          <span className="text-[15px] w-[18px] text-center">{r.icon}</span>
          {r.name}
          {r.count && (
            <span className={`ml-auto font-mono text-[10px] px-[6px] py-[2px] ${
              r.alert ? 'bg-[#f85149]/15 text-[#f85149]' : 'bg-[#1c2128] text-[#7d8590]'
            }`}>
              {r.count}
            </span>
          )}
        </NavLink>
      ))}

      {user?.role !== 'student' && (
        <>
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#7d8590] px-5 pt-4 pb-2 mt-2 border-t border-[#30363d]">
            CIE Status
          </div>
          <div className="flex items-center gap-[10px] py-[9px] px-5 text-[13px] text-[#7d8590] border-l-2 border-transparent">
            <span className="text-[15px] w-[18px] text-center">◈</span> CIE – I
            <span className="ml-auto font-mono text-[10px] px-[6px] py-[2px] bg-[#1c2128] text-[#7d8590]">Done</span>
          </div>
          <div className="flex items-center gap-[10px] py-[9px] px-5 text-[13px] text-[#f0a500] border-l-2 border-transparent">
            <span className="text-[15px] w-[18px] text-center">◈</span> CIE – II
            <span className="ml-auto font-mono text-[10px] px-[6px] py-[2px] bg-[#f0a500]/15 text-[#f0a500]">Active</span>
          </div>
          <div className="flex items-center gap-[10px] py-[9px] px-5 text-[13px] text-[#7d8590] border-l-2 border-transparent">
            <span className="text-[15px] w-[18px] text-center">◈</span> SEE
            <span className="ml-auto font-mono text-[10px] px-[6px] py-[2px] bg-[#1c2128] text-[#7d8590]">Pending</span>
          </div>
        </>
      )}
    </div>
  );
}
