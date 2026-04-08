import { useState } from 'react';
import { facultyData } from '../../lib/dummyData';

export default function Faculty() {
  const [search, setSearch] = useState('');
  
  const filtered = facultyData.filter((f) => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Faculty Registry</div>
          <div className="text-xs text-muted mt-1 font-mono">
            ISE Department · {facultyData.length} registered faculty
          </div>
        </div>
        <div className="flex gap-2.5">
          <input 
            type="text" 
            placeholder="Search faculty..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface2 border border-border text-text px-3.5 py-2 font-mono text-xs outline-none w-[240px] focus:border-accent transition-colors"
          />
          <button className="btn btn-outline">+ Add</button>
        </div>
      </div>

      <div className="bg-surface border border-border overflow-hidden mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface2 border-b border-border">
              <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">#</th>
              <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Name</th>
              <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Designation</th>
              <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">CIE-I Duties</th>
              <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Availability</th>
              <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => {
              const pc = f.duties >= 3 ? 'pill-red' : f.duties >= 2 ? 'pill-yellow' : 'pill-green';
              return (
                <tr key={f.id} className="hover:bg-surface2 transition-colors border-b border-border last:border-0">
                  <td className="px-4 py-[11px] font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-[11px] text-[13px] font-bold">{f.name}</td>
                  <td className="px-4 py-[11px] text-xs text-muted">{f.desg}</td>
                  <td className="px-4 py-[11px]">
                    <span className={`pill ${pc}`}>{f.duties} duties</span>
                  </td>
                  <td className="px-4 py-[11px]">
                    {f.available ? (
                      <span className="pill pill-green">✓ Available</span>
                    ) : (
                      <span className="pill pill-red">✗ On Leave</span>
                    )}
                  </td>
                  <td className="px-4 py-[11px]">
                    <span className={`pill ${f.available ? 'pill-blue' : 'pill-red'}`}>
                      {f.available ? 'Eligible' : 'Restricted'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-6 text-muted font-mono text-sm">No results found</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
