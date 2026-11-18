import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Users, BookOpen, UserRound, GraduationCap, CircleCheck } from "lucide-react";
import { ThemeSwitcher } from "../theme";
const ROLES = [
  { value:"admin",label:"Administrator",description:"Plan events and manage allocations",icon:ShieldCheck },
  { value:"faculty",label:"Faculty",description:"Review duties and examination schedules",icon:BookOpen },
  { value:"student",label:"Student",description:"Find your seat and exam timetable",icon:Users },
  { value:"other",label:"Other",description:"Continue with limited role access",icon:UserRound },
];
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role,setRole] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const handleContinue = async () => {
    if (!role || loading) return;
    setLoading(true);setError("");
    try { await login(role); navigate("/"); }
    catch(err){ setError(err?.message || "Unable to sign in."); }
    finally{ setLoading(false); }
  };
  return <div className="invigra-login">
    <section className="iv-login-hero">
      <div className="iv-login-logo"><GraduationCap size={26}/> invigra.</div>
      <div>
        <div className="text-xs font-bold tracking-[3px] uppercase mb-5 opacity-75">THE MODERN EXAM WORKSPACE</div>
        <h1>Every exam.<br/>Perfectly in place.</h1>
        <p>One beautiful workspace to plan fair faculty duties, organize seating, and make examination days run smoothly.</p>
      </div>
      <small>Designed for academic teams, built for clarity.</small>
    </section>
    <section className="iv-login-content">
      <div className="iv-login-themes"><ThemeSwitcher compact/></div>
      <div className="iv-login-box">
        <div className="iv-eyebrow mb-3">WELCOME TO INVIGRA</div>
        <h2 className="text-[32px] font-extrabold tracking-[-1px] leading-tight">Your workspace awaits.</h2>
        <p className="iv-subhead mt-3 mb-8">Choose your role to enter the examination operations portal.</p>
        <div className="grid grid-cols-1 gap-3 mb-6">
          {ROLES.map(r=>{
            const Icon=r.icon, selected=role===r.value;
            return <button type="button" onClick={()=>setRole(r.value)} key={r.value}
              aria-pressed={selected} className={"iv-role"+(selected?" selected":"")}>
              <span className="role-icon"><Icon size={20}/></span>
              <span className="flex-1"><strong>{r.label}</strong><small>{r.description}</small></span>
              {selected && <CircleCheck className="role-check" size={20}/>}
            </button>;
          })}
        </div>
        {error && <p role="alert" className="text-xs mb-4" style={{color:"var(--ui-red)"}}>{error}</p>}
        <button type="button" onClick={handleContinue} disabled={!role||loading}
          className="iv-action primary w-full !py-[15px] disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Signing in..." : "Enter workspace"} <ArrowRight size={17}/>
        </button>
        <p className="text-center mt-6 text-[11px]" style={{color:"var(--ui-soft)"}}>Invigra · Academic operations platform</p>
      </div>
    </section>
  </div>;
}