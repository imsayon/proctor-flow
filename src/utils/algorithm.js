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
  const {
    maxDutiesPerFaculty = 3, leaveBufferDays = 3,
    enforceRoomNonRepetition = true, rooms = [],
  } = config;
  const logs = [];
  const dutyCounts = new Map(faculty.map(f => [f.id, Number(f.duties) || 0]));
  const roomHistory = new Map(faculty.map(f => [f.id, new Set()]));
  const assignedSessions = new Map(faculty.map(f => [f.id, []]));
  const committedRooms = [];
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  const minutes = v => {
    if (!v || !/^\d\d:\d\d$/.test(v)) return null;
    const [hh,mm] = v.split(":").map(Number);
    return hh * 60 + mm;
  };
  const overlaps = (a,b) => {
    if (a.date !== b.date) return false;
    const aStart=minutes(a.startTime), aEnd=minutes(a.endTime);
    const bStart=minutes(b.startTime), bEnd=minutes(b.endTime);
    if ([aStart,aEnd,bStart,bEnd].every(Number.isFinite))
      return aStart < bEnd && bStart < aEnd;
    return a.slot === b.slot;
  };
  const isOnLeave = (facultyId, date) => {
    const when=Date.parse(date+"T12:00:00Z");
    return (leaves || []).some(l => {
      if (l.facultyId !== facultyId || l.status === "rejected") return false;
      const from=Date.parse(l.from+"T12:00:00Z");
      const to=Date.parse(l.to+"T12:00:00Z");
      return Number.isFinite(when) && when>=from-leaveBufferDays*86400000
        && when<=to+leaveBufferDays*86400000;
    });
  };
  const isEligible = (f,s) =>
    f.available !== false &&
    !isOnLeave(f.id,s.date) &&
    (dutyCounts.get(f.id) || 0) < maxDutiesPerFaculty &&
    !(assignedSessions.get(f.id) || []).some(previous=>overlaps(s,previous));
  const ranked = (a,b,s) => {
    const load=(dutyCounts.get(a.id)||0)-(dutyCounts.get(b.id)||0);
    if (load!==0) return load;
    if (enforceRoomNonRepetition) {
      const aUsed=roomHistory.get(a.id).has(s.roomId)?1:0;
      const bUsed=roomHistory.get(b.id).has(s.roomId)?1:0;
      if (aUsed!==bUsed) return aUsed-bUsed;
    }
    return String(a.id).localeCompare(String(b.id));
  };
  const ordered = [...sessions].sort((a,b)=>
    String(a.date).localeCompare(String(b.date)) ||
    String(a.startTime||a.slot).localeCompare(String(b.startTime||b.slot)) ||
    String(a.id).localeCompare(String(b.id)));
  const bySession = new Map();
  for (const session of ordered) {
    const reasons=[];
    const room=roomMap.get(session.roomId);
    if (room && Number(session.maxStudents||0)>Number(room.capacity||0))
      reasons.push("Student count exceeds room capacity");
    if (committedRooms.some(other=>other.roomId===session.roomId && overlaps(other,session)))
      reasons.push("Room already occupied during this session");
    const candidates=faculty.filter(f=>isEligible(f,session)).sort((a,b)=>ranked(a,b,session));
    if (candidates.length<2) reasons.push("Fewer than two eligible invigilators");
    let [first,second]=reasons.length ? [null,null] : candidates;
    if (first && second) {
      for (const f of [first,second]) {
        dutyCounts.set(f.id,(dutyCounts.get(f.id)||0)+1);
        roomHistory.get(f.id).add(session.roomId);
        assignedSessions.get(f.id).push(session);
      }
      committedRooms.push(session);
    }
    const status=first&&second?"assigned":"unassigned";
    const explanation=reasons.join("; ") || "Eligible faculty selected by workload";
    logs.push({type:status==="assigned"?"ok":"warn",msg:session.subject+" ("+session.date+" "+session.slot+"): "+status+" — "+explanation});
    bySession.set(session.id,{
      id:"alloc_"+session.id,sessionId:session.id,eventId:session.eventId,
      f1Id:first?.id||null,f1Name:first?.name||null,
      f2Id:second?.id||null,f2Name:second?.name||null,
      studentCount:session.maxStudents,status,reason:reasons.join("; ")||null,
    });
  }
  const allocations=sessions.map(s=>bySession.get(s.id));
  const assigned=allocations.filter(a=>a.status==="assigned").length;
  logs.push({type:"info",msg:"Allocation complete: "+assigned+"/"+sessions.length+" sessions assigned"});
  return {allocations,logs};
}

/**
 * Allocate real, enrolled student records into actual active seats.
 * Student profiles must have unique uid and a sessionIds array.
 * The function never invents identities or silently overbooks a room.
 */
export function allocateEnrolledStudents(students, seatGrid, seed = 42) {
  const coords=getActiveCoords(seatGrid);
  if (students.length>coords.length) throw new Error("Not enough active seats");
  const seen=new Set();
  for (const student of students) {
    if (!student.uid || seen.has(student.uid)) throw new Error("Each student needs a unique Firebase UID");
    seen.add(student.uid);
  }
  // Stable seeded shuffle of real student identities.
  const pool=[...students].sort((a,b)=>String(a.uid).localeCompare(String(b.uid)));
  let x=(Number(seed)>>>0)||1;
  const next=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};
  for(let i=pool.length-1;i>0;i--) {
    const j=Math.floor(next()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  // Prefer different branches at spatially adjacent active coordinates.
  for(let i=1;i<pool.length;i++) {
    const prior=Array.from({length:i},(_,n)=>n)
      .filter(k=>isAdjacent(coords[k],coords[i]));
    if (!prior.some(k=>pool[k].branch===pool[i].branch)) continue;
    const replacement=pool.findIndex((s,j)=>j>i &&
      prior.every(k=>pool[k].branch!==s.branch));
    if (replacement>i) [pool[i],pool[replacement]]=[pool[replacement],pool[i]];
  }
  return pool.map((student,index)=>({
    uid:student.uid,studentId:student.id||student.uid,
    name:student.name,branch:student.branch,
    seatNumber:index+1,row:coords[index].row+1,col:coords[index].col+1,
  }));
}
