// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useExam, STATE_COLORS } from '../../context/ExamContext';

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/events', label: 'Exam Events', icon: '📅' },
  { to: '/faculty', label: 'Faculty', icon: '👤' },
  { to: '/rooms', label: 'Rooms', icon: '🏛' },
  { to: '/schedule', label: 'Schedule', icon: '📋' },
  { to: '/leaves', label: 'Leaves', icon: '📝' },
  { to: '/allocate', label: 'Allocate', icon: '⚡' },
  { to: '/seating', label: 'Seating', icon: '▦' },
  { to: '/rag', label: 'RAG Import', icon: '📄' },
];

const studentLinks = [
  { to: '/student', label: 'My Dashboard', icon: '◆' },
  { to: '/student/seat', label: 'My Seat', icon: '▦' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { state } = useApp();
  const { currentEvent } = useExam();
  const isStudent = user?.role === 'student';
  const links = isStudent ? studentLinks : adminLinks;

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
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/' || link.to === '/student'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-5 py-2.5 text-xs transition-colors border-l-2 ${
                isActive ? 'border-[#f0a500] bg-[#f0a500]/5 text-[#e6edf3]' : 'border-transparent text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128]'
              }`
            }>
            <span className="text-sm">{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            {badges[link.to] > 0 && (
              <span className="font-mono text-[9px] text-[#7d8590] bg-[#30363d] px-1.5 py-0.5">{badges[link.to]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#30363d]">
        <div className="font-mono text-[8px] text-[#484f58]">ProctorFlow v3</div>
        <div className="font-mono text-[8px] text-[#484f58]">ISE Dept · DSCE</div>
      </div>
    </div>
  );
}
