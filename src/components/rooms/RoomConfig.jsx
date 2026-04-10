// src/components/rooms/RoomConfig.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';
import SeatGrid, { createGrid, MAX_ROWS, MAX_COLS } from '../seats/SeatGrid';

const PRESETS = [
  { label: 'Classroom 6×8', rows: 6, cols: 8 },
  { label: 'Lab 5×10', rows: 5, cols: 10 },
  { label: 'Exam Hall 10×14', rows: 10, cols: 14 },
  { label: 'Large Hall 20×15', rows: 20, cols: 15 },
  { label: 'Max 30×20', rows: 30, cols: 20 },
];

export default function RoomConfig() {
  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', building: '', rows: 6, cols: 7 });
  const [grid, setGrid] = useState(null);
  const [gridViewId, setGridViewId] = useState(null);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', building: '', rows: 6, cols: 7 });
    setGrid(createGrid(6, 7));
    setShowForm(true);
  };

  const openEdit = (room) => {
    setEditId(room.id);
    setForm({ name: room.name, building: room.building, rows: room.rows, cols: room.cols });
    setGrid(room.seatGrid || createGrid(room.rows, room.cols));
    setShowForm(true);
  };

  const applyPreset = (preset) => {
    setForm(f => ({ ...f, rows: preset.rows, cols: preset.cols }));
    setGrid(createGrid(preset.rows, preset.cols));
  };

  const handleDimChange = (key, val) => {
    const v = Math.max(1, Math.min(key === 'rows' ? MAX_ROWS : MAX_COLS, Number(val) || 1));
    const newForm = { ...form, [key]: v };
    setForm(newForm);
    setGrid(createGrid(newForm.rows, newForm.cols, grid));
  };

  const handleSave = () => {
    const capacity = grid.flat().filter(c => c.state === 'ACTIVE').length;
    const room = { name: form.name, building: form.building, rows: form.rows, cols: form.cols, capacity, seatGrid: grid };
    if (editId) {
      dispatch({ type: 'UPDATE_ROOM', payload: { id: editId, ...room } });
      toast('✓ Room updated');
    } else {
      dispatch({ type: 'ADD_ROOM', payload: { id: `r_${Date.now()}`, ...room } });
      toast('✓ Room created');
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_ROOM', payload: id });
    toast('Deleted');
  };

  return (
    <div className="pb-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Room Configuration</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">Void-logic grid editor · Up to {MAX_ROWS}×{MAX_COLS} seats</div>
        </div>
        {isAdmin && <button onClick={openCreate} className="btn btn-primary">+ Add Room</button>}
      </div>

      {/* Room list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.rooms.map(room => {
          const capacity = room.seatGrid ? room.seatGrid.flat().filter(c => c.state === 'ACTIVE').length : room.capacity;
          const isViewing = gridViewId === room.id;
          return (
            <div key={room.id} className="bg-[#161b22] border border-[#30363d]">
              <div className="p-4 flex items-start justify-between">
                <div>
                  <div className="font-semibold">{room.name}</div>
                  <div className="font-mono text-xs text-[#7d8590]">{room.building} · {room.rows}×{room.cols} · {capacity} seats</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setGridViewId(isViewing ? null : room.id)} className="btn btn-outline text-[10px] !py-1 !px-2">
                    {isViewing ? '▲ Hide' : '▼ Grid'}
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(room)} className="btn btn-outline text-[10px] !py-1 !px-2">Edit</button>
                      <button onClick={() => handleDelete(room.id)} className="btn btn-danger text-[10px] !py-1 !px-2">✗</button>
                    </>
                  )}
                </div>
              </div>
              {isViewing && room.seatGrid && (
                <div className="border-t border-[#30363d] p-3">
                  <SeatGrid grid={room.seatGrid} rows={room.rows} cols={room.cols} onChange={() => {}} readOnly />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Room' : 'Create Room'} wide>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Room Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Room A101"
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Building</label>
              <input value={form.building} onChange={e => setForm(f => ({ ...f, building: e.target.value }))} placeholder="Block A"
                className="w-full bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Rows</label>
              <input type="number" min={1} max={MAX_ROWS} value={form.rows} onChange={e => handleDimChange('rows', e.target.value)}
                className="w-20 bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590] block mb-1">Cols</label>
              <input type="number" min={1} max={MAX_COLS} value={form.cols} onChange={e => handleDimChange('cols', e.target.value)}
                className="w-20 bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]" />
            </div>
            <div className="flex flex-wrap gap-1">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)} className="btn btn-outline text-[9px] !py-0.5 !px-1.5">{p.label}</button>
              ))}
            </div>
          </div>

          {grid && <SeatGrid grid={grid} rows={form.rows} cols={form.cols} onChange={setGrid} />}

          <div className="flex gap-3 mt-2">
            <button onClick={handleSave} disabled={!form.name.trim()} className="btn btn-primary">
              {editId ? '✓ Save Changes' : '+ Create Room'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
            {grid && (
              <span className="ml-auto font-mono text-[10px] text-[#3fb950] self-center">
                {grid.flat().filter(c => c.state === 'ACTIVE').length} active seats
              </span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
