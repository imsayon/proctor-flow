import { useState } from 'react';
import { initialLogs } from '../../lib/dummyData';
import { emulateGreedyAllocation } from '../../utils/algorithm';

const steps = [
  { id: 'step1', num: '01', name: 'Constraint Classification', status: 'Hard + Soft constraints', at: 10, msg: 'Classifying constraints...' },
  { id: 'step2', num: '02', name: 'Priority Queue Init', status: 'Sort by load factor', at: 35, msg: 'Building priority queue...' },
  { id: 'step3', num: '03', name: 'Greedy Allocation', status: 'Backtrack on conflict', at: 65, msg: 'Running greedy allocation...' },
  { id: 'step4', num: '04', name: 'Student Shuffling', status: 'Fisher-Yates + gap constraint', at: 88, msg: 'Shuffling students...' },
];

const allocResults = [
  { id: 1, date: '17 Nov', session: 'FN 9:30', room: 'A101', f1: 'Prof. Ramesh Kumar', f2: 'Prof. Suresh Nair', students: 40 },
  { id: 2, date: '17 Nov', session: 'AN 1:30', room: 'A102', f1: 'Prof. Anita Sharma', f2: 'Prof. Priya Dev', students: 38 },
  { id: 3, date: '18 Nov', session: 'FN 9:30', room: 'B201', f1: 'Prof. Kiran Bhat', f2: 'Prof. Yogesh BS', students: 42 },
  { id: 4, date: '18 Nov', session: 'AN 1:30', room: 'B202', f1: 'Prof. Ravi S', f2: 'Prof. Deepa J', students: 36 },
  { id: 5, date: '19 Nov', session: 'FN 9:30', room: 'A101', f1: 'Prof. Arjun T', f2: 'Prof. Sindhu K', students: 40 },
  { id: 6, date: '19 Nov', session: 'AN 1:30', room: 'A102', f1: 'Prof. Mahesh V', f2: 'Prof. Usha P', students: 38 },
  { id: 7, date: '20 Nov', session: 'FN 9:30', room: 'B201', f1: 'Prof. Harish N', f2: 'Prof. Latha S', students: 42 },
  { id: 8, date: '20 Nov', session: 'AN 1:30', room: 'B202', f1: 'Prof. Ramesh Kumar', f2: 'Prof. Anita Sharma', students: 36 },
];

