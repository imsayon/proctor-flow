import { useState, useEffect } from 'react';
import { generateSeats } from '../../utils/algorithm';
import { roomConfigs, branchNames } from '../../lib/dummyData';

export default function Seating() {
  const [roomId, setRoomId] = useState('A101');
  const [seed, setSeed] = useState(42);
  const [seats, setSeats] = useState([]);

  const activeRoom = roomConfigs[roomId];

  useEffect(() => {
    setSeats(generateSeats(activeRoom.count, seed));
  }, [roomId, seed, activeRoom.count]);

  const handleReshuffle = () => {
    setSeed(Math.floor(Math.random() * 9999));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Seating Chart</div>
          <div className="text-xs text-muted mt-1 font-mono">Anti-cheating layout · Fisher-Yates + Branch-Gap constraint</div>
        </div>
        <div className="flex gap-2.5">
          <select 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
            className="bg-surface2 border border-border text-text px-[14px] py-2 font-mono text-xs outline-none focus:border-accent w-auto transition-colors"
          >
            {Object.values(roomConfigs).map(r => (
              <option key={r.id} value={r.id}>{r.name} · {r.count} seats</option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={handleReshuffle}>↺ Reshuffle</button>
          <button className="btn btn-outline" onClick={() => alert('Exported!')}>↓ Export</button>
        </div>
      </div>

      <div className="bg-surface border border-border p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="text-[15px] font-semibold">{activeRoom.name}</div>
            <div className="font-mono text-[11px] text-muted mt-[3px]">{activeRoom.meta}</div>
          </div>
          <span className="pill pill-green">✓ Conflict-free</span>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-5">
          {seats.map((s, i) => {
            let colors = '';
            if (s.branch === 'ise') colors = 'border-[#1f6feb]/50 bg-[#1f6feb]/10 [&_.br]:text-[#58a6ff]';
            if (s.branch === 'cse') colors = 'border-green/50 bg-green/10 [&_.br]:text-green';
            if (s.branch === 'ece') colors = 'border-accent/50 bg-accent/10 [&_.br]:text-accent';
            if (s.branch === 'mech') colors = 'border-red/50 bg-red/10 [&_.br]:text-red';

            return (
              <div key={i} className={`border p-[8px_6px] text-center cursor-default transition-all duration-150 hover:scale-[1.03] hover:!border-muted ${colors}`}>
                <div className="font-mono text-[9px] text-muted">{String(i + 1).padStart(2, '0')}</div>
                <div className="text-[10px] font-semibold mt-[2px] whitespace-nowrap overflow-hidden text-ellipsis">{s.name}</div>
                <div className="br font-mono text-[9px] mt-[1px] transition-colors">{branchNames[s.branch]}</div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 flex-wrap">
          <LegendItem color="rgba(31,111,235,0.6)" label="ISE" />
          <LegendItem color="rgba(63,185,80,0.6)" label="CSE" />
          <LegendItem color="rgba(240,165,0,0.6)" label="ECE" />
          <LegendItem color="rgba(248,81,73,0.6)" label="MECH" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-[6px] text-[11px] text-muted">
      <div className="w-[10px] h-[10px] rounded-[1px]" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
