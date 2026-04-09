// src/components/layout/Topbar.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onToggleChat }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = user?.role === 'admin' ? '#f0a500' : '#3fb950';
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Student';

  return (
    <div className="bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-7 h-14 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="text-base font-semibold tracking-tight">
          <span className="text-[#f0a500]">Proctor</span>Flow
        </div>
        <span className="font-mono text-[9px] text-[#484f58]">v3</span>
      </div>
      <div className="flex items-center gap-4">
        {/* AI Chat toggle (admin only) */}
        {isAdmin && onToggleChat && (
          <button onClick={onToggleChat} className="flex items-center gap-1.5 font-mono text-[10px] text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <span className="w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
            AI Chat
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="font-mono text-[9px]" style={{ color: roleColor }}>{roleLabel}</div>
          </div>
          <div className="w-7 h-7 border flex items-center justify-center font-mono text-[10px] font-semibold"
            style={{ borderColor: roleColor, color: roleColor }}>
            {user?.name?.[0] || '?'}
          </div>
        </div>
        <button onClick={handleLogout} className="font-mono text-[10px] text-[#7d8590] hover:text-[#f85149] transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}
