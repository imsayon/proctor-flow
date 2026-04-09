// src/components/rag/RagPipeline.jsx
// 4-step wizard: Ingest → Extract → Preview/Diff → Commit
import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { parseFileToText, extractEntities } from '../../lib/gemini';

const STEPS = ['Upload', 'Extract', 'Review', 'Commit'];

export default function RagPipeline() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const fileRef = useRef(null);
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [fileType, setFileType] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState('');
  const [committed, setCommitted] = useState(false);

  // Step 1: Upload
  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    try {
      const { text, type } = await parseFileToText(f);
      setRawText(text);
      setFileType(type);
      setStep(1);
      toast(`✓ Parsed ${f.name} (${type.toUpperCase()}, ${(text.length / 1024).toFixed(1)}KB)`);
    } catch (err) {
      setError(`Parse failed: ${err.message}`);
    }
  };

  // Step 2: Extract via Gemini
  const handleExtract = async () => {
    setExtracting(true);
    setError('');
    try {
      const data = await extractEntities(rawText, fileType);
      setExtracted(data);
      setStep(2);
      const counts = [
        data.students?.length ? `${data.students.length} students` : null,
        data.faculty?.length ? `${data.faculty.length} faculty` : null,
        data.timetable?.length ? `${data.timetable.length} sessions` : null,
      ].filter(Boolean).join(', ');
      toast(`✓ Extracted: ${counts || 'no entities found'}`);
    } catch (err) {
      setError(`Extraction failed: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  // Step 4: Commit
  const handleCommit = () => {
    dispatch({ type: 'RAG_IMPORT', payload: extracted });
    setCommitted(true);
    setStep(3);
    toast('✓ Data committed to ProctorFlow!');
  };

  const reset = () => {
    setStep(0); setFile(null); setRawText(''); setExtracted(null); setError(''); setCommitted(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  // Diff: check for duplicates
  const getDiffs = (type, items) => {
    if (!items?.length) return [];
    return items.map(item => {
      if (type === 'students') {
        const dup = state.students?.find(s => s.usn === item.usn);
        return { ...item, _status: dup ? 'conflict' : 'new', _existing: dup };
      }
      if (type === 'faculty') {
        const dup = state.faculty.find(f => f.email === item.email);
        return { ...item, _status: dup ? 'conflict' : 'new', _existing: dup };
      }
      return { ...item, _status: 'new' };
    });
  };

  return (
    <div className="pb-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">RAG Pipeline</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono">Gemini 1.5 Flash · Ingest → Extract → Diff → Commit</div>
        </div>
        {step > 0 && <button onClick={reset} className="btn btn-outline text-xs">↺ Reset</button>}
      </div>

      {/* Step indicator */}
      <div className="flex gap-0 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 p-3 border border-[#30363d] -mr-[1px] font-mono text-xs transition-all ${
            i < step ? 'border-[#3fb950] bg-[#3fb950]/5 text-[#3fb950]' :
            i === step ? 'border-[#f0a500] bg-[#f0a500]/5 text-[#f0a500]' :
            'bg-[#1c2128] text-[#7d8590]'
          }`}>
            <span className="text-[10px]">{String(i + 1).padStart(2, '0')}</span> {s}
            {i < step && ' ✓'}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 font-mono text-xs text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/30 p-3">{error}</div>}

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="bg-[#161b22] border border-[#30363d] p-8 text-center">
          <div className="text-2xl mb-3">📄</div>
          <div className="font-semibold mb-1">Upload a file</div>
          <div className="font-mono text-xs text-[#7d8590] mb-4">CSV, XLSX, or PDF containing student lists, faculty lists, or timetables</div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.txt" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="btn btn-primary">⬆ Choose File</button>
        </div>
      )}

      {/* Step 1: Extracted raw preview + trigger Gemini */}
      {step === 1 && (
        <div className="bg-[#161b22] border border-[#30363d] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-mono text-xs text-[#e6edf3]">{file?.name}</div>
              <div className="font-mono text-[10px] text-[#7d8590]">{fileType.toUpperCase()} · {(rawText.length / 1024).toFixed(1)}KB</div>
            </div>
            <button onClick={handleExtract} disabled={extracting} className="btn btn-primary">
              {extracting ? '⟳ Extracting with Gemini...' : '⚡ Extract Entities'}
            </button>
          </div>
          <div className="bg-black border border-[#30363d] p-3 max-h-[200px] overflow-auto font-mono text-[11px] text-[#7d8590] whitespace-pre-wrap">
            {rawText.slice(0, 3000)}{rawText.length > 3000 ? '\n... (truncated)' : ''}
          </div>
        </div>
      )}

      {/* Step 2: Preview/Diff */}
      {step === 2 && extracted && (
        <div className="space-y-5">
          {['students', 'faculty', 'timetable'].map(type => {
            const items = extracted[type];
            if (!items?.length) return null;
            const diffed = getDiffs(type, items);
            const cols = type === 'students' ? ['usn', 'name', 'branch', 'semester'] :
                        type === 'faculty' ? ['name', 'designation', 'email', 'employeeId'] :
                        ['date', 'slot', 'startTime', 'subject', 'branch'];
            return (
              <div key={type} className="bg-[#161b22] border border-[#30363d]">
                <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
                  <span className="font-mono text-xs text-[#e6edf3] capitalize">{type}</span>
                  <span className="font-mono text-[10px] text-[#7d8590]">
                    {diffed.filter(d => d._status === 'new').length} new · {diffed.filter(d => d._status === 'conflict').length} conflicts
                  </span>
                </div>
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#1c2128]">
                        <th className="text-left px-3 py-2 font-mono text-[9px] uppercase tracking-[1px] text-[#7d8590]">Status</th>
                        {cols.map(c => (
                          <th key={c} className="text-left px-3 py-2 font-mono text-[9px] uppercase tracking-[1px] text-[#7d8590]">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {diffed.map((item, i) => (
                        <tr key={i} className={`border-t border-[#30363d] ${item._status === 'conflict' ? 'bg-[#f85149]/5' : ''}`}>
                          <td className="px-3 py-2">
                            <span className={`pill ${item._status === 'new' ? 'pill-green' : 'pill-yellow'}`}>
                              {item._status === 'new' ? '+ New' : '⚠ Exists'}
                            </span>
                          </td>
                          {cols.map(c => (
                            <td key={c} className="px-3 py-2 font-mono text-xs">{String(item[c] || '—')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          <div className="flex gap-3">
            <button onClick={handleCommit} className="btn btn-primary">✓ Commit to ProctorFlow</button>
            <button onClick={() => setStep(1)} className="btn btn-outline">← Re-extract</button>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 3 && committed && (
        <div className="bg-[#161b22] border border-[#3fb950]/30 p-8 text-center">
          <div className="text-3xl mb-3">✓</div>
          <div className="font-semibold text-[#3fb950] mb-2">Import Complete</div>
          <div className="font-mono text-xs text-[#7d8590] mb-4">
            {extracted.students?.length || 0} students, {extracted.faculty?.length || 0} faculty, {extracted.timetable?.length || 0} sessions added.
          </div>
          <button onClick={reset} className="btn btn-outline">Import Another File</button>
        </div>
      )}
    </div>
  );
}
