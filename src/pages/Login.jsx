import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, ShieldCheck, Mail, KeyRound, UserPlus } from "lucide-react";
import { ThemeSwitcher } from "../theme";

export default function Login() {
  const { user, authUser, pendingAccount, loading, authError, configured, login, signUp, requestAccess, logout, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { if (user) navigate(user.role === "student" ? "/student" : user.role === "faculty" ? "/faculty-portal" : "/", {replace:true}); }, [user, navigate]);
  const act = async task => {
    setBusy(true);setError("");setNotice("");
    try {
      if (task === "login") { await login(email,password);setNotice("Signed in. Checking your institution access."); }
      else if (task === "signup") { await signUp(email,password,name);setNotice("Check your inbox for a verification link. After verification, sign in and request access."); }
      else if (task === "request") { await requestAccess(role);setNotice("Access request submitted. An institution administrator must approve it."); }
      else if (task === "reset") { await resetPassword(email);setNotice("If your account exists, a password reset email has been requested."); }
      else if (task === "logout") { await logout();setNotice("Signed out."); }
    } catch(e) { setError(e.message || "Operation failed."); }
    finally { setBusy(false); }
  };
  return <div className="invigra-login">
    <section className="iv-login-hero">
      <div className="iv-login-logo"><GraduationCap size={26}/> invigra.</div>
      <div><div className="text-xs font-bold tracking-[3px] uppercase mb-5 opacity-75">THE MODERN EXAM WORKSPACE</div><h1>Every exam.<br/>Perfectly in place.</h1>
        <p>Secure exam duty scheduling, faculty coordination, room management, and student seating in one institutional workspace.</p></div>
      <small>Built for Dayananda Sagar College of Engineering · ISE</small>
    </section>
    <section className="iv-login-content">
      <div className="iv-login-themes"><ThemeSwitcher compact/></div>
      <div className="iv-login-box">
        <div className="iv-eyebrow mb-3">INVIGRA / SECURE ACCESS</div>
        <h2 className="text-[32px] font-extrabold tracking-[-1px] leading-tight">{authUser && pendingAccount ? "Access approval required" : mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p className="iv-subhead mt-3 mb-8">{authUser && pendingAccount ? "Your identity is signed in, but an administrator must approve access to DSCE records." : "Use your verified account. Your role is assigned by the institution, not selected at sign-in."}</p>
        {!configured && <div role="alert" className="iv-panel mb-5" style={{borderColor:"var(--ui-red)",color:"var(--ui-red)"}}>Firebase is not configured for this deployment. An administrator must set the Firebase web application configuration before login is available.</div>}
        {loading && <p className="iv-subhead mb-5">Checking account session…</p>}
        {authUser && pendingAccount ? <div className="space-y-4">
          <div className="iv-panel"><p className="text-sm font-bold">{authUser.email}</p><p className="iv-subhead mt-2">Email status: {authUser.emailVerified ? "verified" : "verification required"}</p></div>
          <label className="text-sm font-bold block">Request access as</label>
          <select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-3 rounded-lg border" style={{background:"var(--ui-surface)",color:"var(--ui-ink)",borderColor:"var(--ui-line)"}}>
            <option value="student">Student</option><option value="faculty">Faculty</option>
          </select>
          <button className="iv-action primary w-full" onClick={()=>act("request")} disabled={busy||!configured}>Submit access request <ArrowRight size={16}/></button>
          <button className="iv-action w-full" onClick={()=>act("logout")} disabled={busy}>Sign out</button>
        </div> : <form className="space-y-4" onSubmit={e=>{e.preventDefault();act(mode);}}>
          {mode==="signup" && <div><label className="text-xs font-bold block mb-2">Full name</label><input autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} className="iv-role w-full !block" placeholder="Your full name"/></div>}
          <div><label className="text-xs font-bold block mb-2">Email address</label><div className="relative"><Mail size={16} className="absolute left-4 top-4" style={{color:"var(--ui-muted)"}}/><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className="iv-role w-full !block !pl-11" placeholder="you@college.edu"/></div></div>
          <div><label className="text-xs font-bold block mb-2">Password</label><div className="relative"><KeyRound size={16} className="absolute left-4 top-4" style={{color:"var(--ui-muted)"}}/><input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={mode==="signup"?10:1} required value={password} onChange={e=>setPassword(e.target.value)} className="iv-role w-full !block !pl-11" placeholder="Your password"/></div></div>
          <button type="submit" disabled={busy||!configured||loading} className="iv-action primary w-full !py-[15px] disabled:opacity-40">{busy?"Working…":mode==="signup"?"Create account":"Sign in securely"} <ArrowRight size={16}/></button>
        </form>}
        {(error||authError) && <p className="text-sm mt-4" role="alert" style={{color:"var(--ui-red)"}}>{error||authError}</p>}
        {notice && <p role="status" className="text-sm mt-4" style={{color:"var(--ui-green)"}}>{notice}</p>}
        {!authUser && <div className="flex justify-between gap-3 mt-6 text-xs">
          <button type="button" style={{color:"var(--ui-accent)"}} onClick={()=>{setMode(mode==="signup"?"login":"signup");setError("");setNotice("");}}>{mode==="signup"?"Already have an account? Sign in":"New member? Create account"}</button>
          <button type="button" style={{color:"var(--ui-muted)"}} onClick={()=>act("reset")} disabled={busy||!email||!configured}>Reset password</button>
        </div>}
        <p className="text-center mt-8 text-[11px]" style={{color:"var(--ui-soft)"}}><ShieldCheck size={12} className="inline mr-1"/> Access requires an approved institutional profile</p>
      </div>
    </section>
  </div>;

}
