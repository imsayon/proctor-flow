import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Bot, LogOut, UserRound, Menu, GraduationCap } from "lucide-react";
import { ThemeSwitcher } from "../../theme";

const pages = {
  "/": "Overview", "/events": "Exam events", "/faculty": "Faculty",
  "/rooms": "Rooms", "/schedule": "Schedule", "/leaves": "Leave requests",
  "/allocate": "Allocation engine", "/seating": "Seating plans",
  "/retrieve": "Document intelligence", "/profile": "Profile",
  "/students": "Students", "/student": "Student portal",
  "/student/seat": "My seat", "/faculty-portal": "Faculty portal",
};

export default function Topbar({ onToggleChat, onMenu }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate("/login"); };
  const canProfile = user?.role === "admin" || user?.role === "faculty";
  return (
    <header className="invigra-topbar">
      <div className="invigra-topbar-leading">
        <button type="button" className="invigra-menu-btn" onClick={onMenu} aria-label="Toggle navigation"><Menu size={20}/></button>
        <div className="invigra-mark" aria-hidden="true"><GraduationCap size={20} strokeWidth={2.2}/></div>
        <div className="invigra-wordmark">invigra<span className="invigra-wordmark-period">.</span></div>
        <span className="invigra-header-divider" />
        <div className="invigra-breadcrumb">Workspace <span>/</span> <strong>{pages[location.pathname] || "Workspace"}</strong></div>
      </div>
      <div className="invigra-topbar-actions">
        <ThemeSwitcher compact />
        {isAdmin && onToggleChat && (
          <button type="button" onClick={onToggleChat} className="invigra-ai-button" title="Open AI assistant">
            <Bot size={17}/><span>Ask Invigra</span><span className="invigra-online-dot" />
          </button>
        )}
        <button type="button" onClick={() => canProfile && navigate("/profile")} className="invigra-user" title={user?.name || "Account"}>
          <span className="invigra-avatar"><UserRound size={16}/></span>
          <span className="invigra-user-copy"><strong>{user?.name || "User"}</strong><small>{user?.role || "Member"}</small></span>
        </button>
        <button type="button" className="invigra-icon-btn" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={17}/></button>
      </div>
    </header>
  );
}