// src/components/schedule/Schedule.jsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useExam } from '../../context/ExamContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';
import Confirm from '../common/Confirm';

const SLOTS = ['FN', 'AN', 'EV'];
const STATUS_OPTIONS = ['scheduled', 'completed', 'cancelled'];

const EMPTY_FORM = { date: '', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: '', roomId: '', maxStudents: 40, status: 'scheduled' };

function SessionForm({ initial, rooms, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSlotChange = (slot) => {
    set('slot', slot);
    if (slot === 'FN') { set('startTime', '09:30'); set('endTime', '12:30'); }
    if (slot === 'AN') { set('startTime', '13:30'); set('endTime', '16:30'); }
    if (slot === 'EV') { set('startTime', '17:00'); set('endTime', '19:00'); }
  };

  const selectedRoom = rooms.find(r => r.id === form.roomId);
  const maxFromRoom = selectedRoom?.capacity || 60;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Subject</label>
          <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Data Structures and Algorithms"
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Slot</label>
          <div className="flex gap-2">
            {SLOTS.map(s => (
              <button key={s} onClick={() => handleSlotChange(s)} type="button"
                className={`flex-1 py-2 font-mono text-xs border transition-colors ${form.slot === s ? 'bg-[#f0a500] text-black border-[#f0a500]' : 'bg-[#1c2128] text-[#7d8590] border-[#30363d] hover:border-[#7d8590]'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Start Time</label>
          <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">End Time</label>
          <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Examination Room</label>
          <select value={form.roomId} onChange={e => set('roomId', e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full">
            <option value="">— Select Room —</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} seats)</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Max Students (≤ {maxFromRoom})</label>
          <input type="number" min={1} max={maxFromRoom} value={form.maxStudents}
            onChange={e => set('maxStudents', Math.min(Number(e.target.value), maxFromRoom))}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full">
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-[#30363d]">
        <button onClick={onCancel} className="btn btn-outline text-xs">Cancel</button>
        <button onClick={() => onSave(form)} className="btn btn-primary text-xs" disabled={!form.subject || !form.date || !form.roomId}>Save Session</button>
      </div>
    </div>
  );
}

export default function Schedule() {
  const { state, dispatch } = useApp();
  const { currentEvent } = useExam();
  const toast = useToast();
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sortedSessions = [...state.sessions].sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot));

  const handleAdd = (form) => {
    const id = 's' + Date.now();
    const eventId = currentEvent?.id || state.examEvents?.[0]?.id || null;
    dispatch({ type: 'ADD_SESSION', payload: { ...form, id, eventId } });
    toast('✓ Session added: ' + form.subject);
    setModal(null);
  };

  const handleEdit = (form) => {
    dispatch({ type: 'UPDATE_SESSION', payload: form });
    toast('✓ Session updated');
    setModal(null);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_SESSION', payload: id });
    toast('Session removed', 'warn');
    setConfirmDelete(null);
  };

  const statusPill = (s) => {
    if (s === 'completed') return 'pill-green';
    if (s === 'cancelled') return 'pill-red';
    return 'pill-yellow';
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Exam Schedule</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">{currentEvent?.name || 'All events'} · {state.sessions.length} sessions configured</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Session</button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['scheduled', 'completed', 'cancelled'].map(status => {
          const count = state.sessions.filter(s => s.status === status).length;
          return (
            <div key={status} className="bg-[#161b22] border border-[#30363d] px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#7d8590] uppercase">{status}</span>
              <span className={`pill ${statusPill(status)}`}>{count}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1c2128] border-b border-[#30363d]">
              {['#', 'Date', 'Slot', 'Time', 'Subject', 'Room', 'Students', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map((s, i) => {
              const room = state.rooms.find(r => r.id === s.roomId);
              return (
                <tr key={s.id} className="hover:bg-[#1c2128] border-b border-[#30363d] last:border-0 transition-colors">
                  <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-[10px] font-mono text-xs">{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td className="px-4 py-[10px]"><span className={`pill ${s.slot === 'FN' ? 'pill-blue' : s.slot === 'AN' ? 'pill-yellow' : 'pill-green'}`}>{s.slot}</span></td>
                  <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{s.startTime}–{s.endTime}</td>
                  <td className="px-4 py-[10px] text-[13px] font-medium max-w-[160px] truncate">{s.subject}</td>
                  <td className="px-4 py-[10px] font-mono text-xs">{room?.name.replace('Room ', '') || s.roomId}</td>
                  <td className="px-4 py-[10px] font-mono text-xs">{s.maxStudents}</td>
                  <td className="px-4 py-[10px]"><span className={`pill ${statusPill(s.status)}`}>{s.status}</span></td>
                  <td className="px-4 py-[10px]">
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ edit: s })} className="font-mono text-[10px] text-[#7d8590] hover:text-[#f0a500] border border-[#30363d] hover:border-[#f0a500] px-2 py-0.5 transition-colors">Edit</button>
                      <button onClick={() => setConfirmDelete(s.id)} className="font-mono text-[10px] text-[#7d8590] hover:text-[#f85149] border border-[#30363d] hover:border-[#f85149] px-2 py-0.5 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {state.sessions.length === 0 && (
              <tr><td colSpan={9} className="text-center py-8 text-[#7d8590] font-mono text-sm">No sessions configured. Click "+ Add Session" to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal === 'add' && (
        <Modal title="Add Exam Session" onClose={() => setModal(null)} width="max-w-xl">
          <SessionForm initial={EMPTY_FORM} rooms={state.rooms} onSave={handleAdd} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.edit && (
        <Modal title="Edit Exam Session" onClose={() => setModal(null)} width="max-w-xl">
          <SessionForm initial={modal.edit} rooms={state.rooms} onSave={handleEdit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {confirmDelete && (
        <Confirm message="Delete this exam session? All related allocations may be lost." onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}
