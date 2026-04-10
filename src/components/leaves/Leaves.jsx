// src/components/leaves/Leaves.jsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';

const EMPTY_FORM = { facultyId: '', from: '', to: '', reason: '' };

function isConflict(leave, sessions) {
  const d1 = new Date(leave.from), d2 = new Date(leave.to);
  const buffer = 3 * 24 * 60 * 60 * 1000;
  return sessions.some(s => {
    const sd = new Date(s.date);
    return sd >= new Date(d1.getTime() - buffer) && sd <= new Date(d2.getTime() + buffer);
  });
}

export default function Leaves() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pending = state.leaves.filter(l => l.status === 'pending');
  const others = state.leaves.filter(l => l.status !== 'pending');

  const handleStatusChange = (id, status) => {
    dispatch({ type: 'UPDATE_LEAVE', payload: { id, status } });
    toast(status === 'approved' ? '✓ Leave approved' : 'Leave rejected', status === 'approved' ? 'success' : 'warn');
  };

  const handleAddLeave = () => {
    if (!form.facultyId || !form.from || !form.to || !form.reason) return;
    const faculty = state.faculty.find(f => f.id === form.facultyId);
    const conflict = isConflict(form, state.sessions);
    const id = 'l' + Date.now();
    dispatch({
      type: 'ADD_LEAVE', payload: {
        id, facultyId: form.facultyId, facultyName: faculty?.name || 'Unknown',
        from: form.from, to: form.to, reason: form.reason, status: 'pending', conflict
      }
    });
    toast(conflict ? '⚠ Leave added — CONFLICT DETECTED!' : '✓ Leave request submitted', conflict ? 'warn' : 'success');
    setModal(false);
    setForm(EMPTY_FORM);
  };

  const statusPill = (status) => {
    if (status === 'approved') return 'pill-green';
    if (status === 'rejected') return 'pill-red';
    return 'pill-yellow';
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Leave Requests</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">CIE-II window: Nov 17–22, 2025 (±3 day restriction)</div>
        </div>
        <button className="btn btn-outline" onClick={() => setModal(true)}>+ Add Leave Request</button>
      </div>

      {/* Policy Banner */}
      <div className="bg-[#f85149]/10 border border-[#f85149]/30 px-4 py-3 mb-5 font-mono text-xs text-[#f85149]">
        ⚠ POLICY: No leave approved within 3 days before or after exam window (Nov 14 – Nov 25, 2025)
      </div>

      {/* Pending */}
      <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">
        Pending Requests ({pending.length})
      </div>
      <div className="space-y-2 mb-6">
        {pending.length === 0 && (
          <div className="bg-[#161b22] border border-[#30363d] p-4 text-center text-[#7d8590] font-mono text-sm">No pending leave requests</div>
        )}
        {pending.map(l => {
          const conflict = isConflict(l, state.sessions);
          return (
            <div key={l.id} className="bg-[#161b22] border border-[#30363d] p-4 flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold">{l.facultyName}</div>
                <div className="font-mono text-[11px] text-[#7d8590] mt-0.5">
                  Reason: {l.reason}
                </div>
              </div>
              <div className="font-mono text-[11px] text-[#7d8590]">
                {new Date(l.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} → {new Date(l.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </div>
              {conflict
                ? <span className="font-mono text-[10px] px-2.5 py-1 bg-[#f85149]/15 text-[#f85149] border border-[#f85149]/30 uppercase">✗ Window Conflict</span>
                : <span className="font-mono text-[10px] px-2.5 py-1 bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30 uppercase">✓ Safe Window</span>
              }
              <div className="flex gap-2">
                <button onClick={() => handleStatusChange(l.id, 'approved')}
                  className="font-mono text-[10px] text-[#3fb950] border border-[#3fb950]/40 hover:bg-[#3fb950]/10 px-3 py-1 transition-colors">Approve</button>
                <button onClick={() => handleStatusChange(l.id, 'rejected')}
                  className="font-mono text-[10px] text-[#f85149] border border-[#f85149]/40 hover:bg-[#f85149]/10 px-3 py-1 transition-colors">Reject</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Others */}
      <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">
        Resolved Requests ({others.length})
      </div>
      <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1c2128] border-b border-[#30363d]">
              {['Faculty', 'Leave Dates', 'Reason', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {others.map(l => (
              <tr key={l.id} className="hover:bg-[#1c2128] border-b border-[#30363d] last:border-0">
                <td className="px-4 py-[10px] text-[13px] font-medium">{l.facultyName}</td>
                <td className="px-4 py-[10px] font-mono text-[11px] text-[#7d8590]">
                  {new Date(l.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} → {new Date(l.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </td>
                <td className="px-4 py-[10px] text-xs text-[#7d8590]">{l.reason}</td>
                <td className="px-4 py-[10px]"><span className={`pill ${statusPill(l.status)}`}>{l.status}</span></td>
              </tr>
            ))}
            {others.length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-[#7d8590] font-mono text-sm">No resolved requests yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Leave Modal */}
      {modal && (
        <Modal isOpen={modal} title="Add Leave Request" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Faculty Member</label>
              <select value={form.facultyId} onChange={e => set('facultyId', e.target.value)}
                className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full">
                <option value="">— Select Faculty —</option>
                {state.faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">From Date</label>
                <input type="date" value={form.from} onChange={e => set('from', e.target.value)}
                  className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">To Date</label>
                <input type="date" value={form.to} onChange={e => set('to', e.target.value)}
                  className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Reason</label>
              <input value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Medical, Personal, Conference..."
                className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-[#30363d]">
              <button onClick={() => setModal(false)} className="btn btn-outline text-xs">Cancel</button>
              <button onClick={handleAddLeave} className="btn btn-primary text-xs">Submit Request</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
