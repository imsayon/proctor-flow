// src/components/layout/Topbar.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = user?.role === 'admin' ? '#f0a500' : '#3fb950';
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Student';

  return (
    <div className="bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-7 h-14 sticky top-0 z-50">
      <div className="flex items-center gap-[10px] font-mono font-semibold text-[15px]">
        <div
          className="w-7 h-7 bg-[#f0a500] flex items-center justify-center text-[13px] font-bold text-black"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}
        >
          PF
        </div>
        <span>
          <span className="text-[#f0a500]">Proctor</span>Flow
        </span>
        <span className="font-mono text-[9px] text-[#7d8590] border border-[#30363d] px-2 py-0.5 ml-1 tracking-widest uppercase">v2</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[11px] text-[#7d8590] font-mono hidden md:block">
          ISE Dept · DSCE · AY 2025-26
        </span>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-mono text-[11px] text-[#e6edf3]">{user.name}</div>
              <div className="font-mono text-[9px] text-[#7d8590]">{user.email}</div>
            </div>
            <span className="font-mono text-[10px] px-2 py-[3px] border tracking-[1px] uppercase" style={{ borderColor: roleColor, color: roleColor }}>
              {roleLabel}
            </span>
            <button
              onClick={handleLogout}
              className="font-mono text-[10px] text-[#7d8590] border border-[#30363d] px-2 py-[3px] hover:text-[#f85149] hover:border-[#f85149] transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
