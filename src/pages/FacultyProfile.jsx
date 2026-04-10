// src/pages/FacultyProfile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { User, Briefcase } from 'lucide-react';

export default function FacultyProfile() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [form, setForm] = useState({ 
    name: user?.name || '',
    designation: 'Assistant Professor'
  });

  useEffect(() => {
    const savedName = localStorage.getItem('faculty_name');
    const savedDesignation = localStorage.getItem('faculty_designation');
    if (savedName || savedDesignation) {
      setForm({
        name: savedName || user?.name || '',
        designation: savedDesignation || 'Assistant Professor'
      });
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast('Please enter your name', 'warn');
      return;
    }
    localStorage.setItem('faculty_name', form.name);
    localStorage.setItem('faculty_designation', form.designation);
    toast('✓ Profile updated successfully', 'success');
  };

  return (
    <div className="pb-10 max-w-2xl">
      <div className="mb-8">
        <div className="text-[22px] font-semibold tracking-tight">Faculty Profile</div>
        <div className="text-xs text-[#7d8590] mt-1 font-mono">Manage your professional information</div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
        <div className="p-5 border-b border-[#30363d] bg-[#1c2128] flex items-center gap-3">
          <User size={18} className="text-[#f0a500]" />
          <div className="font-semibold text-sm">Profile Information</div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Full Name</label>
            <input 
              type="text"
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-[#0d1117] border border-[#30363d] px-3 py-2.5 text-sm text-[#e6edf3] outline-none focus:border-[#f0a500] transition-colors rounded" 
              placeholder="Enter your full name"
              required
            />
            <div className="text-[10px] text-[#7d8590] font-mono">Current: {user?.name || 'Not set'}</div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Designation</label>
            <select 
              value={form.designation}
              onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
              className="bg-[#0d1117] border border-[#30363d] px-3 py-2.5 text-sm text-[#e6edf3] outline-none focus:border-[#f0a500] transition-colors rounded"
            >
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Professor">Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Guest Faculty">Guest Faculty</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Email (Read Only)</label>
            <input 
              type="email"
              value={user?.email || 'faculty@example.com'} 
              readOnly 
              disabled
              className="bg-[#0d1117] border border-[#30363d] px-3 py-2.5 text-sm text-[#7d8590] opacity-70 cursor-not-allowed rounded" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#7d8590] uppercase tracking-wider">Employee ID</label>
            <input 
              type="text"
              value={user?.employeeId || 'EMP_FACULTY'} 
              readOnly 
              disabled
              className="bg-[#0d1117] border border-[#30363d] px-3 py-2.5 text-sm text-[#7d8590] opacity-70 cursor-not-allowed rounded" 
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[#30363d]">
            <button 
              type="submit" 
              className="border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500]/10 px-6 py-2.5 rounded font-semibold text-sm transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-md p-5">
        <div className="flex items-start gap-3">
          <Briefcase size={16} className="text-[#58a6ff] mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-[#e6edf3]">Professional Summary</div>
            <div className="text-xs text-[#7d8590] mt-2 font-mono">
              Current Designation: <span className="text-[#e6edf3]">{form.designation}</span><br/>
              Status: <span className="text-[#3fb950]">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
