import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { useExam, STATE_COLORS } from "../../context/ExamContext";
import { LayoutDashboard, CalendarDays, Users, Building2, ClipboardList, CalendarOff, WandSparkles, Grid2X2, FileSearch, GraduationCap, ArrowUpRight, X, ShieldCheck } from "lucide-react";

const admin = [
  ["/", "Overview", LayoutDashboard], ["/events", "Exam events", CalendarDays],
  ["/faculty", "Faculty", Users], ["/rooms", "Rooms", Building2],
  ["/schedule", "Schedule", ClipboardList], ["/leaves", "Leave requests", CalendarOff],
  ["/allocate", "Run allocation", WandSparkles], ["/seating", "Seating", Grid2X2],
  ["/retrieve", "Document intake", FileSearch], ["/students", "Students", GraduationCap], ["/access", "Access requests", ShieldCheck],
];
const faculty = admin.filter(([path]) => path !== "/retrieve" && path !== "/students")
  .map(([path,label,icon]) => path === "/" ? ["/faculty-portal", label, icon] : [path,label,icon]);
const student = [
  ["/student", "My overview", LayoutDashboard],
  ["/student/seat", "My seat", Grid2X2],
];

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  const { state } = useApp();
  const { currentEvent } = useExam();
  const links = user?.role === "student" ? student : user?.role === "faculty" ? faculty : admin;
  const counts = {
    "/faculty": state.faculty.length, "/schedule": state.sessions.length,
    "/leaves": state.leaves.filter(l => l.status === "pending").length,
    "/allocate": state.allocations.length,
  };
  return <>
    {mobileOpen && <button type="button" onClick={onClose} className="invigra-mobile-scrim" aria-label="Close navigation" />}
    <aside className={"invigra-sidebar" + (mobileOpen ? " is-open" : "")}>
      <div className="invigra-sidebar-label">NAVIGATION <button type="button" className="invigra-sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={17}/></button></div>
      <nav className="invigra-nav" aria-label="Main navigation">
        {links.map(([path, label, Icon]) => (
          <NavLink key={path} to={path} onClick={onClose}
            end={path === "/" || path === "/student"}
            className={({isActive}) => "invigra-navlink" + (isActive ? " active" : "")}>
            <Icon size={18} strokeWidth={1.9}/>
            <span>{label}</span>
            {counts[path] > 0 && <small className="invigra-navcount">{counts[path]}</small>}
          </NavLink>
        ))}
      </nav>
      <div className="invigra-sidebar-bottom">
        {currentEvent && user?.role !== "student" && (
          <div className="invigra-event-card">
            <div className="invigra-event-eyebrow"><span className="invigra-event-pulse"/> ACTIVE EXAM</div>
            <strong title={currentEvent.name}>{currentEvent.name}</strong>
            <div className="invigra-event-status">
              <span style={{color: STATE_COLORS[currentEvent.status]?.dot || "var(--ui-accent)"}}>{currentEvent.status}</span>
              <ArrowUpRight size={15}/>
            </div>
          </div>
        )}
        <div className="invigra-sidebar-foot">Invigra <span>Academic operations · 2026</span></div>
      </div>
    </aside>
  </>;
}