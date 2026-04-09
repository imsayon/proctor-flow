// src/components/layout/Topbar.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bot, LogOut, User as UserIcon } from 'lucide-react';

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
      <div className="flex items-center gap-6">
        {/* AI Chat toggle (admin only) */}
        {isAdmin && onToggleChat && (
          <button onClick={onToggleChat} className="flex items-center gap-1.5 font-sans text-xs font-medium text-[#7d8590] hover:text-[#3fb950] transition-colors border border-transparent hover:border-[#3fb950]/30 hover:bg-[#3fb950]/10 px-3 py-1.5 rounded-full relative">
            <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
            <Bot size={16} className="text-[#3fb950]" />
            AI Assistant
          </button>
        )}
        <div className="flex items-center gap-3 border-l border-[#30363d] pl-4">
          <div className="text-right">
            <div className="text-xs font-semibold hover:text-[#e6edf3] cursor-pointer" onClick={() => isAdmin && navigate('/profile')}>{user?.name}</div>
            <div className="font-mono text-[9px]" style={{ color: roleColor }}>{roleLabel}</div>
          </div>
          <button onClick={() => isAdmin && navigate('/profile')} className="w-8 h-8 border rounded flex items-center justify-center font-mono text-[10px] font-semibold hover:bg-[#1c2128] transition-colors"
            style={{ borderColor: roleColor, color: roleColor }}>
            <UserIcon size={14} />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 font-mono text-[10px] text-[#7d8590] hover:text-[#f85149] transition-colors ml-2">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
