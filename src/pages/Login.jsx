// src/pages/Login.jsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Building2, CheckCircle2, Shield } from 'lucide-react';
import { searchInstitutionsIN, emailDomain } from '../lib/institutions';
import { bootstrapAdmin } from '../lib/cloudFunctions';

export default function Login() {
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await searchInstitutionsIN(institutionQuery, { max: 20 });
        if (!cancelled) setInstitutions(results);
      } catch {
        if (!cancelled) setInstitutions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [institutionQuery]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const domainOk = useMemo(() => {
    if (!selectedInstitution) return true;
    const domain = emailDomain(email);
    const allowed = (selectedInstitution.domains || []).map(d => String(d).toLowerCase());
    if (!domain) return true;
    return allowed.includes(domain);
  }, [email, selectedInstitution]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!selectedInstitution) throw new Error('Please select your institution');
      if (!domainOk) throw new Error('Email domain does not match the selected institution');
      const u = await login(email, password, selectedInstitution.id);
      const role = u?.role || 'student'; // hydrated in auth listener, but keep fallback
      navigate(role === 'student' ? '/student' : role === 'faculty' ? '/faculty-portal' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapAdmin = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedInstitution) { setError('Please select your institution'); return; }
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password) {
      setError('Please fill all admin registration fields');
      return;
    }
    const allowed = (selectedInstitution.domains || []).map(d => String(d).toLowerCase());
    if (!allowed.includes(emailDomain(adminForm.email))) {
      setError('Admin email domain does not match the selected institution');
      return;
    }
    setIsBootstrapping(true);
    try {
      await bootstrapAdmin({
        institutionId: selectedInstitution.id,
        email: adminForm.email.trim(),
        password: adminForm.password,
        name: adminForm.name.trim(),
      });
      await login(adminForm.email.trim(), adminForm.password, selectedInstitution.id);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Admin registration failed');
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold tracking-tight"><span className="text-[#f0a500]">Proctor</span>Flow</div>
          <div className="font-mono text-xs text-[#7d8590] mt-1">Exam Duty & Seating Allocation System</div>
          <div className="font-mono text-[10px] text-[#484f58] mt-1 flex items-center justify-center gap-2">
            <Shield size={12} /> Institution-scoped access · Domain-gated login
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-md">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0a500]" style={{position:'relative'}} />

          <div className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Institution (India)</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]" />
                  <input value={institutionQuery} onChange={e => setInstitutionQuery(e.target.value)}
                    className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] pl-9 pr-3 py-2.5 font-mono text-sm outline-none focus:border-[#f0a500]"
                    placeholder="Search your institution (e.g. DSCE)" />
                </div>
              </div>
              <div className="mt-2 max-h-44 overflow-auto border border-[#30363d] bg-[#0d1117] rounded-md">
                {institutions.length === 0 ? (
                  <div className="px-3 py-3 font-mono text-xs text-[#7d8590]">No matches.</div>
                ) : institutions.map(inst => (
                  <button key={inst.id} type="button" onClick={() => setSelectedInstitution(inst)}
                    className={`w-full text-left px-3 py-2 border-b border-[#30363d] last:border-b-0 hover:bg-[#161b22] transition-colors ${
                      selectedInstitution?.id === inst.id ? 'bg-[#f0a500]/5' : ''
                    }`}>
                    <div className="text-xs font-semibold">{inst.name}</div>
                    <div className="font-mono text-[10px] text-[#7d8590] mt-0.5">
                      {(inst.domains || []).join(', ') || 'Domain not configured'}
                      {inst.hasAdmin ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-[#3fb950]"><CheckCircle2 size={12} /> Admin registered</span>
                      ) : (
                        <span className="ml-2 text-[#f0a500]">Admin not registered</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#f0a500]"
                  placeholder={selectedInstitution?.domains?.[0] ? `your.name@${selectedInstitution.domains[0]}` : 'your.name@institution.edu.in'}
                  required />
                {!domainOk && (
                  <div className="font-mono text-[10px] text-[#f85149] mt-1">Email domain must match selected institution.</div>
                )}
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#f0a500]"
                  placeholder="••••••••" required />
              </div>
              {error && <div className="font-mono text-xs text-[#f85149] bg-[#f85149]/10 px-3 py-2 border border-[#f85149]/30 rounded">{error}</div>}
              <button type="submit" disabled={loading || !selectedInstitution || !domainOk}
                className="btn border border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500]/10 w-full justify-center mt-1 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={14} /></>}
              </button>
            </form>

            {selectedInstitution && !selectedInstitution.hasAdmin && (
              <div className="mt-6 pt-5 border-t border-[#30363d]">
                <div className="font-mono text-[10px] text-[#7d8590] uppercase tracking-[1.5px] mb-2">Admin Registration</div>
                <div className="text-xs text-[#7d8590] mb-3">
                  No admin is registered for <span className="text-[#e6edf3]">{selectedInstitution.name}</span>. Register the first admin to onboard your institution.
                </div>
                <form onSubmit={handleBootstrapAdmin} className="grid grid-cols-1 gap-3">
                  <input value={adminForm.name} onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#58a6ff]"
                    placeholder="Admin full name" />
                  <input type="email" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#58a6ff]"
                    placeholder={`admin@${selectedInstitution.domains?.[0] || 'institution.edu.in'}`} />
                  <input type="password" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#58a6ff]"
                    placeholder="Set admin password (min 8 chars)" />
                  <button type="submit" disabled={isBootstrapping}
                    className="btn border border-[#58a6ff] text-[#58a6ff] hover:bg-[#58a6ff]/10 w-full justify-center flex items-center gap-2 transition-colors disabled:opacity-50">
                    {isBootstrapping ? <><Loader2 size={14} className="animate-spin" /> Creating admin...</> : <>Create Admin <ArrowRight size={14} /></>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
