// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useExam, STATE_COLORS } from '../../context/ExamContext';
import { LayoutDashboard, Calendar, Users, Landmark, ClipboardList, PenLine, Zap, Grid, FileSearch } from 'lucide-react';

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Exam Events', icon: Calendar },
  { to: '/faculty', label: 'Faculty', icon: Users },
  { to: '/rooms', label: 'Rooms', icon: Landmark },
  { to: '/schedule', label: 'Schedule', icon: ClipboardList },
  { to: '/leaves', label: 'Leaves', icon: PenLine },
  { to: '/allocate', label: 'Allocate', icon: Zap },
  { to: '/seating', label: 'Seating', icon: Grid },
  { to: '/retrieve', label: 'Retrieve Info', icon: FileSearch, adminOnly: true },
];

const studentLinks = [
  { to: '/student', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/student/seat', label: 'My Seat', icon: Grid },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { state } = useApp();
  const { currentEvent } = useExam();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const links = isStudent
    ? studentLinks
    : adminLinks.filter(l => !l.adminOnly || isAdmin);

  const badges = {
    '/faculty': state.faculty.length,
    '/schedule': state.sessions.length,
    '/leaves': state.leaves.filter(l => l.status === 'pending').length,
    '/allocate': state.allocations.length,
  };

  return (
    <div className="w-[220px] bg-[#161b22] border-r border-[#30363d] flex flex-col min-h-0 flex-shrink-0">
      {/* Active event indicator */}
      {!isStudent && currentEvent && (
        <div className="px-4 py-3 border-b border-[#30363d]">
          <div className="font-mono text-[9px] text-[#7d8590] uppercase tracking-[1px] mb-1">Active Event</div>
          <div className="text-xs font-medium truncate">{currentEvent.name}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATE_COLORS[currentEvent.status]?.dot }} />
            <span className="font-mono text-[9px]" style={{ color: STATE_COLORS[currentEvent.status]?.dot }}>{currentEvent.status}</span>
          </div>
        </div>
      )}

      <nav className="flex-1 py-2 overflow-y-auto">
        {links.map(link => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} end={link.to === '/' || link.to === '/student'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-5 py-2.5 text-xs transition-colors border-l-2 ${
                  isActive ? 'border-[#f0a500] bg-[#f0a500]/5 text-[#e6edf3]' : 'border-transparent text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128]'
                }`
              }>
              <Icon size={16} />
              <span className="flex-1">{link.label}</span>
              {badges[link.to] > 0 && (
                <span className="font-mono text-[9px] text-[#7d8590] bg-[#30363d] px-1.5 py-0.5">{badges[link.to]}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#30363d]">
        <div className="font-mono text-[8px] text-[#484f58]">ProctorFlow v3</div>
        <div className="font-mono text-[8px] text-[#484f58]">Institution-scoped</div>
      </div>
    </div>
  );
}