export default function Allocate() {
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [progressLabel, setProgressLabel] = useState('Initializing...');

  const runAllocation = async () => {
    if (isDone || isRunning) return;
    setIsRunning(true);
    setProgressPct(0);
    setCurrentLogs([]);
    setProgressLabel('Initializing...');
    
    let lastLogIdx = 0;
    
    await emulateGreedyAllocation((pct) => {
      setProgressPct(pct);
      const activeStep = steps.find(s => pct >= s.at - 10 && pct < s.at + 15);
      if (activeStep) setProgressLabel(activeStep.msg);

      if (lastLogIdx < initialLogs.length && pct >= (lastLogIdx / initialLogs.length) * 95) {
        setCurrentLogs(prev => [...prev, initialLogs[lastLogIdx]]);
        lastLogIdx++;
      }
    });

    setIsRunning(false);
    setIsDone(true);
    setProgressLabel('✓ Allocation complete — 8 sessions assigned, 0 conflicts');
    setCurrentLogs(initialLogs);
  };

  const resetAllocation = () => {
    setIsDone(false);
    setIsRunning(false);
    setProgressPct(0);
    setCurrentLogs([]);
    setProgressLabel('Initializing...');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Run Allocation Engine</div>
          <div className="text-xs text-muted mt-1 font-mono">Dynamic Priority-Based Resource Allocation Algorithm</div>
        </div>
      </div>

      <div className="bg-surface border border-border p-6 mb-6">
        <div className="text-[15px] font-semibold mb-1.5">Algorithm Pipeline</div>
        <div className="text-xs text-muted font-mono mb-5">Greedy allocation + backtracking with hard/soft constraint validation</div>
        
        <div className="flex gap-0 mb-6">
          {steps.map((s) => {
            const isFinished = progressPct > s.at + 10;
            const isActive = progressPct >= s.at - 10 && !isFinished;
            return (
              <div key={s.id} className={`flex-1 p-[14px_16px] border border-border -mr-[1px] bg-surface2 transition-colors ${
                isFinished ? 'border-green bg-green/5 relative z-10' : isActive ? 'border-accent bg-accent/5 relative z-10' : ''
              }`}>
                <div className="font-mono text-[10px] text-muted mb-1">{s.num}</div>
                <div className="text-xs font-semibold">{s.name}</div>
                <div className={`text-[10px] mt-1 font-mono transition-colors ${
                    isFinished ? 'text-green' : isActive ? 'text-accent' : 'text-muted'
                }`}>
                  {s.status}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <Field label="Exam Event">
            <select className="bg-surface2 border border-border text-text px-3 py-2 font-mono text-xs outline-none focus:border-accent">
                <option>CIE-II · Nov 17-22</option>
                <option>SEE · Dec 2025</option>
            </select>
          </Field>
          <Field label="Algorithm Mode">
            <select className="bg-surface2 border border-border text-text px-3 py-2 font-mono text-xs outline-none focus:border-accent">
                <option>Greedy + Backtrack</option>
                <option>MILP Optimization</option>
            </select>
          </Field>
          <Field label="Max Duties/Faculty">
            <input type="number" defaultValue={3} min={1} max={8} className="bg-surface2 border border-border text-text px-3 py-2 font-mono text-xs outline-none focus:border-accent" />
          </Field>
        </div>

        <button className="btn btn-primary" onClick={runAllocation} disabled={isRunning || isDone}>▶ Run Allocation</button>
        <button className="btn btn-outline ml-2.5" onClick={resetAllocation}>↺ Reset</button>

        {(isRunning || isDone) && (
          <div className="mt-5">
            <div className={`font-mono text-[11px] mb-2 ${isDone ? 'text-green' : 'text-muted'}`}>{progressLabel}</div>
            <div className="bg-surface2 h-2 border border-border overflow-hidden mb-3 relative">
              <div className="h-full bg-accent transition-all duration-200" style={{ width: `${progressPct}%` }}>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_1s_infinite]" />
              </div>
            </div>
            <div className="bg-black border border-border p-3 h-[120px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col justify-end">
              {currentLogs.map(([type, msg], i) => (
                <div key={i} className={`
                  ${type === 'info' ? 'text-[#58a6ff]' : ''}
                  ${type === 'warn' ? 'text-accent' : ''}
                  ${type === 'ok' ? 'text-green' : ''}
                `}>{msg}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDone && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-[14px]">
            <div className="font-mono text-[11px] uppercase tracking-[2px] text-muted">Allocation Results — CIE II</div>
            <div className="flex gap-2.5">
                <button className="btn btn-outline pb-1.5 pt-1.5">↓ PDF</button>
            </div>
          </div>
          <div className="bg-surface border border-border overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-surface2 border-b border-border">
                        <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Date</th>
                        <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Session</th>
                        <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Room</th>
                        <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Faculty 1</th>
                        <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Faculty 2</th>
                        <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Students</th>
                        <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-muted font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {allocResults.map(r => (
                        <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface2">
                            <td className="px-4 py-[11px] font-mono text-xs">{r.date}</td>
                            <td className="px-4 py-[11px] font-mono text-xs">{r.session}</td>
                            <td className="px-4 py-[11px] font-mono text-xs">{r.room}</td>
                            <td className="px-4 py-[11px] text-xs">{r.f1}</td>
                            <td className="px-4 py-[11px] text-xs">{r.f2}</td>
                            <td className="px-4 py-[11px] font-mono text-xs">{r.students}</td>
                            <td className="px-4 py-[11px]"><span className="pill pill-green">✓ Valid</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[1px] text-muted">{label}</label>
      {children}
    </div>
  );
}
