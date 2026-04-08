// src/components/common/Confirm.jsx
export default function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-[#161b22] border border-[#30363d] p-6 max-w-sm w-full mx-4">
        <div className="text-sm text-[#e6edf3] mb-5">{message}</div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn btn-outline text-xs px-3 py-2">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger text-xs px-3 py-2">Confirm</button>
        </div>
      </div>
    </div>
  );
}
