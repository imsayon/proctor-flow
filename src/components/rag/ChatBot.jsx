// src/components/rag/ChatBot.jsx
// Slide-in AI assistant panel (Admin only)
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { chatWithContext } from '../../lib/gemini';

export default function ChatBot({ isOpen, onClose }) {
  const { state } = useApp();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m the ProctorFlow AI Assistant. Ask me about faculty workload, allocation conflicts, room usage, or any exam management question.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0);
      const reply = await chatWithContext(history, userMsg.content, state);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[380px] bg-[#161b22] border-l border-[#30363d] z-[100] flex flex-col shadow-2xl animate-fadein">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#1c2128]">
        <div>
          <div className="text-sm font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#3fb950] rounded-full animate-pulse" />
            ProctorFlow AI
          </div>
          <div className="font-mono text-[9px] text-[#7d8590]">Gemini 1.5 Flash · Contextual Q&A</div>
        </div>
        <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] text-lg leading-none">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#f0a500]/15 border border-[#f0a500]/30 text-[#e6edf3]'
                : 'bg-[#1c2128] border border-[#30363d] text-[#e6edf3]'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1c2128] border border-[#30363d] px-3 py-2 text-xs text-[#7d8590]">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#30363d] bg-[#1c2128]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about duties, seats, conflicts..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] px-3 py-2 font-mono text-xs outline-none focus:border-[#f0a500]"
            disabled={loading}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="btn btn-primary !py-2 !px-3 text-xs">
            →
          </button>
        </div>
        <div className="font-mono text-[8px] text-[#484f58] mt-1.5">
          Powered by Gemini 1.5 Flash · Context: {state.faculty.length} faculty, {state.sessions.length} sessions
        </div>
      </div>
    </div>
  );
}
