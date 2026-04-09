// src/context/AppContext.jsx
// Global state: localStorage in demo mode, Firestore-ready architecture
import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ─── Demo seed data ─────────────────────────────────────────────────
const seedFaculty = [
  { id: 'f1', name: 'Prof. Ramesh Kumar', desg: 'Professor', email: 'ramesh@dsce.edu', employeeId: 'EMP001', duties: 2, available: true },
  { id: 'f2', name: 'Prof. Anita Sharma', desg: 'Assoc. Professor', email: 'anita@dsce.edu', employeeId: 'EMP002', duties: 3, available: true },
  { id: 'f3', name: 'Prof. Suresh Nair', desg: 'Asst. Professor', email: 'suresh@dsce.edu', employeeId: 'EMP003', duties: 1, available: true },
  { id: 'f4', name: 'Prof. Meena Rao', desg: 'Asst. Professor', email: 'meena@dsce.edu', employeeId: 'EMP004', duties: 2, available: false },
  { id: 'f5', name: 'Prof. Kiran Bhat', desg: 'Professor', email: 'kiran@dsce.edu', employeeId: 'EMP005', duties: 0, available: true },
  { id: 'f6', name: 'Prof. Priya Dev', desg: 'Asst. Professor', email: 'priya@dsce.edu', employeeId: 'EMP006', duties: 1, available: true },
  { id: 'f7', name: 'Prof. Yogesh BS', desg: 'Asst. Professor', email: 'yogesh@dsce.edu', employeeId: 'EMP007', duties: 2, available: true },
  { id: 'f8', name: 'Prof. Kavitha M', desg: 'Assoc. Professor', email: 'kavitha@dsce.edu', employeeId: 'EMP008', duties: 3, available: false },
  { id: 'f9', name: 'Prof. Ravi S', desg: 'Asst. Professor', email: 'ravi@dsce.edu', employeeId: 'EMP009', duties: 1, available: true },
  { id: 'f10', name: 'Prof. Deepa J', desg: 'Professor', email: 'deepa@dsce.edu', employeeId: 'EMP010', duties: 2, available: true },
  { id: 'f11', name: 'Prof. Arjun T', desg: 'Asst. Professor', email: 'arjun@dsce.edu', employeeId: 'EMP011', duties: 0, available: true },
  { id: 'f12', name: 'Prof. Sindhu K', desg: 'Assoc. Professor', email: 'sindhu@dsce.edu', employeeId: 'EMP012', duties: 1, available: true },
  { id: 'f13', name: 'Prof. Mahesh V', desg: 'Asst. Professor', email: 'mahesh@dsce.edu', employeeId: 'EMP013', duties: 2, available: true },
  { id: 'f14', name: 'Prof. Usha P', desg: 'Professor', email: 'usha@dsce.edu', employeeId: 'EMP014', duties: 3, available: true },
  { id: 'f15', name: 'Prof. Ajay L', desg: 'Asst. Professor', email: 'ajay@dsce.edu', employeeId: 'EMP015', duties: 1, available: false },
  { id: 'f16', name: 'Prof. Sneha R', desg: 'Asst. Professor', email: 'sneha@dsce.edu', employeeId: 'EMP016', duties: 0, available: true },
  { id: 'f17', name: 'Prof. Harish N', desg: 'Assoc. Professor', email: 'harish@dsce.edu', employeeId: 'EMP017', duties: 2, available: true },
  { id: 'f18', name: 'Prof. Latha S', desg: 'Professor', email: 'latha@dsce.edu', employeeId: 'EMP018', duties: 1, available: true },
];

const makeSeatGrid = (rows, cols, capacity) =>
  Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ row: r, col: c, state: r * cols + c < capacity ? 'ACTIVE' : 'VOID' }))
  );

const seedRooms = [
  { id: 'r1', name: 'Room A101', building: 'Block A', rows: 6, cols: 7, capacity: 40, seatGrid: makeSeatGrid(6, 7, 40) },
  { id: 'r2', name: 'Room A102', building: 'Block A', rows: 6, cols: 7, capacity: 42, seatGrid: makeSeatGrid(6, 7, 42) },
  { id: 'r3', name: 'Room B201', building: 'Block B', rows: 6, cols: 7, capacity: 38, seatGrid: makeSeatGrid(6, 7, 38) },
  { id: 'r4', name: 'Room B202', building: 'Block B', rows: 5, cols: 8, capacity: 36, seatGrid: makeSeatGrid(5, 8, 36) },
];

const seedExamEvents = [
  { id: 'ev1', name: 'CIE-2 AY 2025-26', type: 'CIE', year: '2025-26', status: 'draft', createdAt: new Date().toISOString() },
];

