// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DEMO_CREDS = [
  { label: 'Admin / HOD', email: 'admin@proctorflow.edu', password: 'admin123', color: '#f0a500' },
  { label: 'Student', email: 'student@proctorflow.edu', password: 'student123', color: '#3fb950' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const u = await login(email, password);
      const role = u?.role || 'student';
      navigate(role === 'student' ? '/student' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold tracking-tight"><span className="text-[#f0a500]">Proctor</span>Flow</div>
          <div className="font-mono text-xs text-[#7d8590] mt-1">Exam Duty & Seating Allocation System v3</div>
          <div className="font-mono text-[9px] text-[#484f58] mt-0.5">ISE Department · DSCE · Multi-Tenant Architecture</div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0a500]" style={{position:'relative'}} />

          {/* Demo cards */}
          <div className="mb-5">
            <div className="font-mono text-[10px] text-[#7d8590] uppercase tracking-[1.5px] mb-2">Quick Login</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDS.map(cred => (
                <button key={cred.email} onClick={() => quickFill(cred)}
                  className="text-left p-3 border border-[#30363d] bg-[#1c2128] hover:border-[#7d8590] transition-colors"
                  style={{ borderLeftColor: cred.color, borderLeftWidth: '3px' }}>
                  <div className="text-xs font-semibold">{cred.label}</div>
                  <div className="font-mono text-[9px] text-[#7d8590] mt-0.5">{cred.email}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#f0a500]" placeholder="email@proctorflow.edu" required />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#f0a500]" placeholder="••••••••" required />
            </div>
            {error && <div className="font-mono text-xs text-[#f85149] bg-[#f85149]/10 px-3 py-2 border border-[#f85149]/30">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center mt-1">
              {loading ? '⟳ Signing in...' : '→ Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
