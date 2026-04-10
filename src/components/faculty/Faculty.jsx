// src/components/faculty/Faculty.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import Modal from '../common/Modal';
import Confirm from '../common/Confirm';

const DESIGNATIONS = ['Professor', 'Assoc. Professor', 'Asst. Professor', 'Lecturer', 'HOD'];

const EMPTY_FORM = { name: '', desg: 'Asst. Professor', email: '', duties: 0, available: true };

function FacultyForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name">
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Prof. First Last" className="field-input" />
        </Field>
        <Field label="Designation">
          <select value={form.desg} onChange={e => set('desg', e.target.value)} className="field-input">
            {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@dsce.edu" className="field-input" />
        </Field>
        <Field label="CIE-I Duties (history)">
          <input type="number" min={0} max={10} value={form.duties} onChange={e => set('duties', Number(e.target.value))} className="field-input" />
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} className="w-3.5 h-3.5 accent-[#f0a500]" />
        <span className="font-mono text-xs text-[#7d8590]">Available for duty assignment</span>
      </label>
      <div className="flex gap-2 justify-end pt-2 border-t border-[#30363d]">
        <button onClick={onCancel} className="btn btn-outline text-xs">Cancel</button>
        <button onClick={() => onSave(form)} className="btn btn-primary text-xs" disabled={!form.name || !form.email}>Save Faculty</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[1px] text-[#7d8590]">{label}</label>
      {children}
    </div>
  );
}

export default function Faculty() {
  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | {edit: faculty}
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = state.faculty.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.desg.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (form) => {
    const id = 'f' + Date.now();
    dispatch({ type: 'ADD_FACULTY', payload: { ...form, id } });
    toast('✓ Faculty added: ' + form.name);
    setModal(null);
  };

  const handleEdit = (form) => {
    dispatch({ type: 'UPDATE_FACULTY', payload: form });
    toast('✓ Faculty updated');
    setModal(null);
  };

  const handleDelete = (id) => {
    const f = state.faculty.find(x => x.id === id);
    dispatch({ type: 'DELETE_FACULTY', payload: id });
    toast('Removed: ' + f?.name, 'warn');
    setConfirmDelete(null);
  };

  const handleToggle = (id) => {
    dispatch({ type: 'TOGGLE_FACULTY_AVAILABILITY', payload: id });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Faculty Registry</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">ISE Department · {state.faculty.length} faculty members</div>
        </div>
        <div className="flex gap-2.5">
          <input type="text" placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-[#1c2128] border border-[#30363d] text-[#e6edf3] px-3.5 py-2 font-mono text-xs outline-none w-[240px] focus:border-[#f0a500] transition-colors" />
          {isAdmin && <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Faculty</button>}
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1c2128] border-b border-[#30363d]">
              {['#', 'Name', 'Designation', 'Email', 'Duties', 'Availability', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[1.5px] text-[#7d8590] font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => {
              const pc = f.duties >= 3 ? 'pill-red' : f.duties >= 2 ? 'pill-yellow' : 'pill-green';
              return (
                <tr key={f.id} className="hover:bg-[#1c2128] border-b border-[#30363d] last:border-0 transition-colors">
                  <td className="px-4 py-[10px] font-mono text-xs text-[#7d8590]">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-[10px] text-[13px] font-semibold whitespace-nowrap">{f.name}</td>
                  <td className="px-4 py-[10px] text-xs text-[#7d8590]">{f.desg}</td>
                  <td className="px-4 py-[10px] font-mono text-[11px] text-[#7d8590]">{f.email}</td>
                  <td className="px-4 py-[10px]"><span className={`pill ${pc}`}>{f.duties} duties</span></td>
                  <td className="px-4 py-[10px]">
                    <button onClick={() => handleToggle(f.id)} className={`pill cursor-pointer hover:opacity-80 transition-opacity ${f.available ? 'pill-green' : 'pill-red'}`}>
                      {f.available ? '✓ Available' : '✗ On Leave'}
                    </button>
                  </td>
                  <td className="px-4 py-[10px]">
                    <span className={`pill ${f.available ? 'pill-blue' : 'pill-red'}`}>{f.available ? 'Eligible' : 'Restricted'}</span>
                  </td>
                  <td className="px-4 py-[10px]">
                    <div className="flex gap-2">
                      {isAdmin && (
                        <>
                          <button onClick={() => setModal({ edit: f })} className="font-mono text-[10px] text-[#7d8590] hover:text-[#f0a500] transition-colors border border-[#30363d] hover:border-[#f0a500] px-2 py-0.5">Edit</button>
                          <button onClick={() => setConfirmDelete(f.id)} className="font-mono text-[10px] text-[#7d8590] hover:text-[#f85149] transition-colors border border-[#30363d] hover:border-[#f85149] px-2 py-0.5">Del</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-[#7d8590] font-mono text-sm">No faculty found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal === 'add' && isAdmin && (
        <Modal title="Add Faculty Member" onClose={() => setModal(null)}>
          <style>{`.field-input { background: #1c2128; border: 1px solid #30363d; color: #e6edf3; padding: 8px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; outline: none; width: 100%; transition: border-color 0.15s; } .field-input:focus { border-color: #f0a500; }`}</style>
          <FacultyForm initial={EMPTY_FORM} onSave={handleAdd} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.edit && isAdmin && (
        <Modal title="Edit Faculty Member" onClose={() => setModal(null)}>
          <style>{`.field-input { background: #1c2128; border: 1px solid #30363d; color: #e6edf3; padding: 8px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; outline: none; width: 100%; transition: border-color 0.15s; } .field-input:focus { border-color: #f0a500; }`}</style>
          <FacultyForm initial={modal.edit} onSave={handleEdit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {confirmDelete && (
        <Confirm
          message="Are you sure you want to remove this faculty member? This action cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