const seedSessions = [
  { id: 's1', eventId: 'ev1', date: '2025-11-17', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'Data Structures', roomId: 'r1', maxStudents: 40, status: 'scheduled' },
  { id: 's2', eventId: 'ev1', date: '2025-11-17', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'DBMS', roomId: 'r2', maxStudents: 42, status: 'scheduled' },
  { id: 's3', eventId: 'ev1', date: '2025-11-18', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'Computer Networks', roomId: 'r3', maxStudents: 38, status: 'scheduled' },
  { id: 's4', eventId: 'ev1', date: '2025-11-18', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'OS', roomId: 'r4', maxStudents: 36, status: 'scheduled' },
  { id: 's5', eventId: 'ev1', date: '2025-11-19', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'TOC', roomId: 'r1', maxStudents: 40, status: 'scheduled' },
  { id: 's6', eventId: 'ev1', date: '2025-11-19', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'DAA', roomId: 'r2', maxStudents: 42, status: 'scheduled' },
  { id: 's7', eventId: 'ev1', date: '2025-11-20', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'Microprocessors', roomId: 'r3', maxStudents: 38, status: 'scheduled' },
  { id: 's8', eventId: 'ev1', date: '2025-11-20', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'Elective I', roomId: 'r4', maxStudents: 36, status: 'scheduled' },
];

const seedLeaves = [
  { id: 'l1', facultyId: 'f4', facultyName: 'Prof. Meena Rao', from: '2025-11-15', to: '2025-11-17', reason: 'Medical', status: 'pending' },
  { id: 'l2', facultyId: 'f8', facultyName: 'Prof. Kavitha M', from: '2025-11-18', to: '2025-11-19', reason: 'Personal', status: 'pending' },
];

// ─── Reducer ────────────────────────────────────────────────────────
function load(key, fallback) {
  try { const d = localStorage.getItem(`pf_${key}`); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}

function appReducer(state, action) {
  switch (action.type) {
    // Faculty
    case 'SET_FACULTY': return { ...state, faculty: action.payload };
    case 'ADD_FACULTY': return { ...state, faculty: [...state.faculty, action.payload] };
    case 'UPDATE_FACULTY': return { ...state, faculty: state.faculty.map(f => f.id === action.payload.id ? { ...f, ...action.payload } : f) };
    case 'DELETE_FACULTY': return { ...state, faculty: state.faculty.filter(f => f.id !== action.payload) };
    case 'TOGGLE_FACULTY_AVAILABILITY': return { ...state, faculty: state.faculty.map(f => f.id === action.payload ? { ...f, available: !f.available } : f) };

    // Rooms
    case 'SET_ROOMS': return { ...state, rooms: action.payload };
    case 'ADD_ROOM': return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM': return { ...state, rooms: state.rooms.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r) };
    case 'DELETE_ROOM': return { ...state, rooms: state.rooms.filter(r => r.id !== action.payload) };

    // Exam Events
    case 'SET_EXAM_EVENTS': return { ...state, examEvents: action.payload };
    case 'ADD_EXAM_EVENT': return { ...state, examEvents: [...state.examEvents, action.payload] };
    case 'UPDATE_EXAM_EVENT': return { ...state, examEvents: state.examEvents.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e) };
    case 'DELETE_EXAM_EVENT': return { ...state, examEvents: state.examEvents.filter(e => e.id !== action.payload) };

    // Sessions
    case 'SET_SESSIONS': return { ...state, sessions: action.payload };
    case 'ADD_SESSION': return { ...state, sessions: [...state.sessions, action.payload] };
    case 'UPDATE_SESSION': return { ...state, sessions: state.sessions.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) };
    case 'DELETE_SESSION': return { ...state, sessions: state.sessions.filter(s => s.id !== action.payload) };

    // Allocations
    case 'SET_ALLOCATIONS': return { ...state, allocations: action.payload };
    case 'CLEAR_ALLOCATIONS': return { ...state, allocations: [] };

    // Leaves
    case 'SET_LEAVES': return { ...state, leaves: action.payload };
    case 'ADD_LEAVE': return { ...state, leaves: [...state.leaves, action.payload] };
    case 'UPDATE_LEAVE': return { ...state, leaves: state.leaves.map(l => l.id === action.payload.id ? { ...l, ...action.payload } : l) };
    case 'DELETE_LEAVE': return { ...state, leaves: state.leaves.filter(l => l.id !== action.payload) };

    // Students (RAG-imported)
    case 'SET_STUDENTS': return { ...state, students: action.payload };
    case 'ADD_STUDENTS_BATCH': return { ...state, students: [...state.students, ...action.payload] };

    // Bulk RAG import
    case 'RAG_IMPORT': {
      const s = { ...state };
      if (action.payload.faculty?.length) s.faculty = [...s.faculty, ...action.payload.faculty];
      if (action.payload.students?.length) s.students = [...s.students, ...action.payload.students];
      if (action.payload.timetable?.length) {
        const newSessions = action.payload.timetable.map((t, i) => ({
          id: `rag_s${Date.now()}_${i}`,
          eventId: action.payload.eventId || state.examEvents[0]?.id,
          ...t,
          maxStudents: 40,
          status: 'scheduled',
        }));
        s.sessions = [...s.sessions, ...newSessions];
      }
      return s;
    }

    default: return state;
  }
}

const initialState = {
  faculty: load('faculty', seedFaculty),
  rooms: load('rooms', seedRooms),
  examEvents: load('examEvents', seedExamEvents),
  sessions: load('sessions', seedSessions),
  allocations: load('allocations', []),
  leaves: load('leaves', seedLeaves),
  students: load('students', []),
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    const keys = ['faculty', 'rooms', 'examEvents', 'sessions', 'allocations', 'leaves', 'students'];
    keys.forEach(k => {
      try { localStorage.setItem(`pf_${k}`, JSON.stringify(state[k])); } catch {}
    });
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
