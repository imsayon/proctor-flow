// src/components/common/Modal.jsx
import { useEffect } from 'react';

export default function Modal({ isOpen = true, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[8vh] bg-black/60" onClick={onClose}>
      <div className={`bg-[#161b22] border border-[#30363d] shadow-2xl animate-fadein ${wide ? 'w-[90vw] max-w-[900px]' : 'w-full max-w-lg'} max-h-[80vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d] sticky top-0 bg-[#161b22] z-10">
          <div className="text-sm font-semibold">{title}</div>
          <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] text-sm">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
