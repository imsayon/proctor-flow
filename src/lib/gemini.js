// src/lib/gemini.js — Gemini 1.5 Flash integration for RAG pipeline + chatbot
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;
let currentKey = null;
let currentModelName = null;

// Allow dynamic reconfiguration from UI
export function getModel() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const storedKey = localStorage.getItem('proctorflow_gemini_key') || envKey;
  const storedModel = localStorage.getItem('proctorflow_gemini_model') || 'gemini-1.5-flash';

  if (!storedKey) return null;

  if (!model || currentKey !== storedKey || currentModelName !== storedModel) {
    currentKey = storedKey;
    currentModelName = storedModel;
    genAI = new GoogleGenerativeAI(storedKey);
    model = genAI.getGenerativeModel({ model: storedModel });
  }
  return model;
}

// ─── Entity Extraction (RAG Step 2) ──────────────────────────────────
export async function extractEntities(textContent, fileType = 'csv') {
  const m = getModel();
  if (!m) throw new Error('Gemini API key not configured. Please set it in the AI Assistant settings.');

  const prompt = `You are a data extraction engine for an exam management system called ProctorFlow.
Parse the following ${fileType.toUpperCase()} content and extract structured entities.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "students": [{"usn": "string", "name": "string", "branch": "string", "semester": 1, "email": "string"}],
  "faculty": [{"name": "string", "designation": "string", "email": "string", "employeeId": "string"}],
  "timetable": [{"date": "YYYY-MM-DD", "slot": "FN|AN|EV", "startTime": "HH:MM", "endTime": "HH:MM", "subject": "string", "branch": "string"}]
}

Only include arrays that have data found. If a category has no data, return an empty array.
For branch codes, normalize to: ISE, CSE, ECE, MECH, CIVIL, EEE, AI, etc.
For dates, normalize to YYYY-MM-DD format.

Content to parse:
---
${textContent.slice(0, 30000)}
---`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[Gemini] Extraction failed:', e);
    throw new Error(e.message || 'Failed to parse Gemini response');
  }
}

// ─── Contextual Chat (Chatbot) ───────────────────────────────────────
export async function chatWithContext(history, message, appState) {
  const m = getModel();
  if (!m) throw new Error('Gemini API key not configured. Please set it in Settings.');

  const stateSnapshot = JSON.stringify({
    totalFaculty: appState.faculty?.length || 0,
    totalRooms: appState.rooms?.length || 0,
    totalSessions: appState.sessions?.length || 0,
    totalStudents: appState.students?.length || 0,
    totalAllocations: appState.allocations?.length || 0,
    facultyNames: (appState.faculty || []).map(f => f.name).slice(0, 20),
    roomNames: (appState.rooms || []).map(r => r.name),
    sessionSubjects: (appState.sessions || []).map(s => `${s.subject} (${s.date} ${s.slot})`).slice(0, 20),
    leaveRequests: (appState.leaves || []).map(l => `${l.facultyName}: ${l.from} to ${l.to} (${l.status})`),
    allocations: (appState.allocations || []).map(a => `Session ${a.sessionId}: ${a.f1Name || 'TBD'} + ${a.f2Name || 'TBD'} (${a.status})`).slice(0, 20),
  }, null, 0);

  const systemPrompt = `You are ProctorFlow AI Assistant — an expert in exam duty allocation, seating arrangements, and academic administration.
You have access to the current system state:
${stateSnapshot}

Answer questions about faculty workload, allocation conflicts, room utilization, leave conflicts, and exam scheduling.
Be concise, precise, and data-driven. Use the actual names and numbers from the state above.
If asked about something not in the data, say so clearly.`;

  const chat = m.startChat({
    history: [
      { role: 'user', parts: [{ text: 'System context: ' + systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I have access to the ProctorFlow system state and I\'m ready to answer questions about faculty, rooms, allocations, and scheduling.' }] },
      ...history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ─── File parsing helpers ────────────────────────────────────────────
export async function parseFileToText(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv' || ext === 'txt') {
    return { text: await file.text(), type: 'csv' };
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const rows = [];
    wb.SheetNames.forEach(name => {
      const sheet = wb.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      rows.push(`--- Sheet: ${name} ---\n${csv}`);
    });
    return { text: rows.join('\n\n'), type: 'xlsx' };
  }

  if (ext === 'pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    // FIXED WORKER URL to unpkg which serves .mjs properly
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      pages.push(tc.items.map(item => item.str).join(' '));
    }
    return { text: pages.join('\n\n'), type: 'pdf' };
  }

  throw new Error(`Unsupported file type: .${ext}`);
}
