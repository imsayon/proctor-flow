// src/components/rag/ChatBot.jsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { chatWithContext } from '../../lib/gemini';
import { useNavigate } from 'react-router-dom';
import { X, Bot, Settings, Send, FileSearch, Key, Cpu } from 'lucide-react';

export default function ChatBot({ isOpen, onClose }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('proctorflow_gemini_key') || '');
  const [modelName, setModelName] = useState(localStorage.getItem('proctorflow_gemini_model') || 'gemini-1.5-flash');
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithContext(messages, input, state);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('proctorflow_gemini_key', apiKey);
    localStorage.setItem('proctorflow_gemini_model', modelName);
    setShowSettings(false);
    setMessages([{ role: 'assistant', content: 'Settings saved! How can I help you today?' }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-[400px] h-screen bg-[#161b22] border-l border-[#30363d] flex flex-col shadow-2xl z-[100] animate-fadein">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-[#3fb950]" />
          <div className="font-semibold">ProctorFlow AI</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(!showSettings)} className="text-[#7d8590] hover:text-[#e6edf3]">
            <Settings size={16} />
          </button>
          <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3]">
            <X size={18} />
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div className="font-mono text-xs text-[#7d8590] uppercase tracking-wider mb-2">AI Settings</div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#7d8590] flex items-center gap-1.5"><Key size={14}/> Gemini API Key</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIza..."
              className="bg-[#0d1117] border border-[#30363d] p-2 text-sm text-[#e6edf3] outline-none focus:border-[#f0a500]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#7d8590] flex items-center gap-1.5"><Cpu size={14} /> Model Context</label>
            <input type="text" value={modelName} onChange={e => setModelName(e.target.value)} placeholder="gemini-1.5-flash"
              className="bg-[#0d1117] border border-[#30363d] p-2 text-sm text-[#e6edf3] outline-none focus:border-[#f0a500]" />
          </div>
          <button onClick={handleSaveSettings} className="btn btn-primary mt-2">Save Settings</button>
        </div>
      ) : (
        <>
          <div className="p-4 bg-[#0d1117] flex justify-center border-b border-[#30363d]">
            <button onClick={() => { onClose(); navigate('/retrieve'); }} 
              className="flex items-center gap-2 text-xs font-mono text-[#f0a500] hover:bg-[#f0a500]/10 border border-[#f0a500]/50 px-4 py-2 w-full justify-center transition-colors">
              <FileSearch size={14} />
              Open Retrieve Info Wizard
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="bg-[#1c2128] border border-[#30363d] p-3 text-sm text-[#e6edf3]">
                Hi! I'm the ProctorFlow AI Assistant. Ask me about faculty workload, allocation conflicts, room usage, or any exam management question.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 max-w-[85%] text-sm ${
                  m.role === 'user' ? 'bg-[#f0a500]/10 border border-[#f0a500]/30 text-[#e6edf3]' : 'bg-[#1c2128] border border-[#30363d] text-[#e6edf3]'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1c2128] border border-[#30363d] p-3 text-sm text-[#7d8590] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#f0a500] rounded-full animate-pulse" /> Thinking...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-[#30363d] bg-[#161b22] flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything about current state..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#f0a500]" />
            <button type="submit" disabled={loading || !input.trim()} className="bg-[#f0a500] text-black px-3 py-2 disabled:opacity-50">
              <Send size={16} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
