// src/utils/algorithm.js
// Fisher-Yates seating with void-grid support + greedy allocation engine

const BRANCHES = ['ISE', 'CSE', 'ECE', 'MECH'];
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
 * Get active (non-void) coordinates from a seatGrid, preserving spatial order
 */
export function getActiveCoords(seatGrid) {
  if (!seatGrid || !seatGrid.length) return [];
  const coords = [];
  for (let r = 0; r < seatGrid.length; r++) {
    for (let c = 0; c < (seatGrid[r]?.length || 0); c++) {
      const cell = seatGrid[r][c];
      if (cell && cell.state !== 'VOID' && (cell.enabled === undefined || cell.enabled)) {
        coords.push({ row: r, col: c });
      }
    }
  }
  return coords;
}

/**
 * Check if two coordinates are spatially adjacent in the grid
 */
function isAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

/**
 * Fisher-Yates shuffle with Branch-Gap Constraint on a void-aware grid
 * @param {number|object[]} countOrGrid - Either a count or seatGrid array
 * @param {number} seed - Deterministic seed
 * @returns {{ seats: object[], activeCoords: object[] }}
 */
export function generateSeating(countOrGrid, seed = 42) {
  let activeCoords;
  let count;

  if (Array.isArray(countOrGrid) && Array.isArray(countOrGrid[0])) {
    // seatGrid passed
    activeCoords = getActiveCoords(countOrGrid);
    count = activeCoords.length;
  } else {
    count = typeof countOrGrid === 'number' ? countOrGrid : 40;
    activeCoords = Array.from({ length: count }, (_, i) => ({ row: Math.floor(i / 7), col: i % 7 }));
  }

  // Generate student pool across branches
  const pool = [];
  BRANCHES.forEach((branch, bi) => {
    const perBranch = Math.ceil(count / BRANCHES.length);
    for (let i = 0; i < perBranch && pool.length < count; i++) {
      pool.push({ branch, name: randName(bi * 100 + i + seed * 7) });
    }
  });

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(Math.sin((i + 1) * (seed + 1)) * 999999)) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Branch-Gap: fix adjacent same-branch (using spatial adjacency from grid)
  let swaps = 0;
  for (let i = 1; i < pool.length && i < activeCoords.length; i++) {
    if (pool[i].branch === pool[i - 1].branch && isAdjacent(activeCoords[i], activeCoords[i - 1])) {
      for (let j = i + 2; j < pool.length; j++) {
        if (pool[j].branch !== pool[i].branch) {
          [pool[i], pool[j]] = [pool[j], pool[i]];
          swaps++;
          break;
        }
      }
    }
  }

  // Map to coordinates
  const seats = pool.slice(0, count).map((student, idx) => ({
    ...student,
    row: activeCoords[idx]?.row,
    col: activeCoords[idx]?.col,
    seatIndex: idx,
  }));

  return { seats, activeCoords, swaps };
}

/**
 * Greedy allocation engine with hard/soft constraints
 */
export function runGreedyAllocation(sessions, faculty, leaves, config = {}) {
  const { maxDutiesPerFaculty = 3, leaveBufferDays = 3, enforceRoomNonRepetition = true } = config;
  const logs = [];
  const dutyCounts = {};
  const roomHistory = {};

  faculty.forEach(f => { dutyCounts[f.id] = f.duties || 0; roomHistory[f.id] = []; });

  const isOnLeave = (facultyId, sessionDate) => {
    const sd = new Date(sessionDate);
    return (leaves || []).some(l => {
      if (l.facultyId !== facultyId || l.status === 'rejected') return false;
      const from = new Date(l.from);
      const to = new Date(l.to);
      from.setDate(from.getDate() - leaveBufferDays);
      to.setDate(to.getDate() + leaveBufferDays);
      return sd >= from && sd <= to;
    });
  };

  const allocations = sessions.map(session => {
    logs.push({ type: 'info', msg: `▶ Session: ${session.subject} (${session.date} ${session.slot})` });

    const eligible = faculty
      .filter(f => {
        if (!f.available) { logs.push({ type: 'warn', msg: `  ✗ ${f.name}: unavailable` }); return false; }
        if (isOnLeave(f.id, session.date)) { logs.push({ type: 'warn', msg: `  ✗ ${f.name}: on leave` }); return false; }
        if ((dutyCounts[f.id] || 0) >= maxDutiesPerFaculty) { logs.push({ type: 'warn', msg: `  ✗ ${f.name}: max duties reached` }); return false; }
        return true;
      })
      .sort((a, b) => (dutyCounts[a.id] || 0) - (dutyCounts[b.id] || 0));

    let f1 = null, f2 = null;

    // Pick f1 (prefer someone who hasn't done this room)
    for (const f of eligible) {
      if (!enforceRoomNonRepetition || !roomHistory[f.id]?.includes(session.roomId)) {
        f1 = f; break;
      }
    }
    if (!f1 && eligible.length > 0) f1 = eligible[0]; // fallback

    // Pick f2 (different from f1)
    if (f1) {
      const remaining = eligible.filter(f => f.id !== f1.id);
      for (const f of remaining) {
        if (!enforceRoomNonRepetition || !roomHistory[f.id]?.includes(session.roomId)) {
          f2 = f; break;
        }
      }
      if (!f2 && remaining.length > 0) f2 = remaining[0];
    }

    if (f1) { dutyCounts[f1.id] = (dutyCounts[f1.id] || 0) + 1; roomHistory[f1.id]?.push(session.roomId); }
    if (f2) { dutyCounts[f2.id] = (dutyCounts[f2.id] || 0) + 1; roomHistory[f2.id]?.push(session.roomId); }

    const status = f1 && f2 ? 'assigned' : 'unassigned';
    logs.push({ type: status === 'assigned' ? 'ok' : 'warn',
      msg: `  → ${f1?.name || 'NONE'} + ${f2?.name || 'NONE'} [${status}]` });

    return {
      id: `alloc_${session.id}`,
      sessionId: session.id,
      eventId: session.eventId,
      f1Id: f1?.id, f1Name: f1?.name,
      f2Id: f2?.id, f2Name: f2?.name,
      studentCount: session.maxStudents,
      status,
    };
  });

  const assigned = allocations.filter(a => a.status === 'assigned').length;
  logs.push({ type: 'ok', msg: `\n✓ Complete: ${assigned}/${sessions.length} sessions allocated` });

  return { allocations, logs };
}
