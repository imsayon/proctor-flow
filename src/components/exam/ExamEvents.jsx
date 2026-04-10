// src/components/exam/ExamEvents.jsx
// Admin: create/manage exam events + state machine transitions
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useExam, EXAM_STATES, STATE_COLORS, getNextStates } from '../../context/ExamContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';

export default function ExamEvents() {
  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const { currentEvent, setCurrentEvent } = useExam();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'CIE', year: '2025-26' });

  const events = state.examEvents || [];

  const handleCreate = () => {
    const ev = { id: `ev_${Date.now()}`, ...form, status: 'draft', createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_EXAM_EVENT', payload: ev });
    setShowForm(false);
    setForm({ name: '', type: 'CIE', year: '2025-26' });
    toast('✓ Exam event created');
  };

  const handleTransition = (event, newStatus) => {
    // Validate transitions
    if (newStatus === 'configured') {
      const sessions = state.sessions.filter(s => s.eventId === event.id);
      if (sessions.length === 0) { toast('Add at least 1 session first', 'error'); return; }
    }
    if (newStatus === 'allocated') {
      const allocs = state.allocations.filter(a => a.eventId === event.id);
      if (allocs.length === 0) { toast('Run allocation first', 'error'); return; }
    }

    const updated = { ...event, status: newStatus, [`${newStatus}At`]: new Date().toISOString() };
    dispatch({ type: 'UPDATE_EXAM_EVENT', payload: updated });
    if (currentEvent?.id === event.id) setCurrentEvent(updated);
    toast(`✓ Event "${event.name}" → ${newStatus}`);
  };

  const handleSelect = (ev) => {
    setCurrentEvent(ev);
    toast(`Active event: ${ev.name}`);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_EXAM_EVENT', payload: id });
    if (currentEvent?.id === id) setCurrentEvent(null);
    toast('Deleted');
  };

  return (
    <div className="pb-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Exam Events</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">Create and manage exam cycles · Dynamic state machine</div>
        </div>
        {isAdmin && <button onClick={() => setShowForm(true)} className="btn btn-primary">+ New Event</button>}
      </div>

      {/* State machine legend */}
      <div className="flex flex-wrap gap-1 mb-5">
        {EXAM_STATES.map((s, i) => {
          const sc = STATE_COLORS[s];
          return (
            <div key={s} className="flex items-center gap-1">
              <span className={`pill ${sc.bg} ${sc.text} border ${sc.border}`}>{s}</span>
              {i < EXAM_STATES.length - 1 && <span className="text-[#484f58] text-[10px]">→</span>}
            </div>
          );
        })}
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {events.map(ev => {
          const sc = STATE_COLORS[ev.status] || STATE_COLORS.draft;
          const isActive = currentEvent?.id === ev.id;
          const sessionCount = state.sessions.filter(s => s.eventId === ev.id).length;
          const allocCount = state.allocations.filter(a => a.eventId === ev.id).length;
          const nextStates = getNextStates(ev.status);

          return (
            <div key={ev.id} className={`bg-[#161b22] border p-5 transition-all ${
              isActive ? 'border-[#f0a500]' : 'border-[#30363d] hover:border-[#7d8590]'
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold">{ev.name || 'Unnamed Event'}</div>
                    <span className={`pill ${sc.bg} ${sc.text} border ${sc.border}`}>{ev.status}</span>
                    {isActive && <span className="pill pill-yellow">ACTIVE</span>}
                  </div>
                  <div className="font-mono text-xs text-[#7d8590] mt-1">
                    {ev.type} · {ev.year} · {sessionCount} sessions · {allocCount} allocations
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isActive && isAdmin && (
                    <button onClick={() => handleSelect(ev)} className="btn btn-outline text-[10px] !py-1 !px-2">
                      ◉ Set Active
                    </button>
                  )}
                  {isAdmin && nextStates.map(ns => (
                    <button key={ns} onClick={() => handleTransition(ev, ns)}
                      className="btn btn-outline text-[10px] !py-1 !px-2"
                      style={{ borderColor: STATE_COLORS[ns]?.dot, color: STATE_COLORS[ns]?.dot }}>
                      → {ns}
                    </button>
                  ))}
                  {isAdmin && ev.status === 'draft' && (
                    <button onClick={() => handleDelete(ev.id)} className="btn btn-danger text-[10px] !py-1 !px-2">✗</button>
                  )}
                </div>
              </div>

              {/* State progress bar */}
              <div className="flex gap-0 mt-3">
                {EXAM_STATES.map((s, i) => {
                  const idx = EXAM_STATES.indexOf(ev.status);
                  return (
                    <div key={s} className={`flex-1 h-1.5 ${i === 0 ? '' : '-ml-[1px]'} transition-all ${
                      i <= idx ? `bg-[${STATE_COLORS[s].dot}]` : 'bg-[#30363d]'
                    }`} style={i <= idx ? { background: STATE_COLORS[s].dot } : {}} />
                  );
                })}
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="bg-[#161b22] border border-[#30363d] p-8 text-center">
            <div className="font-mono text-sm text-[#7d8590]">No exam events yet. Create one to get started.</div>
          </div>
        )}
      </div>

      {/* Create form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Exam Event">
        <div className="flex flex-col gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Event Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. CIE-2 AY 2025-26"
              className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none">
                <option value="CIE">CIE</option>
                <option value="SEE">SEE</option>
                <option value="Supplementary">Supplementary</option>
                <option value="Re-exam">Re-exam</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Academic Year</label>
              <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2025-26"
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
            </div>
          </div>
          <button onClick={handleCreate} disabled={!form.name.trim()} className="btn btn-primary mt-2">Create Event (Draft)</button>
        </div>
      </Modal>
    </div>
  );
}
