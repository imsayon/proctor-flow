// src/lib/gemini.js — Gemini 1.5 Flash integration for RAG pipeline + chatbot
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let genAI = null;
let model = null;

function getModel() {
  if (!model && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

// ─── Entity Extraction (RAG Step 2) ──────────────────────────────────
export async function extractEntities(textContent, fileType = 'csv') {
  const m = getModel();
  if (!m) throw new Error('Gemini API key not configured');

  const prompt = `You are a data extraction engine for an exam management system called ProctorFlow.
Parse the following ${fileType.toUpperCase()} content and extract structured entities.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "students": [{"usn": "string", "name": "string", "branch": "string", "semester": number, "email": "string"}],
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

  const result = await m.generateContent(prompt);
  const text = result.response.text().trim();
  
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[Gemini] Parse failed:', text);
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

// ─── Contextual Chat (Chatbot) ───────────────────────────────────────
export async function chatWithContext(history, message, appState) {
  const m = getModel();
  if (!m) throw new Error('Gemini API key not configured');

  const stateSnapshot = JSON.stringify({
    totalFaculty: appState.faculty?.length || 0,
    totalRooms: appState.rooms?.length || 0,
    totalSessions: appState.sessions?.length || 0,
    totalAllocations: appState.allocations?.length || 0,
    facultyNames: (appState.faculty || []).map(f => f.name).slice(0, 20),
    roomNames: (appState.rooms || []).map(r => r.name),
    sessionSubjects: (appState.sessions || []).map(s => `${s.subject} (${s.date} ${s.slot})`).slice(0, 20),
    leaveRequests: (appState.leaveRequests || appState.leaves || []).map(l => `${l.facultyName}: ${l.from} to ${l.to} (${l.status})`),
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
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
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
