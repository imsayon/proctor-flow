// src/context/AppContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';

// ─── Initial Demo Data ───────────────────────────────────────────────
const initialFaculty = [
  { id: 'f1', name: 'Prof. Ramesh Kumar', desg: 'Professor', email: 'ramesh@dsce.edu', duties: 2, available: true },
  { id: 'f2', name: 'Prof. Anita Sharma', desg: 'Assoc. Professor', email: 'anita@dsce.edu', duties: 3, available: true },
  { id: 'f3', name: 'Prof. Suresh Nair', desg: 'Asst. Professor', email: 'suresh@dsce.edu', duties: 1, available: true },
  { id: 'f4', name: 'Prof. Meena Rao', desg: 'Asst. Professor', email: 'meena@dsce.edu', duties: 2, available: false },
  { id: 'f5', name: 'Prof. Kiran Bhat', desg: 'Professor', email: 'kiran@dsce.edu', duties: 0, available: true },
  { id: 'f6', name: 'Prof. Priya Dev', desg: 'Asst. Professor', email: 'priya@dsce.edu', duties: 1, available: true },
  { id: 'f7', name: 'Prof. Yogesh BS', desg: 'Asst. Professor', email: 'yogesh@dsce.edu', duties: 2, available: true },
  { id: 'f8', name: 'Prof. Kavitha M', desg: 'Assoc. Professor', email: 'kavitha@dsce.edu', duties: 3, available: false },
  { id: 'f9', name: 'Prof. Ravi S', desg: 'Asst. Professor', email: 'ravi@dsce.edu', duties: 1, available: true },
  { id: 'f10', name: 'Prof. Deepa J', desg: 'Professor', email: 'deepa@dsce.edu', duties: 2, available: true },
  { id: 'f11', name: 'Prof. Arjun T', desg: 'Asst. Professor', email: 'arjun@dsce.edu', duties: 0, available: true },
  { id: 'f12', name: 'Prof. Sindhu K', desg: 'Assoc. Professor', email: 'sindhu@dsce.edu', duties: 1, available: true },
  { id: 'f13', name: 'Prof. Mahesh V', desg: 'Asst. Professor', email: 'mahesh@dsce.edu', duties: 2, available: true },
  { id: 'f14', name: 'Prof. Usha P', desg: 'Professor', email: 'usha@dsce.edu', duties: 3, available: true },
  { id: 'f15', name: 'Prof. Ajay L', desg: 'Asst. Professor', email: 'ajay@dsce.edu', duties: 1, available: false },
  { id: 'f16', name: 'Prof. Sneha R', desg: 'Asst. Professor', email: 'sneha@dsce.edu', duties: 0, available: true },
  { id: 'f17', name: 'Prof. Harish N', desg: 'Assoc. Professor', email: 'harish@dsce.edu', duties: 2, available: true },
  { id: 'f18', name: 'Prof. Latha S', desg: 'Professor', email: 'latha@dsce.edu', duties: 1, available: true },
];

const initialRooms = [
  { id: 'r1', name: 'Room A101', building: 'Block A', rows: 6, cols: 7, capacity: 40,
    benchLayout: Array.from({ length: 6 }, (_, r) => Array.from({ length: 7 }, (_, c) => ({ row: r, col: c, enabled: r * 7 + c < 40 }))) },
  { id: 'r2', name: 'Room A102', building: 'Block A', rows: 6, cols: 7, capacity: 42,
    benchLayout: Array.from({ length: 6 }, (_, r) => Array.from({ length: 7 }, (_, c) => ({ row: r, col: c, enabled: true }))) },
  { id: 'r3', name: 'Room B201', building: 'Block B', rows: 6, cols: 7, capacity: 38,
    benchLayout: Array.from({ length: 6 }, (_, r) => Array.from({ length: 7 }, (_, c) => ({ row: r, col: c, enabled: r * 7 + c < 38 }))) },
  { id: 'r4', name: 'Room B202', building: 'Block B', rows: 5, cols: 8, capacity: 36,
    benchLayout: Array.from({ length: 5 }, (_, r) => Array.from({ length: 8 }, (_, c) => ({ row: r, col: c, enabled: r * 8 + c < 36 }))) },
];

