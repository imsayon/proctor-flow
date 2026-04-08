import { leavesData } from '../../lib/dummyData';

export default function Leaves() {
  const pending = leavesData.filter(l => l.status === 'conflict');
  const approved = leavesData.filter(l => l.status === 'approved');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Leave Requests</div>
          <div className="text-xs text-muted mt-1 font-mono">
            CIE-II window: Nov 14–25, 2025 (±3 day restriction)
          </div>
        </div>
        <button className="btn btn-outline">↓ Export</button>
      </div>

      <div className="bg-red/10 border border-red/30 px-4 py-3 mb-5 font-mono text-xs text-red">
        ⚠ POLICY: No leave approved from Nov 14 to Nov 25 (3 days before + 3 days after exam window)
      </div>

      <div className="flex items-center justify-between mb-[14px]">
        <div className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
          Pending Requests ({pending.length})
        </div>
      </div>
      <div>
        {pending.map(l => (
          <div key={l.id} className="bg-surface border border-border p-4 mb-2.5 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[13px] font-semibold">{l.name}</div>
              <div className="font-mono text-[11px] text-muted mt-[3px]">
                {l.desg} · Reason: {l.reason}
              </div>
            </div>
            <div className="font-mono text-[11px] mx-6 text-muted">
              {l.from} → {l.to}
            </div>
            <div className="font-mono text-[10px] px-2.5 py-1 bg-red/15 text-red border border-red/30 tracking-wide uppercase">
              ✗ WINDOW CONFLICT
            </div>
            <button
              className="btn btn-danger ml-3 !text-[10px] !px-2.5 !py-1"
              onClick={() => alert(`Leave for ${l.name} rejected.`)}
            >
              Reject
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-[14px] mt-6">
        <div className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
          Cleared / Approved ({approved.length})
        </div>
      </div>
      <div>
        {approved.map(l => (
           <div key={l.id} className="bg-surface border border-border p-4 mb-2.5 flex items-center justify-between">
           <div className="flex-1">
             <div className="text-[13px] font-semibold">{l.name}</div>
             <div className="font-mono text-[11px] text-muted mt-[3px]">
               {l.desg} · Reason: {l.reason}
             </div>
           </div>
           <div className="font-mono text-[11px] mx-6 text-muted">
             {l.from} → {l.to}
           </div>
           <div className="font-mono text-[10px] px-2.5 py-1 bg-green/15 text-green border border-green/30 tracking-wide uppercase">
             ✓ APPROVED
           </div>
         </div>
        ))}
      </div>
    </div>
  );
}
