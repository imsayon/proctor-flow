// src/lib/llm.js

const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(url, options = {}, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const res = await fetch(url, options);
      // 429 = Too Many Requests, 503 = Service Unavailable
      if (res.status === 429 || res.status === 503) {
        attempt++;
        if (attempt >= retries) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error?.message || `HTTP ${res.status}: Server heavily overloaded. Please try again later.`);
        }
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`[LLM] API congested (${res.status}). Retrying in ${waitTime}ms... (Attempt ${attempt}/${retries - 1})`);
        await wait(waitTime);
        continue;
      }
      return res; 
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      console.warn(`[LLM] Network failure (${err.message}). Retrying...`);
      await wait(Math.pow(2, attempt) * 1000);
    }
  }
}

export const PROVIDERS = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    detect: (key) => key.startsWith('AIza'),
    fetchModels: async (key) => {
      const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Invalid Gemini Key');
      return data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
    }
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    detect: (key) => key.startsWith('sk-proj') || (key.startsWith('sk-') && !key.startsWith('sk-ant')),
    fetchModels: async (key) => fetchOpenAIModels('https://api.openai.com/v1', key)
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    detect: (key) => key.startsWith('gsk_'),
    fetchModels: async (key) => fetchOpenAIModels('https://api.groq.com/openai/v1', key)
  },
  xai: {
    id: 'xai',
    name: 'xAI',
    baseURL: 'https://api.x.ai/v1',
    detect: (key) => key.startsWith('xai-'),
    fetchModels: async (key) => fetchOpenAIModels('https://api.x.ai/v1', key)
  }
};

async function fetchOpenAIModels(baseURL, key) {
  const res = await fetchWithRetry(`${baseURL}/models`, { headers: { 'Authorization': `Bearer ${key}` }});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Invalid API Key');
  return data.data.map(m => m.id);
}

export function identifyProvider(key) {
  if (!key) return null;
  for (const p of Object.values(PROVIDERS)) {
    if (p.detect(key)) return p;
  }
  return null;
}

function getLLMConfig() {
  const key = localStorage.getItem('proctorflow_llm_key');
  const providerId = localStorage.getItem('proctorflow_llm_provider');
  const model = localStorage.getItem('proctorflow_llm_model');
  
  if (!key || !providerId || !model) return null;
  const provider = PROVIDERS[providerId];
  if (!provider) return null;
  
  return { key, provider, model };
}

// =========================================================================
// Generation Core Logic
// =========================================================================

async function generateWithOpenAICompat(baseURL, key, model, systemPrompt, userMessage, history = [], isJSON = false) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  // Format history
  for (const h of history) {
    messages.push({
      role: h.role === 'assistant' || h.role === 'model' ? 'assistant' : 'user',
      content: h.content || h.parts?.[0]?.text
    });
  }
  
  if (userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }

  const body = { model, messages };
  if (isJSON) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetchWithRetry(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `API Error ${res.status}`);
  return data.choices[0].message.content;
}

async function generateWithGemini(key, modelName, systemPrompt, userMessage, history = [], isJSON = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
  
  const contents = [];
  
  for (const h of history) {
    contents.push({
      role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.content || h.parts?.[0]?.text }]
    });
  }
  
  if (userMessage) {
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });
  }

  const body = { contents };

  // Inject System Prompt using official v1beta structure
  if (systemPrompt) {
    body.systemInstruction = {
      role: "user",
      parts: [{ text: systemPrompt }]
    };
  }

  // Force strict JSON adherence natively on Google's end
  if (isJSON) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  // Uses Retry logic natively to bypass 503 hiccups!
  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Gemini API Error ${res.status}`);
  return data.candidates[0].content.parts[0].text;
}

export async function chatWithContext(history, message, appState) {
  const config = getLLMConfig();
  if (!config) throw new Error('AI Provider not configured. Please set it in the Admin Profile page.');

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

  if (config.provider.id === 'gemini') {
    return generateWithGemini(config.key, config.model, systemPrompt, message, history, false);
  } else {
    return generateWithOpenAICompat(config.provider.baseURL, config.key, config.model, systemPrompt, message, history, false);
  }
}

export async function extractEntities(textContent, fileType = 'csv') {
  const config = getLLMConfig();
  if (!config) throw new Error('AI Provider not configured. Please set it in the Admin Profile page.');

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

  let textResponse = '';
  // isJSON = true will trigger structural enforcements natively
  if (config.provider.id === 'gemini') {
    textResponse = await generateWithGemini(config.key, config.model, null, prompt, [], true);
  } else {
    textResponse = await generateWithOpenAICompat(config.provider.baseURL, config.key, config.model, null, prompt, [], true);
  }

  try {
    const text = textResponse.trim();
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[LLM] Extraction failed:', e);
    throw new Error(e.message || 'Failed to parse LLM response into clean JSON structure');
  }
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
