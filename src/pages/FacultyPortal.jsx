// src/pages/FacultyPortal.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/common/Toast';
import { useExam, STATE_COLORS } from '../context/ExamContext';
import { CalendarClock, CheckCircle2, Hand, Clock, Plus, X, Calendar } from 'lucide-react';

export default function FacultyPortal() {
  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const { currentEvent } = useExam();
  const toast = useToast();
  
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' });

  // Filter allocations for this faculty across all sessions
  const myAllocations = state.allocations
    .filter(a => a.f1Id === user.employeeId || a.f2Id === user.employeeId)
    .map(a => {
      const session = state.sessions.find(s => s.id === a.sessionId);
      const room = state.rooms.find(r => r.id === session?.roomId);
      const event = state.examEvents.find(e => e.id === session?.eventId);
      return { ...a, session, room, event };
    })
    .filter(a => a.session && a.event?.status !== 'draft')
    .sort((a, b) => a.session.date.localeCompare(b.session.date));

  // Filter leaves
  const myLeaves = state.leaves.filter(l => l.facultyId === user.employeeId);

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveForm.from || !leaveForm.to || !leaveForm.reason) return;
    
    dispatch({
      type: 'ADD_LEAVE',
      payload: {
        id: `lv_${Date.now()}`,
        facultyUid: user.uid,
        facultyId: user.employeeId,
        facultyName: user.name,
        from: leaveForm.from,
        to: leaveForm.to,
        reason: leaveForm.reason,
        status: 'pending'
      }
    });

    toast('Leave request submitted successfully.', 'success');
    setShowLeaveForm(false);
    setLeaveForm({ from: '', to: '', reason: '' });
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-[#161b22] border border-[#30363d] p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1f6feb]" />
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-xl font-semibold flex items-center gap-2">
              Welcome, {user?.name?.split(' ')[1] || user?.name} <Hand size={18} className="text-[#f0a500]" />
            </div>
            <div className="font-mono text-xs text-[#7d8590] mt-1">{user?.employeeId} · Faculty Member · {user?.dept || 'ISE'} Dept</div>
          </div>
          <div className="text-right">
            {currentEvent && (
               <div className="flex items-center gap-1.5 justify-end mb-1">
                 <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATE_COLORS[currentEvent.status]?.dot }} />
                 <span className="font-mono text-[9px]" style={{ color: STATE_COLORS[currentEvent.status]?.dot }}>{currentEvent.name}</span>
               </div>
            )}
            <div className="font-mono text-sm text-[#f0a500]">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div className="font-mono text-[10px] text-[#7d8590]">Total Assigned Duties: {myAllocations.length}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Schedule */}
        <div className="flex-1">
          <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">
            My Invigilation Schedule
          </div>
          {myAllocations.length === 0 ? (
            <div className="bg-[#161b22] border border-[#30363d] p-10 text-center font-mono text-sm text-[#7d8590]">
              <CalendarClock size={32} className="mx-auto mb-3 opacity-30" />
              You currently have no exam duties allocated.
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
               <table className="w-full border-collapse">
                 <thead>
                   <tr className="bg-[#1c2128] border-b border-[#30363d]">
                     <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Date & Slot</th>
                     <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Subject</th>
                     <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Room</th>
                     <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] font-medium">Co-Invigilator</th>
                   </tr>
                 </thead>
                 <tbody>
                   {myAllocations.map(a => {
                      const coInvgRole = a.f1Id === user.employeeId ? a.f2Name : a.f1Name;
                      return (
                        <tr key={a.id} className="border-b border-[#30363d] hover:bg-[#1c2128] transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-mono text-xs">{new Date(a.session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                            <div className="font-mono text-[10px] text-[#7d8590] mt-0.5"><span className="text-[#f0a500]">{a.session.slot}</span> · {a.session.startTime}-{a.session.endTime}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium">{a.session.subject}</div>
                            <div className="font-mono text-[9px] text-[#7d8590] truncate max-w-[150px]">{a.event.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-xs text-[#3fb950]">{a.room?.name || '—'}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#7d8590]">
                            {coInvgRole || 'None'}
                          </td>
                        </tr>
                      );
                   })}
                 </tbody>
               </table>
            </div>
          )}
        </div>

        {/* Right Column: Leaves */}
        <div className="lg:w-[350px]">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590]">
              Leave Requests
            </div>
            {!showLeaveForm && (
              <button 
                onClick={() => setShowLeaveForm(true)} 
                className="btn btn-outline !py-1 !px-2 text-[10px] flex items-center gap-1"
              >
                <Plus size={12}/> Request
              </button>
            )}
          </div>

          {showLeaveForm ? (
            <div className="bg-[#161b22] border border-[#30363d] p-4 mb-4 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0a500]" />
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-xs font-semibold">New Leave Request</div>
                <button onClick={() => setShowLeaveForm(false)} className="text-[#7d8590] hover:text-[#e6edf3]"><X size={14}/></button>
              </div>
              <form onSubmit={handleLeaveSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[9px] text-[#7d8590] uppercase block mb-1">From</label>
                    <input type="date" required value={leaveForm.from} onChange={e => setLeaveForm({...leaveForm, from: e.target.value})}
                      className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] px-2 py-1.5 font-mono text-[11px] outline-none" />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-[#7d8590] uppercase block mb-1">To</label>
                    <input type="date" required value={leaveForm.to} onChange={e => setLeaveForm({...leaveForm, to: e.target.value})}
                      className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] px-2 py-1.5 font-mono text-[11px] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[9px] text-[#7d8590] uppercase block mb-1">Reason</label>
                  <input type="text" required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                    placeholder="E.g. Medical, Personal"
                    className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] px-2 py-1.5 font-mono text-[11px] outline-none" />
                </div>
                <button type="submit" className="btn btn-primary text-xs !py-1.5 mt-2">Submit Request</button>
              </form>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {myLeaves.length === 0 ? (
              <div className="text-center font-mono text-xs text-[#7d8590] py-6 border border-dashed border-[#30363d] bg-[#161b22]">
                No leave requests found.
              </div>
            ) : (
              myLeaves.map(l => (
                <div key={l.id} className="bg-[#161b22] border border-[#30363d] p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[10px] text-[#7d8590] flex items-center gap-1.5">
                      <Calendar size={12} /> {l.from} to {l.to}
                    </div>
                    <span className={`pill ${l.status === 'approved' ? 'pill-green' : l.status === 'rejected' ? 'pill-red' : 'pill-yellow'}`}>
                      {l.status}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#e6edf3]">{l.reason}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
