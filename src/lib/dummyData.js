export const facultyData = [
  { id: 1, name: 'Prof. Ramesh Kumar', desg: 'Professor', duties: 2, available: true },
  { id: 2, name: 'Prof. Anita Sharma', desg: 'Assoc. Professor', duties: 3, available: true },
  { id: 3, name: 'Prof. Suresh Nair', desg: 'Asst. Professor', duties: 1, available: true },
  { id: 4, name: 'Prof. Meena Rao', desg: 'Asst. Professor', duties: 2, available: false },
  { id: 5, name: 'Prof. Kiran Bhat', desg: 'Professor', duties: 0, available: true },
  { id: 6, name: 'Prof. Priya Dev', desg: 'Asst. Professor', duties: 1, available: true },
  { id: 7, name: 'Prof. Yogesh BS', desg: 'Asst. Professor', duties: 2, available: true },
  { id: 8, name: 'Prof. Kavitha M', desg: 'Assoc. Professor', duties: 3, available: false },
  { id: 9, name: 'Prof. Ravi S', desg: 'Asst. Professor', duties: 1, available: true },
  { id: 10, name: 'Prof. Deepa J', desg: 'Professor', duties: 2, available: true },
  { id: 11, name: 'Prof. Arjun T', desg: 'Asst. Professor', duties: 0, available: true },
  { id: 12, name: 'Prof. Sindhu K', desg: 'Assoc. Professor', duties: 1, available: true },
  { id: 13, name: 'Prof. Mahesh V', desg: 'Asst. Professor', duties: 2, available: true },
  { id: 14, name: 'Prof. Usha P', desg: 'Professor', duties: 3, available: true },
  { id: 15, name: 'Prof. Ajay L', desg: 'Asst. Professor', duties: 1, available: false },
  { id: 16, name: 'Prof. Sneha R', desg: 'Asst. Professor', duties: 0, available: true },
  { id: 17, name: 'Prof. Harish N', desg: 'Assoc. Professor', duties: 2, available: true },
  { id: 18, name: 'Prof. Latha S', desg: 'Professor', duties: 1, available: true },
];

export const scheduleData = [
  { id: 1, date: '17 Nov', slot: 'FN 9:30', subject: 'Data Structures', room: 'A101' },
  { id: 2, date: '17 Nov', slot: 'AN 1:30', subject: 'DBMS', room: 'A102' },
  { id: 3, date: '18 Nov', slot: 'FN 9:30', subject: 'Computer Networks', room: 'B201' },
  { id: 4, date: '18 Nov', slot: 'AN 1:30', subject: 'OS', room: 'B202' },
  { id: 5, date: '19 Nov', slot: 'FN 9:30', subject: 'TOC', room: 'A101' },
  { id: 6, date: '19 Nov', slot: 'AN 1:30', subject: 'DAA', room: 'A102' },
  { id: 7, date: '20 Nov', slot: 'FN 9:30', subject: 'Microprocessors', room: 'B201' },
  { id: 8, date: '20 Nov', slot: 'AN 1:30', subject: 'Elective I', room: 'B202' },
];

export const leavesData = [
  { id: 1, name: 'Prof. Meena Rao', desg: 'Asst. Professor', from: 'Nov 15', to: 'Nov 17', reason: 'Medical', status: 'conflict' },
  { id: 2, name: 'Prof. Kavitha M', desg: 'Assoc. Professor', from: 'Nov 18', to: 'Nov 19', reason: 'Personal', status: 'conflict' },
  { id: 3, name: 'Prof. Ajay L', desg: 'Asst. Professor', from: 'Nov 22', to: 'Nov 23', reason: 'Conference', status: 'conflict' },
  { id: 4, name: 'Prof. Ravi S', desg: 'Asst. Professor', from: 'Nov 27', to: 'Nov 28', reason: 'Family', status: 'approved' },
  { id: 5, name: 'Prof. Sneha R', desg: 'Asst. Professor', from: 'Nov 30', to: 'Dec 1', reason: 'Personal', status: 'approved' },
];

export const initialLogs = [
  ['info', '[ INIT ] Loading faculty dataset: 18 records'],
  ['info', '[ INIT ] Loading exam schedule: 8 sessions'],
  ['warn', '[ WARN ] Prof. Meena Rao — leave conflicts with exam window. Excluded.'],
  ['warn', '[ WARN ] Prof. Kavitha M — leave conflicts with exam window. Excluded.'],
  ['warn', '[ WARN ] Prof. Ajay L — leave conflicts with exam window. Excluded.'],
  ['ok', '[ STEP1 ] Hard constraints: leave, room capacity, timetable clashes'],
  ['ok', '[ STEP1 ] Soft constraints: workload fairness, room non-repetition'],
  ['ok', '[ STEP2 ] Priority queue initialized — 15 eligible faculty, sorted by load factor'],
  ['info', '[ STEP3 ] Assigning session 1: Nov 17 FN → A101'],
  ['ok', '[ STEP3 ] → Assigned: Prof. Ramesh Kumar (load:2) + Prof. Suresh Nair (load:1)'],
  ['info', '[ STEP3 ] Assigning session 2: Nov 17 AN → A102'],
  ['ok', '[ STEP3 ] → Assigned: Prof. Anita Sharma + Prof. Priya Dev'],
  ['info', '[ STEP3 ] Assigning sessions 3–8...'],
  ['ok', '[ STEP3 ] All 8 sessions assigned. No backtracking required.'],
  ['ok', '[ STEP4 ] Fisher-Yates shuffle with gap constraint applied to 312 students'],
  ['ok', '[ STEP4 ] Adjacency check: 0 same-branch neighbors detected'],
  ['ok', '[ DONE ] Allocation complete. Duty chart ready for export.'],
];

export const branches = ['ise', 'cse', 'ece', 'mech'];
export const branchNames = { ise: 'ISE', cse: 'CSE', ece: 'ECE', mech: 'MECH' };
export const firstNames = ['Aarav', 'Rahul', 'Priya', 'Sneha', 'Arjun', 'Kavya', 'Ravi', 'Deepa', 'Kiran', 'Meena', 'Suresh', 'Anita', 'Harish', 'Latha', 'Ajay', 'Sindhu', 'Mahesh', 'Usha', 'Nidhi', 'Vikram', 'Pooja', 'Nikhil', 'Swathi', 'Rohan', 'Divya', 'Arun'];

export const roomConfigs = {
  'A101': { id: 'A101', name: 'Room A101', meta: '40 seats · Nov 17 FN · Data Structures · Invigilators: Prof. Ramesh Kumar, Prof. Suresh Nair', count: 40 },
  'A102': { id: 'A102', name: 'Room A102', meta: '42 seats · Nov 17 AN · DBMS · Invigilators: Prof. Anita Sharma, Prof. Priya Dev', count: 42 },
  'B201': { id: 'B201', name: 'Room B201', meta: '38 seats · Nov 18 FN · Computer Networks · Invigilators: Prof. Kiran Bhat, Prof. Yogesh BS', count: 38 },
  'B202': { id: 'B202', name: 'Room B202', meta: '36 seats · Nov 18 AN · OS · Invigilators: Prof. Ravi S, Prof. Deepa J', count: 36 },
};
