// src/components/common/Modal.jsx
import { useEffect } from 'react';

export default function Modal({ title, onClose, children, width = 'max-w-lg' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className={`w-full ${width} bg-[#161b22] border border-[#30363d] shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="font-mono text-sm font-semibold text-[#e6edf3]">{title}</div>
          <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
