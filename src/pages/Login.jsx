// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

const DEMO_CREDS = [
  { label: 'Admin / HOD', email: 'admin@proctorflow.edu', password: 'admin123', color: 'var(--color-accent)' },
  { label: 'Student', email: 'student@proctorflow.edu', password: 'student123', color: 'var(--color-green)' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast('Welcome back, ' + user.name + '!');
      navigate(user.role === 'student' ? '/student' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillCreds = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(240,165,0,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(31,111,235,0.05) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#f0a500] flex items-center justify-center font-mono font-bold text-black text-base" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}>
              PF
            </div>
            <span className="font-mono font-semibold text-xl"><span className="text-[#f0a500]">Proctor</span>Flow</span>
          </div>
          <div className="font-mono text-[11px] text-[#7d8590] tracking-widest uppercase">Exam Duty & Allocation System</div>
          <div className="font-mono text-[10px] text-[#7d8590] mt-1">DSCE · ISE Department · AY 2025-26</div>
        </div>

        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d]">
          <div className="px-6 py-4 border-b border-[#30363d]">
            <div className="font-mono text-xs text-[#7d8590] uppercase tracking-widest">Sign In</div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@proctorflow.edu"
                className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] transition-colors"
                required
              />
            </div>
            {error && <div className="text-[#f85149] font-mono text-xs border border-[#f85149]/30 bg-[#f85149]/10 px-3 py-2">{error}</div>}
            <button type="submit" disabled={loading} className="w-full btn btn-primary justify-center py-2.5 mt-2">
              {loading ? '▸ Signing in...' : '▶ Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 bg-[#161b22] border border-[#30363d] p-4">
          <div className="font-mono text-[9px] uppercase tracking-[2px] text-[#7d8590] mb-3">Demo Accounts</div>
          <div className="space-y-2">
            {DEMO_CREDS.map(c => (
              <button key={c.email} onClick={() => fillCreds(c)}
                className="w-full flex items-center justify-between bg-[#1c2128] border border-[#30363d] hover:border-[#7d8590] px-3 py-2 transition-colors cursor-pointer">
                <div>
                  <div className="font-mono text-[11px] font-semibold" style={{ color: c.color }}>{c.label}</div>
                  <div className="font-mono text-[10px] text-[#7d8590]">{c.email}</div>
                </div>
                <div className="font-mono text-[10px] text-[#7d8590] border border-[#30363d] px-2 py-0.5">use →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
