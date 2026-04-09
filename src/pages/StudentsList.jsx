// src/pages/StudentsList.jsx
import { useApp } from '../context/AppContext';
import { Users, GraduationCap, Mail, FileDigit } from 'lucide-react';

export default function StudentsList() {
  const { state } = useApp();
  
  // Sort students by USN alphabetically
  const sortedStudents = [...(state.students || [])].sort((a, b) => {
    return (a.usn || '').localeCompare(b.usn || '');
  });

  return (
    <div className="pb-10 animate-fadein">
      <div className="bg-[#161b22] border border-[#30363d] p-6 mb-6 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#58a6ff]" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-[#30363d] flex items-center justify-center bg-[#0d1117] text-[#58a6ff]">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Department Student Roster</h1>
            <p className="font-mono text-xs text-[#7d8590] mt-1">Found {sortedStudents.length} registered students in the active academic session.</p>
          </div>
        </div>
      </div>

      {sortedStudents.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] p-10 text-center text-[#7d8590] font-mono text-sm">
          No students have been ingested yet. Navigate to 'Retrieve Info' to extract a student spreadsheet!
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1c2128] border-b border-[#30363d]">
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium w-12">#</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">USN</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Name</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Branch</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Sem</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s, idx) => (
                <tr key={s.usn || idx} className="border-b border-[#30363d] hover:bg-[#1c2128] transition-colors last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-[#7d8590]">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#e6edf3]">
                    <div className="flex items-center gap-1.5">
                      <FileDigit size={12} className="text-[#58a6ff]" />
                      {s.usn || s.rollNo || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="pill pill-blue">{s.branch || '—'}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#f0a500]">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={12} />
                      {s.semester || 4}th
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#7d8590]">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} />
                      {s.email || `${s.name.split(' ')[0].toLowerCase()}@proctorflow.edu`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
