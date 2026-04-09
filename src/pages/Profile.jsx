// src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/common/Toast';
import { User, Key, Building2, Search, CheckCircle2, AlertTriangle, Fingerprint, Bot, Radio } from 'lucide-react';
import { identifyProvider } from '../lib/llm';

export default function Profile() {
  const { user } = useAuth();
  const { state } = useApp();
  const toast = useToast();
  
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [search, setSearch] = useState('');
  
  const [apiKey, setApiKey] = useState(localStorage.getItem('proctorflow_llm_key') || '');
  const [modelName, setModelName] = useState(localStorage.getItem('proctorflow_llm_model') || '');
  const [provider, setProvider] = useState(null);
  const [models, setModels] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const students = state.students || [];
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.usn.toLowerCase().includes(search.toLowerCase()) ||
    s.branch.toLowerCase().includes(search.toLowerCase())
  );

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    // In a real app with Firebase Auth: updateProfile(auth.currentUser, { displayName: profileForm.name })
    toast('Profile updated (simulated)', 'success');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirm) {
      toast('Passwords do not match', 'warn');
      return;
    }
    if (pwdForm.newPwd.length < 8) {
      toast('Password must be at least 8 characters', 'warn');
      return;
    }
    // In a real app with Firebase Auth: updatePassword(auth.currentUser, pwdForm.newPwd)
    toast('Password changed successfully (simulated)', 'success');
    setPwdForm({ current: '', newPwd: '', confirm: '' });
  };

  const handleFetchModels = async () => {
    if (!apiKey.trim()) return;
    setIsFetching(true);
    try {
      const p = identifyProvider(apiKey.trim());
      if (!p) throw new Error("Unknown provider API key format.");
      setProvider(p);
      
      const availableModels = await p.fetchModels(apiKey.trim());
      setModels(availableModels);
      if (availableModels.length > 0 && !availableModels.includes(modelName)) {
        setModelName(availableModels[0]);
      }
      toast(`Successfully linked to ${p.name}!`, 'success');
    } catch (err) {
      toast(err.message, 'warn');
      setProvider(null);
      setModels([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAISave = (e) => {
    e.preventDefault();
    if (!provider || !modelName) {
      toast('Please enter an API key and fetch models first.', 'warn');
      return;
    }
    localStorage.setItem('proctorflow_llm_key', apiKey);
    localStorage.setItem('proctorflow_llm_provider', provider.id);
    localStorage.setItem('proctorflow_llm_model', modelName);
    toast('Universal AI Agent settings updated', 'success');
  };

  return (
    <div className="pb-10 animate-fadein max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-[22px] font-semibold tracking-tight">Admin Profile</div>
        <div className="text-xs text-[#7d8590] mt-1 font-mono">Manage your account and view department rosters</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Account Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
            <div className="p-5 border-b border-[#30363d] bg-[#1c2128] flex items-center gap-3">
              <Fingerprint size={18} className="text-[#f0a500]" />
              <div className="font-semibold text-sm">Identity Management</div>
            </div>
            <form onSubmit={handleProfileSave} className="p-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Display Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-[#0d1117] border border-[#30363d] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#f0a500] transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Email (Read Only)</label>
                <input value={user?.email || ''} readOnly disabled
                  className="bg-[#0d1117] border border-[#30363d] px-3 py-2 text-sm text-[#7d8590] opacity-70 cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Department ID</label>
                <input value={user?.deptId || 'global_admin'} readOnly disabled
                  className="bg-[#0d1117] border border-[#30363d] px-3 py-2 text-sm text-[#7d8590] opacity-70 cursor-not-allowed" />
              </div>
              <button type="submit" disabled={!profileForm.name.trim() || profileForm.name === user?.name} 
                className="btn btn-primary w-full justify-center">Save Profile Details</button>
            </form>
          </div>

          {/* Security Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
            <div className="p-5 border-b border-[#30363d] bg-[#1c2128] flex items-center gap-3">
              <Key size={18} className="text-[#f85149]" />
              <div className="font-semibold text-sm">Access Security</div>
            </div>
            <form onSubmit={handlePasswordSave} className="p-5 space-y-4 bg-[#0d1117]">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#7d8590] tracking-wide">Current Password</label>
                <input type="password" value={pwdForm.current} onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))}
                  className="bg-[#161b22] border border-[#30363d] px-3 py-2 text-sm outline-none focus:border-[#f85149] transition-colors" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#7d8590] tracking-wide">New Password</label>
                <input type="password" value={pwdForm.newPwd} onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))} minLength={8}
                  className="bg-[#161b22] border border-[#30363d] px-3 py-2 text-sm outline-none focus:border-[#f85149] transition-colors" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#7d8590] tracking-wide">Confirm New</label>
                <input type="password" value={pwdForm.confirm} onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} minLength={8}
                  className="bg-[#161b22] border border-[#30363d] px-3 py-2 text-sm outline-none focus:border-[#f85149] transition-colors border-l-2 border-l-[#f85149]" required />
              </div>
              <button type="submit" disabled={!pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm} 
                className="btn border border-[#30363d] hover:border-[#f85149] hover:text-[#f85149] w-full justify-center text-xs py-2 mt-2 transition-colors">
                Update Password
              </button>
            </form>
          </div>

          {/* AI Settings Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
            <div className="p-5 border-b border-[#30363d] bg-[#1c2128] flex items-center gap-3">
              <Bot size={18} className="text-[#3fb950]" />
              <div className="font-semibold text-sm">Personal AI Agent</div>
            </div>
            <form onSubmit={handleAISave} className="p-5 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Universal API Key</label>
                <div className="flex gap-2">
                  <input type="password" value={apiKey} 
                    onChange={e => { setApiKey(e.target.value); setProvider(null); setModels([]); }} 
                    placeholder="sk-... or AIza..."
                    className="flex-1 bg-[#0d1117] border border-[#30363d] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#3fb950] transition-colors" />
                  <button type="button" onClick={handleFetchModels} disabled={isFetching || !apiKey.trim()} 
                    className="bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/30 px-3 py-2 hover:bg-[#3fb950]/20 transition-colors disabled:opacity-50">
                    <Radio size={16} className={isFetching ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </div>

              {provider && models.length > 0 && (
                <div className="space-y-4 animate-fadein">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-[#3fb950]/15 text-[#3fb950] px-2 py-0.5 rounded border border-[#3fb950]/30">{provider.name} Detected</span>
                    <span className="text-xs font-mono text-[#7d8590]">{models.length} models available</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Model Context</label>
                    <select value={modelName} onChange={e => setModelName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#3fb950] transition-colors">
                      {models.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <button type="submit" disabled={!provider || !modelName} className="btn bg-[#3fb950]/10 border border-[#3fb950]/30 hover:bg-[#3fb950]/20 text-[#3fb950] w-full justify-center transition-colors disabled:opacity-50">
                Save Agent Configuration
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Student Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-md h-full flex flex-col">
            <div className="p-5 border-b border-[#30363d] bg-[#1c2128] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-[#58a6ff]" />
                <div className="font-semibold text-sm">Department Student Roster</div>
                <span className="bg-[#30363d] text-[#e6edf3] font-mono text-[10px] px-2 py-0.5 rounded-sm">{students.length} Total</span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7d8590]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search USN, Name..."
                  className="bg-[#0d1117] border border-[#30363d] pl-8 pr-3 py-1.5 text-xs font-mono outline-none focus:border-[#58a6ff] transition-colors w-48" />
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#0d1117]">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#30363d] sticky top-0 bg-[#0d1117] z-10">
                    <th className="px-5 py-3 font-mono text-[9px] uppercase tracking-[1.5px] text-[#7d8590]">USN Ident</th>
                    <th className="px-5 py-3 font-mono text-[9px] uppercase tracking-[1.5px] text-[#7d8590]">Legal Name</th>
                    <th className="px-5 py-3 font-mono text-[9px] uppercase tracking-[1.5px] text-[#7d8590]">Program</th>
                    <th className="px-5 py-3 font-mono text-[9px] uppercase tracking-[1.5px] text-[#7d8590]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {filteredStudents.length > 0 ? filteredStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-[#161b22] transition-colors group">
                      <td className="px-5 py-3 font-mono text-xs text-[#58a6ff] font-medium">{s.usn}</td>
                      <td className="px-5 py-3 text-sm text-[#e6edf3]">{s.name}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-[10px] bg-[#1c2128] border border-[#30363d] px-2 py-0.5 rounded-sm">
                          {s.branch} (Sem {s.semester || 'N/A'})
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#3fb950]">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center text-[#7d8590]">
                        <AlertTriangle size={24} className="mx-auto mb-2 opacity-50" />
                        <div className="font-mono text-xs">No students found matching your criteria.</div>
                        <div className="font-mono text-[10px] mt-1">Check Extract / Retrieve Info wizard to populate data.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