const initialSessions = [
  { id: 's1', date: '2025-11-17', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'Data Structures', roomId: 'r1', maxStudents: 40, status: 'scheduled' },
  { id: 's2', date: '2025-11-17', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'DBMS', roomId: 'r2', maxStudents: 42, status: 'scheduled' },
  { id: 's3', date: '2025-11-18', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'Computer Networks', roomId: 'r3', maxStudents: 38, status: 'scheduled' },
  { id: 's4', date: '2025-11-18', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'OS', roomId: 'r4', maxStudents: 36, status: 'scheduled' },
  { id: 's5', date: '2025-11-19', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'TOC', roomId: 'r1', maxStudents: 40, status: 'scheduled' },
  { id: 's6', date: '2025-11-19', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'DAA', roomId: 'r2', maxStudents: 42, status: 'scheduled' },
  { id: 's7', date: '2025-11-20', slot: 'FN', startTime: '09:30', endTime: '12:30', subject: 'Microprocessors', roomId: 'r3', maxStudents: 38, status: 'scheduled' },
  { id: 's8', date: '2025-11-20', slot: 'AN', startTime: '13:30', endTime: '16:30', subject: 'Elective I', roomId: 'r4', maxStudents: 36, status: 'scheduled' },
];

const initialLeaves = [
  { id: 'l1', facultyId: 'f4', facultyName: 'Prof. Meena Rao', from: '2025-11-15', to: '2025-11-17', reason: 'Medical', status: 'pending' },
  { id: 'l2', facultyId: 'f8', facultyName: 'Prof. Kavitha M', from: '2025-11-18', to: '2025-11-19', reason: 'Personal', status: 'pending' },
  { id: 'l3', facultyId: 'f15', facultyName: 'Prof. Ajay L', from: '2025-11-22', to: '2025-11-23', reason: 'Conference', status: 'pending' },
  { id: 'l4', facultyId: 'f9', facultyName: 'Prof. Ravi S', from: '2025-11-27', to: '2025-11-28', reason: 'Family', status: 'approved' },
  { id: 'l5', facultyId: 'f16', facultyName: 'Prof. Sneha R', from: '2025-11-30', to: '2025-12-01', reason: 'Personal', status: 'approved' },
];

const initialAllocations = [];

export const EXAM_WINDOW = { start: '2025-11-17', end: '2025-11-22', buffer: 3 };

// ─── Reducer ─────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    // Faculty
    case 'ADD_FACULTY':
      return { ...state, faculty: [...state.faculty, action.payload] };
    case 'UPDATE_FACULTY':
      return { ...state, faculty: state.faculty.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'DELETE_FACULTY':
      return { ...state, faculty: state.faculty.filter(f => f.id !== action.payload) };
    case 'TOGGLE_FACULTY_AVAILABILITY':
      return { ...state, faculty: state.faculty.map(f => f.id === action.payload ? { ...f, available: !f.available } : f) };

    // Rooms
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return { ...state, rooms: state.rooms.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'DELETE_ROOM':
      return { ...state, rooms: state.rooms.filter(r => r.id !== action.payload) };

    // Sessions
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'UPDATE_SESSION':
      return { ...state, sessions: state.sessions.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SESSION':
      return { ...state, sessions: state.sessions.filter(s => s.id !== action.payload) };

    // Leaves
    case 'ADD_LEAVE':
      return { ...state, leaves: [...state.leaves, action.payload] };
    case 'UPDATE_LEAVE_STATUS':
      return {
        ...state,
        leaves: state.leaves.map(l => l.id === action.payload.id ? { ...l, status: action.payload.status } : l),
        faculty: action.payload.status === 'approved'
          ? state.faculty.map(f => f.id === action.payload.facultyId ? { ...f, available: false } : f)
          : state.faculty
      };

    // Allocations
    case 'SET_ALLOCATIONS':
      return { ...state, allocations: action.payload };
    case 'CLEAR_ALLOCATIONS':
      return { ...state, allocations: [] };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────
const AppContext = createContext();

const STORAGE_KEY = 'proctorflow_state';

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      faculty: initialFaculty,
      rooms: initialRooms,
      sessions: initialSessions,
      leaves: initialLeaves,
      allocations: initialAllocations,
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
