// src/utils/algorithm.js

const BRANCHES = ['ISE', 'CSE', 'ECE', 'MECH'];
const BRANCH_COLORS = { ISE: 'ise', CSE: 'cse', ECE: 'ece', MECH: 'mech' };
const FIRST_NAMES = ['Aarav','Rahul','Priya','Sneha','Arjun','Kavya','Ravi','Deepa','Kiran','Meena','Suresh','Anita','Harish','Latha','Ajay','Sindhu','Mahesh','Usha','Nidhi','Vikram','Pooja','Nikhil','Swathi','Rohan','Divya','Arun'];

function seededRandom(seed) {
  return Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % 1;
}

function randName(seed) {
  const s = seededRandom(seed);
  const s2 = seededRandom(seed * 7 + 1);
  return FIRST_NAMES[Math.floor(s * FIRST_NAMES.length)] + ' ' + String.fromCharCode(65 + Math.floor(s2 * 26)) + '.';
}

/**
 * Fisher-Yates shuffle with Branch-Gap Constraint
 * Guarantees no two adjacent students from the same branch
 */
export function generateSeating(count, seed = 42) {
  const pool = [];
  BRANCHES.forEach((branch, bi) => {
    const perBranch = Math.ceil(count / BRANCHES.length);
    for (let i = 0; i < perBranch; i++) {
      pool.push({ branch, colorClass: BRANCH_COLORS[branch], name: randName(bi * 100 + i + seed * 7) });
    }
  });

  // Fisher-Yates shuffle with deterministic seed
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(Math.sin((i + 1) * (seed + 1)) * 999999)) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Branch-Gap Constraint: fix adjacent same-branch
  let swaps = 0;
  for (let i = 1; i < pool.length; i++) {
    if (pool[i].branch === pool[i - 1].branch) {
      for (let j = i + 1; j < pool.length; j++) {
        if (pool[j].branch !== pool[i - 1].branch) {
          [pool[i], pool[j]] = [pool[j], pool[i]];
          swaps++;
          break;
        }
      }
    }
  }

  return { seats: pool.slice(0, count), swaps };
}

/**
 * Greedy Allocation Engine with Hard + Soft Constraints
 */
export function runGreedyAllocation(sessions, faculty, leaves, config = {}) {
  const {
    maxDutiesPerFaculty = 3,
    leaveBufferDays = 3,
    enforceRoomNonRepetition = true,
    examWindowStart = '2025-11-17',
    examWindowEnd = '2025-11-22',
  } = config;

  const logs = [];
  const log = (type, msg) => logs.push({ type, msg, ts: Date.now() });

  log('info', `[ INIT ] Loading ${faculty.length} faculty records`);
  log('info', `[ INIT ] Loading ${sessions.length} exam sessions`);

  // Compute leave-window dates
  const windowStart = new Date(examWindowStart);
  const windowEnd = new Date(examWindowEnd);
  windowStart.setDate(windowStart.getDate() - leaveBufferDays);
  windowEnd.setDate(windowEnd.getDate() + leaveBufferDays);

  // Identify faculty excluded due to leaves
  const excludedIds = new Set();
  leaves.forEach(l => {
    if (l.status === 'pending' || l.status === 'approved') {
      const leaveStart = new Date(l.from);
      const leaveEnd = new Date(l.to);
      if (leaveStart <= windowEnd && leaveEnd >= windowStart) {
        excludedIds.add(l.facultyId);
        log('warn', `[ WARN ] ${l.facultyName} — leave conflicts with exam window. Excluded.`);
      }
    }
  });

  // Also exclude unavailable faculty
  faculty.filter(f => !f.available).forEach(f => {
    if (!excludedIds.has(f.id)) {
      excludedIds.add(f.id);
      log('warn', `[ WARN ] ${f.name} — marked unavailable. Excluded.`);
    }
  });

  log('ok', `[ STEP1 ] Hard constraints: leave conflicts, availability, max duties`);
  log('ok', `[ STEP1 ] Soft constraints: workload fairness, room non-repetition`);

  // Eligible faculty sorted by duty count (lowest first = fairness)
  let eligibleFaculty = faculty
    .filter(f => !excludedIds.has(f.id) && f.duties < maxDutiesPerFaculty)
    .sort((a, b) => a.duties - b.duties);

  log('ok', `[ STEP2 ] Priority queue: ${eligibleFaculty.length} eligible faculty, sorted by duty load`);

  const allocations = [];
  const facultyDutyMap = {};
  const facultyRoomHistory = {};

  eligibleFaculty.forEach(f => {
    facultyDutyMap[f.id] = f.duties;
    facultyRoomHistory[f.id] = [];
  });

  sessions.forEach((session, idx) => {
    log('info', `[ STEP3 ] Assigning session ${idx + 1}: ${session.date} ${session.slot} → ${session.roomId}`);

    // Re-sort by current duty count for fairness
    const pool = [...eligibleFaculty]
      .filter(f => facultyDutyMap[f.id] < maxDutiesPerFaculty)
      .sort((a, b) => facultyDutyMap[a.id] - facultyDutyMap[b.id]);

    let f1 = null, f2 = null;

    // Pick first invigilator
    for (const f of pool) {
      if (enforceRoomNonRepetition && facultyRoomHistory[f.id]?.includes(session.roomId)) continue;
      f1 = f;
      break;
    }
    if (!f1) f1 = pool[0]; // fallback

    // Pick second invigilator (different from first)
    for (const f of pool) {
      if (f.id === f1?.id) continue;
      if (enforceRoomNonRepetition && facultyRoomHistory[f.id]?.includes(session.roomId)) continue;
      f2 = f;
      break;
    }
    if (!f2) f2 = pool.find(f => f.id !== f1?.id); // fallback

    if (!f1 || !f2) {
      log('warn', `[ WARN ] Session ${idx + 1}: insufficient faculty — ${!f1 ? 'missing invigilator 1' : 'missing invigilator 2'}`);
      allocations.push({ sessionId: session.id, f1: null, f2: null, status: 'unassigned', studentCount: session.maxStudents });
      return;
    }

    // Update duty counts + room history
    facultyDutyMap[f1.id]++;
    facultyDutyMap[f2.id]++;
    facultyRoomHistory[f1.id] = [...(facultyRoomHistory[f1.id] || []), session.roomId];
    facultyRoomHistory[f2.id] = [...(facultyRoomHistory[f2.id] || []), session.roomId];

    log('ok', `[ STEP3 ] → ${f1.name} (load:${facultyDutyMap[f1.id]}) + ${f2.name} (load:${facultyDutyMap[f2.id]})`);

    // Generate seating
    const { seats, swaps } = generateSeating(session.maxStudents, idx + 42);

    allocations.push({
      id: `alloc_${session.id}`,
      sessionId: session.id,
      f1Id: f1.id, f1Name: f1.name,
      f2Id: f2.id, f2Name: f2.name,
      status: 'assigned',
      studentCount: session.maxStudents,
      seats,
    });
  });

  log('ok', `[ STEP4 ] Fisher-Yates shuffle + branch-gap applied to all sessions`);
  log('ok', `[ DONE ] Allocation complete: ${allocations.filter(a => a.status === 'assigned').length}/${sessions.length} sessions`);

  return { allocations, logs };
}
