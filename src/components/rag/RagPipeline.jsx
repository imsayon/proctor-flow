// src/components/rag/RagPipeline.jsx
// 4-step wizard: Ingest → Extract → Diff → Commit
import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { parseFileToText, extractEntities } from '../../lib/gemini';
import { FileUp, Zap, CheckCircle2, RotateCcw, AlertTriangle, FileSpreadsheet } from 'lucide-react';

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
      toast(`Parsed ${f.name} (${type.toUpperCase()}, ${(text.length / 1024).toFixed(1)}KB)`, 'success');
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
      toast(`Extracted: ${counts || 'no entities found'}`, 'success');
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
    toast('Data committed to ProctorFlow!', 'success');
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
    <div className="pb-10 animate-fadein">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Retrieve Info</div>
          <div className="text-xs text-[#7d8590] mt-1 font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#f0a500] rounded-full" />
            Gemini AI pipeline: Ingest → Extract → Diff → Commit
          </div>
        </div>
        {step > 0 && <button onClick={reset} className="btn border border-[#30363d] text-xs flex items-center gap-1.5 hover:border-[#7d8590] transition-colors"><RotateCcw size={14} /> Reset Wizard</button>}
      </div>

      {/* Step indicator */}
      <div className="flex gap-0 mb-6 relative z-10">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 p-[14px_16px] border border-[#30363d] -mr-[1px] transition-all duration-300 ${
            i < step ? 'border-[#3fb950] bg-[#3fb950]/5 text-[#3fb950]' :
            i === step ? 'border-[#f0a500] bg-[#f0a500]/5 text-[#f0a500] z-20' :
            'bg-[#1c2128] text-[#7d8590]'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] opacity-70 block mb-1">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xs font-semibold uppercase tracking-wider">{s}</span>
              </div>
              {i < step && <CheckCircle2 size={16} />}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 font-mono text-xs text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/30 p-4 rounded-sm">
          <AlertTriangle size={16} className="shrink-0" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="bg-[#161b22] border border-[#30363d] p-12 text-center rounded-md hover:border-[#7d8590] transition-colors group cursor-pointer" onClick={() => fileRef.current?.click()}>
          <div className="w-16 h-16 bg-[#1c2128] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#30363d] group-hover:border-[#f0a500] group-hover:text-[#f0a500] transition-all duration-300">
            <FileUp size={28} />
          </div>
          <div className="font-semibold text-lg mb-1">Select a File to Ingest</div>
          <div className="font-mono text-xs text-[#7d8590] mb-6 max-w-sm mx-auto leading-relaxed">
            Upload CSV, Excel, or PDF containing student lists, faculty directories, or timetables.
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.txt" onChange={handleFile} className="hidden" />
          <button className="btn btn-primary px-6"><FileSpreadsheet size={16} className="mr-2 inline" /> Browse Local Files</button>
        </div>
      )}

      {/* Step 1: Extracted raw preview + trigger Gemini */}
      {step === 1 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden animate-fadein">
          <div className="p-5 border-b border-[#30363d] flex items-center justify-between bg-[#1c2128]">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-[#58a6ff]" />
              <div>
                <div className="font-semibold text-sm text-[#e6edf3]">{file?.name}</div>
                <div className="font-mono text-[10px] text-[#7d8590] mt-0.5 uppercase tracking-wider">{fileType} · {(rawText.length / 1024).toFixed(1)}KB</div>
              </div>
            </div>
            <button onClick={handleExtract} disabled={extracting} className="btn btn-primary flex items-center gap-2 px-5">
              {extracting ? <RotateCcw size={16} className="animate-spin" /> : <Zap size={16} />}
              {extracting ? 'AI Analyzing...' : 'Extract Entities'}
            </button>
          </div>
          <div className="bg-[#0d1117] p-4 max-h-[300px] overflow-auto font-mono text-[11px] text-[#7d8590] whitespace-pre-wrap leading-relaxed">
            {rawText.slice(0, 3000)}{rawText.length > 3000 ? '\n... (truncated)' : ''}
          </div>
        </div>
      )}

      {/* Step 2: Preview/Diff */}
      {step === 2 && extracted && (
        <div className="space-y-6 animate-fadein">
          {['students', 'faculty', 'timetable'].map(type => {
            const items = extracted[type];
            if (!items?.length) return null;
            const diffed = getDiffs(type, items);
            const cols = type === 'students' ? ['usn', 'name', 'branch', 'semester'] :
                        type === 'faculty' ? ['name', 'designation', 'email', 'employeeId'] :
                        ['date', 'slot', 'startTime', 'subject', 'branch'];
            return (
              <div key={type} className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#30363d] flex items-center justify-between bg-[#1c2128]">
                  <span className="font-semibold text-sm text-[#e6edf3] capitalize flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#3fb950]" />
                    {type}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                    <span className="bg-[#3fb950]/15 text-[#3fb950] px-2 py-0.5 border border-[#3fb950]/30 rounded-sm">
                      {diffed.filter(d => d._status === 'new').length} New
                    </span>
                    {diffed.filter(d => d._status === 'conflict').length > 0 && (
                      <span className="bg-[#f85149]/15 text-[#f85149] px-2 py-0.5 border border-[#f85149]/30 rounded-sm">
                        {diffed.filter(d => d._status === 'conflict').length} Alerts
                      </span>
                    )}
                  </div>
                </div>
                <div className="overflow-auto bg-[#0d1117]">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-[1.5px] text-[#7d8590] w-24">Status</th>
                        {cols.map(c => (
                          <th key={c} className="px-4 py-3 font-mono text-[9px] uppercase tracking-[1.5px] text-[#7d8590]">{c.replace(/([A-Z])/g, ' $1').trim()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      {diffed.map((item, i) => (
                        <tr key={i} className={`group hover:bg-[#161b22] transition-colors ${item._status === 'conflict' ? 'bg-[#f85149]/5' : ''}`}>
                          <td className="px-4 py-2.5">
                            {item._status === 'new' ? (
                              <span className="font-mono text-[10px] text-[#3fb950] flex items-center gap-1"><span className="w-1 h-1 bg-[#3fb950] rounded-full"/> Valid</span>
                            ) : (
                              <span className="font-mono text-[10px] text-[#f85149] flex items-center gap-1"><AlertTriangle size={10}/> Exists</span>
                            )}
                          </td>
                          {cols.map(c => (
                            <td key={c} className="px-4 py-2.5 text-xs text-[#e6edf3] font-medium">{String(item[c] || '—')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          <div className="flex gap-4 pt-2">
            <button onClick={handleCommit} className="btn btn-primary flex-1 py-3 text-sm justify-center">Commit Valid Records to Database</button>
            <button onClick={() => setStep(1)} className="btn btn-outline border-[#30363d] px-6">Modify Extraction</button>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 3 && committed && (
        <div className="bg-[#161b22] border border-[#3fb950]/30 p-12 text-center rounded-md animate-fadein">
          <div className="w-16 h-16 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[#3fb950]">
            <CheckCircle2 size={32} />
          </div>
          <div className="font-semibold text-xl text-[#3fb950] mb-2">Import Successful</div>
          <div className="font-mono text-sm text-[#7d8590] mb-8 leading-relaxed max-w-md mx-auto">
            Successfully appended {extracted.students?.length || 0} students, {extracted.faculty?.length || 0} faculty, and {extracted.timetable?.length || 0} sessions into ProctorFlow.
          </div>
          <button onClick={reset} className="btn border border-[#30363d] hover:border-[#f0a500] hover:text-[#f0a500] px-6 py-2 transition-colors">Start New Import</button>
        </div>
      )}
    </div>
  );
}
