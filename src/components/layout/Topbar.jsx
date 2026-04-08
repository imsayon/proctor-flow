export default function Topbar() {
  return (
    <div className="bg-surface border-b border-border flex items-center justify-between px-7 h-14 sticky top-0 z-50">
      <div className="flex items-center gap-[10px] font-mono font-semibold text-[15px]">
        <div
          className="w-7 h-7 bg-accent flex items-center justify-center text-[13px] font-bold text-black"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}
        >
          PF
        </div>
        <span>
          <span className="text-accent">Proctor</span>Flow
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-muted font-mono">
          ISE Dept · DSCE · AY 2025-26
        </span>
        <span className="font-mono text-[10px] px-2 py-[3px] border border-accent text-accent tracking-[1px] uppercase">
          Admin
        </span>
      </div>
    </div>
  );
}
