// src/components/common/Toast.jsx
import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`font-mono text-xs px-4 py-3 border shadow-lg animate-in slide-in-from-right-4 duration-300 ${
            t.type === 'error' ? 'bg-[#161b22] border-[#f85149] text-[#f85149]' :
            t.type === 'warn' ? 'bg-[#161b22] border-[#f0a500] text-[#f0a500]' :
            'bg-[#161b22] border-[#3fb950] text-[#3fb950]'
          }`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
