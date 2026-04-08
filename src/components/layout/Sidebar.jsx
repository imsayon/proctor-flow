import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const routes = [
    { path: '/', name: 'Dashboard', icon: '◈' },
    { path: '/faculty', name: 'Faculty', icon: '◉', count: '18' },
    { path: '/leaves', name: 'Leave Requests', icon: '◷', count: '3', alert: true },
    { path: '/allocate', name: 'Run Allocation', icon: '⊞' },
    { path: '/seating', name: 'Seating Chart', icon: '▦' },
  ];

  return (
    <div className="w-[220px] bg-surface border-r border-border py-5 flex-shrink-0">
      <div className="font-mono text-[9px] tracking-[2px] uppercase text-muted px-5 pt-4 pb-2">
        Navigation
      </div>
      {routes.map((r) => (
        <NavLink
          key={r.path}
          to={r.path}
          className={({ isActive }) =>
            `flex items-center gap-[10px] py-[9px] px-5 text-[13px] cursor-pointer transition-all duration-150 border-l-2 ${
              isActive
                ? 'text-accent border-accent bg-[#f0a500]/10'
                : 'text-muted border-transparent hover:text-text hover:bg-surface2'
            }`
          }
        >
          <span className="text-[15px] w-[18px] text-center">{r.icon}</span>
          {r.name}
          {r.count && (
            <span
              className={`ml-auto font-mono text-[10px] px-[6px] py-[2px] ${
                r.alert ? 'bg-red/15 text-red' : 'bg-surface2 text-muted'
              }`}
            >
              {r.count}
            </span>
          )}
        </NavLink>
      ))}

      <div className="font-mono text-[9px] tracking-[2px] uppercase text-muted px-5 pt-4 pb-2 mt-3">
        Exam Schedule
      </div>
      <div className="flex items-center gap-[10px] py-[9px] px-5 text-[13px] text-muted border-l-2 border-transparent">
        <span className="text-[15px] w-[18px] text-center">◈</span> CIE – I
        <span className="ml-auto font-mono text-[10px] px-[6px] py-[2px] bg-surface2 text-muted">
          Done
        </span>
      </div>
      <NavLink
        to="/allocate"
        className="flex items-center gap-[10px] py-[9px] px-5 text-[13px] cursor-pointer border-l-2 border-transparent text-accent"
      >
        <span className="text-[15px] w-[18px] text-center">◈</span> CIE – II
        <span className="ml-auto font-mono text-[10px] px-[6px] py-[2px] bg-accent/15 text-accent">
          Active
        </span>
      </NavLink>
      <div className="flex items-center gap-[10px] py-[9px] px-5 text-[13px] text-muted border-l-2 border-transparent">
        <span className="text-[15px] w-[18px] text-center">◈</span> SEE
        <span className="ml-auto font-mono text-[10px] px-[6px] py-[2px] bg-surface2 text-muted">
          Pending
        </span>
      </div>
    </div>
  );
}
