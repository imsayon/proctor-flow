// src/components/rooms/RoomConfig.jsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';
import Confirm from '../common/Confirm';

function buildLayout(rows, cols) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ row: r, col: c, enabled: true }))
  );
}

function RoomForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    building: initial?.building || 'Block A',
    rows: initial?.rows || 5,
    cols: initial?.cols || 8,
    benchLayout: initial?.benchLayout || buildLayout(initial?.rows || 5, initial?.cols || 8),
    id: initial?.id,
    capacity: initial?.capacity,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDimensionsChange = (rows, cols) => {
    const r = Number(rows), c = Number(cols);
    const layout = buildLayout(r, c);
    // Preserve existing enabled states
    if (form.benchLayout) {
      for (let ri = 0; ri < Math.min(r, form.rows); ri++) {
        for (let ci = 0; ci < Math.min(c, form.cols); ci++) {
          if (form.benchLayout[ri]?.[ci]) {
            layout[ri][ci].enabled = form.benchLayout[ri][ci].enabled;
          }
        }
      }
    }
    set('rows', r);
    set('cols', c);
    set('benchLayout', layout);
  };

  const toggleBench = (row, col) => {
    const newLayout = form.benchLayout.map(r => r.map(b => ({ ...b })));
    newLayout[row][col].enabled = !newLayout[row][col].enabled;
    set('benchLayout', newLayout);
  };

  const enabledCount = form.benchLayout.flat().filter(b => b.enabled).length;

  const handleSave = () => {
    onSave({ ...form, capacity: enabledCount });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Room Name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Room A101" className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Building / Block</label>
          <input value={form.building} onChange={e => set('building', e.target.value)} placeholder="Block A" className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Rows</label>
          <input type="number" min={1} max={12} value={form.rows} onChange={e => handleDimensionsChange(e.target.value, form.cols)} className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">Columns (Benches/Row)</label>
          <input type="number" min={1} max={15} value={form.cols} onChange={e => handleDimensionsChange(form.rows, e.target.value)} className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500] w-full" />
        </div>
      </div>

      {/* Grid Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">
            Bench Layout — Click to toggle
          </span>
          <span className="font-mono text-[11px] text-[#f0a500]">{enabledCount} active seats</span>
        </div>
        <div className="bg-[#0d1117] border border-[#30363d] p-4 overflow-auto max-h-64">
          <div className="flex flex-col gap-1.5" style={{ minWidth: `${form.cols * 28}px` }}>
            {form.benchLayout.map((row, ri) => (
              <div key={ri} className="flex gap-1.5 items-center">
                <span className="font-mono text-[9px] text-[#7d8590] w-4 text-right flex-shrink-0">R{ri + 1}</span>
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    onClick={() => toggleBench(ri, ci)}
                    title={`Row ${ri + 1}, Col ${ci + 1}`}
                    className={`w-6 h-6 cursor-pointer border transition-all duration-100 flex-shrink-0 flex items-center justify-center text-[7px] font-mono ${
                      cell.enabled
                        ? 'bg-[#f0a500]/20 border-[#f0a500]/50 hover:bg-[#f0a500]/40 text-[#f0a500]'
                        : 'bg-[#1c2128] border-[#30363d] hover:bg-[#30363d] text-[#7d8590]'
                    }`}
                  >
                    {ci + 1}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-2 font-mono text-[10px] text-[#7d8590]">
          <span>🟡 Active seat</span>
          <span>⬛ Disabled/aisle</span>
          <span className="ml-auto text-[#f0a500]">Grid: {form.rows}×{form.cols} = {enabledCount} seats</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-[#30363d]">
        <button onClick={onCancel} className="btn btn-outline text-xs">Cancel</button>
        <button onClick={handleSave} className="btn btn-primary text-xs" disabled={!form.name}>Save Room</button>
      </div>
    </div>
  );
}

export default function RoomConfig() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleAdd = (form) => {
    const id = 'r' + Date.now();
    dispatch({ type: 'ADD_ROOM', payload: { ...form, id } });
    toast('✓ Room added: ' + form.name);
    setModal(null);
  };

  const handleEdit = (form) => {
    dispatch({ type: 'UPDATE_ROOM', payload: form });
    toast('✓ Room updated: ' + form.name);
    setModal(null);
  };

  const handleDelete = (id) => {
    const r = state.rooms.find(x => x.id === id);
    dispatch({ type: 'DELETE_ROOM', payload: id });
    toast('Removed: ' + r?.name, 'warn');
    setConfirmDelete(null);
    if (selectedRoom?.id === id) setSelectedRoom(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Room Configuration</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">{state.rooms.length} examination rooms configured</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Room</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Room List */}
        <div className="lg:col-span-1">
          <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">Rooms</div>
          <div className="space-y-2">
            {state.rooms.map(room => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <div key={room.id} onClick={() => setSelectedRoom(room)}
                  className={`bg-[#161b22] border p-4 cursor-pointer transition-all ${isSelected ? 'border-[#f0a500] bg-[#f0a500]/5' : 'border-[#30363d] hover:border-[#7d8590]'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`text-[13px] font-semibold ${isSelected ? 'text-[#f0a500]' : 'text-[#e6edf3]'}`}>{room.name}</div>
                      <div className="font-mono text-[10px] text-[#7d8590] mt-1">{room.building} · {room.rows}×{room.cols} grid</div>
                    </div>
                    <span className="pill pill-blue">{room.capacity} seats</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={e => { e.stopPropagation(); setModal({ edit: room }); }} className="font-mono text-[10px] text-[#7d8590] hover:text-[#f0a500] border border-[#30363d] hover:border-[#f0a500] px-2 py-0.5 transition-colors">Edit</button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(room.id); }} className="font-mono text-[10px] text-[#7d8590] hover:text-[#f85149] border border-[#30363d] hover:border-[#f85149] px-2 py-0.5 transition-colors">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Preview */}
        <div className="lg:col-span-2">
          <div className="font-mono text-[11px] uppercase tracking-[2px] text-[#7d8590] mb-3">
            {selectedRoom ? `${selectedRoom.name} — Bench Layout Preview` : 'Select a room to preview its layout'}
          </div>
          {selectedRoom ? (
            <div className="bg-[#161b22] border border-[#30363d] p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-semibold text-base">{selectedRoom.name}</div>
                  <div className="font-mono text-[11px] text-[#7d8590]">{selectedRoom.building} · {selectedRoom.rows} rows × {selectedRoom.cols} cols</div>
                </div>
                <span className="pill pill-green">{selectedRoom.capacity} active seats</span>
              </div>
              <div className="bg-[#0d1117] border border-[#30363d] p-4 overflow-auto">
                <div className="mb-3 text-center">
                  <div className="inline-block bg-[#30363d] font-mono text-[10px] text-[#7d8590] px-10 py-1.5">BLACKBOARD / FRONT</div>
                </div>
                <div className="flex flex-col gap-1.5 items-center" style={{ minWidth: `${selectedRoom.cols * 28}px` }}>
                  {selectedRoom.benchLayout.map((row, ri) => (
                    <div key={ri} className="flex gap-1.5 items-center">
                      <span className="font-mono text-[9px] text-[#7d8590] w-4 text-right flex-shrink-0">R{ri + 1}</span>
                      {row.map((cell, ci) => (
                        <div key={ci} className={`w-6 h-6 flex-shrink-0 border flex items-center justify-center text-[7px] font-mono ${
                          cell.enabled ? 'bg-[#f0a500]/15 border-[#f0a500]/40 text-[#f0a500]' : 'bg-[#1c2128] border-[#30363d] text-[#30363d]'
                        }`}>
                          {cell.enabled ? ci + 1 : '░'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex gap-5 font-mono text-[10px] text-[#7d8590]">
                <span>🟡 Active seat</span>
                <span>░ Disabled / Aisle</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] p-12 text-center text-[#7d8590] font-mono text-sm">
              ← Select a room from the list to preview its bench layout
            </div>
          )}
        </div>
      </div>

      {modal === 'add' && (
        <Modal title="Add Examination Room" onClose={() => setModal(null)} width="max-w-2xl">
          <RoomForm initial={null} onSave={handleAdd} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.edit && (
        <Modal title="Edit Room Configuration" onClose={() => setModal(null)} width="max-w-2xl">
          <RoomForm initial={modal.edit} onSave={handleEdit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {confirmDelete && (
        <Confirm message="Delete this room? Exam sessions assigned to it may be affected." onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}
