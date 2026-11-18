import { useApp } from "../../context/AppContext";
import { useExam, EXAM_STATES } from "../../context/ExamContext";
import { useNavigate } from "react-router-dom";
import { CalendarDays, WandSparkles, FileSearch, Grid2X2, UsersRound, Building2, Layers3, CheckCheck, ClipboardCheck, GraduationCap, ArrowUpRight, Activity, Clock3 } from "lucide-react";
const cardIcons = [UsersRound, Building2, Layers3, CheckCheck, ClipboardCheck, GraduationCap];
export default function Dashboard() {
  const { state } = useApp();
  const { currentEvent } = useExam();
  const navigate = useNavigate();
  const sessions = currentEvent ? state.sessions.filter(s => s.eventId === currentEvent.id) : state.sessions;
  const allocations = currentEvent ? state.allocations.filter(a => a.eventId === currentEvent.id) : state.allocations;
  const available = state.faculty.filter(f => f.available).length;
  const onLeave = state.faculty.filter(f => !f.available).length;
  const stats = [
    { label:"Faculty members", value:state.faculty.length, note:"Available roster", href:"/faculty" },
    { label:"Exam rooms", value:state.rooms.length, note:"Space inventory", href:"/rooms" },
    { label:"Exam sessions", value:sessions.length, note:"In current scope", href:"/schedule" },
    { label:"Assignments", value:allocations.filter(a=>a.status==="assigned").length, note:"Confirmed duties", href:"/allocate" },
    { label:"Pending leaves", value:state.leaves.filter(l=>l.status==="pending").length, note:"Awaiting review", href:"/leaves" },
    { label:"Students", value:state.students?.length || 0, note:"Registered profiles", href:"/students" },
  ];
  const activeIdx = currentEvent ? EXAM_STATES.indexOf(currentEvent.status) : -1;
  return <div className="pb-12 max-w-[1450px] mx-auto">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <div className="iv-eyebrow">EXAM OPERATIONS / OVERVIEW</div>
        <h1 className="iv-heading">Good to see you. Here's the picture.</h1>
        <p className="iv-subhead">{currentEvent ? [currentEvent.name,currentEvent.type,currentEvent.year].filter(Boolean).join(" · ") : "Your academic operations workspace. Select an exam event to get started."}</p>
      </div>
      <button type="button" className="iv-action primary" onClick={()=>navigate("/allocate")}><WandSparkles size={16}/> Run allocation <ArrowUpRight size={16}/></button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {stats.map((s,i)=>{
        const Icon=cardIcons[i];
        return <button type="button" key={s.label} className="iv-stat text-left" onClick={()=>navigate(s.href)}>
          <div className="iv-stat-icon"><Icon size={19} strokeWidth={1.8}/></div>
          <div className="iv-stat-label">{s.label}</div>
          <div className="iv-stat-value">{s.value}</div>
          <div className="iv-stat-hint">{s.note}</div>
        </button>;
      })}
    </div>
    {currentEvent && <div className="iv-panel mb-6">
      <div className="iv-panel-title"><h3>Exam lifecycle</h3><span className="iv-chip">{currentEvent.status || "Draft"}</span></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {EXAM_STATES.map((name,i)=><div className={"iv-state"+(activeIdx>=0 && i<=activeIdx ? " is-done" : "")} key={name}>
          <span className="iv-state-dot" /><span className="truncate">{name}</span>
        </div>)}
      </div>
    </div>}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
      <section className="iv-panel lg:col-span-2">
        <div className="iv-panel-title"><h3>Faculty availability</h3><span className="iv-chip"><Activity size={11} className="inline mr-1"/> Live roster</span></div>
        <div className="flex gap-8 mb-5">
          <div><div className="text-[29px] font-extrabold tracking-tight" style={{color:"var(--ui-green)"}}>{available}</div><div className="iv-subhead">Available</div></div>
          <div><div className="text-[29px] font-extrabold tracking-tight" style={{color:"var(--ui-red)"}}>{onLeave}</div><div className="iv-subhead">Unavailable</div></div>
        </div>
        <div className="space-y-3">
          {state.faculty.slice(0,6).map(f=><div key={f.id} className="flex items-center gap-3">
            <span className="text-xs truncate w-30 flex-none">{f.name}</span>
            <div className="iv-progress-track flex-1"><div className="iv-progress-fill" style={{width:Math.min(100,Math.max(0,(f.duties||0)*25))+"%"}}/></div>
            <span className="text-xs w-5 text-right" style={{color:"var(--ui-muted)"}}>{f.duties||0}</span>
          </div>)}
          {!state.faculty.length && <p className="iv-subhead">No faculty records yet.</p>}
        </div>
      </section>
      <section className="iv-panel lg:col-span-3">
        <div className="iv-panel-title"><h3>Upcoming sessions</h3><button type="button" onClick={()=>navigate("/schedule")} className="iv-chip">Full timetable <ArrowUpRight size={12} className="inline"/></button></div>
        {sessions.slice(0,6).map(s=>{
          const room=state.rooms.find(r=>r.id===s.roomId);
          const date=s.date ? new Date(s.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
          return <div className="iv-session-row" key={s.id}>
            <span className="iv-session-date"><CalendarDays size={13} className="inline mr-1"/>{date}</span>
            <span className="iv-chip">{s.slot||"Session"}</span>
            <strong className="text-xs truncate">{s.subject||"Unnamed exam"}</strong>
            <span className="iv-session-room truncate">{room?.name||"Room TBD"}</span>
          </div>;
        })}
        {!sessions.length && <div className="py-14 text-center">
          <Clock3 size={29} className="mx-auto mb-3" style={{color:"var(--ui-soft)"}}/>
          <strong className="text-sm">No sessions scheduled</strong>
          <p className="iv-subhead mt-2">Create or select an exam event to see upcoming sessions here.</p>
        </div>}
      </section>
    </div>
    <section className="iv-panel">
      <div className="iv-panel-title"><h3>Quick actions</h3><span className="iv-subhead">Everything in one place</span></div>
      <div className="flex gap-2 flex-wrap">
        {[["/events","Exam events",CalendarDays],["/allocate","Allocate duties",WandSparkles],["/seating","Plan seating",Grid2X2],["/retrieve","Import documents",FileSearch]]
          .map(([href,label,Icon])=><button type="button" key={href} className="iv-action" onClick={()=>navigate(href)}><Icon size={16}/>{label}<ArrowUpRight size={14}/></button>)}
      </div>
    </section>
  </div>;
}