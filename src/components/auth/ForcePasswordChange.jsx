// src/components/auth/ForcePasswordChange.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ForcePasswordChange() {
  const { changePassword, user } = useAuth();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 'strong' : pw.length >= 6 ? 'medium' : 'weak';
  const strengthColor = { strong: '#3fb950', medium: '#f0a500', weak: '#f85149' }[strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return setError('Password must be at least 6 characters');
    if (pw !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await changePassword(pw);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#161b22] border border-[#30363d] p-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0a500]" style={{position:'relative'}} />
          <div className="text-center mb-6">
            <div className="text-xl font-semibold">Set Your Password</div>
            <div className="font-mono text-xs text-[#7d8590] mt-1">Welcome, {user?.name}. Please set a personal password to continue.</div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">New Password</label>
              <input type="password" value={pw} onChange={e => { setPw(e.target.value); setError(''); }}
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#f0a500]" placeholder="••••••••" />
              {pw.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#30363d] overflow-hidden">
                    <div className="h-full transition-all duration-300" style={{ width: strength === 'strong' ? '100%' : strength === 'medium' ? '60%' : '25%', background: strengthColor }} />
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: strengthColor }}>{strength}</span>
                </div>
              )}
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }}
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2.5 font-mono text-sm outline-none focus:border-[#f0a500]" placeholder="••••••••" />
            </div>
            {error && <div className="font-mono text-xs text-[#f85149] bg-[#f85149]/10 px-3 py-2 border border-[#f85149]/30">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center mt-2">
              {loading ? '⟳ Saving...' : '→ Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
