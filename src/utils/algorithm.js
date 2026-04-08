import { branches, firstNames } from '../lib/dummyData';

export function randName(seed) {
  const s = Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % 1;
  const s2 = Math.abs(Math.sin(seed * 7 + 1) * 233280) % 1;
  return firstNames[Math.floor(s * firstNames.length)] + ' ' + String.fromCharCode(65 + Math.floor(s2 * 26)) + '.';
}

export function generateSeats(count, seed) {
  const pool = [];
  branches.forEach((b, bi) => {
    for (let i = 0; i < Math.ceil(count / 4); i++) {
        pool.push({ branch: b, name: randName(bi * 100 + i + seed * 7) });
    }
  });

  // Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(Math.sin((i + 1) * (seed + 1)) * 999999)) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Fix adjacency (Branch-Gap Constraint)
  for (let i = 1; i < pool.length; i++) {
    if (pool[i].branch === pool[i - 1].branch) {
      for (let j = i + 1; j < pool.length; j++) {
        if (pool[j].branch !== pool[i - 1].branch) { 
            [pool[i], pool[j]] = [pool[j], pool[i]]; 
            break; 
        }
      }
    }
  }
  return pool.slice(0, count);
}

// Emulate Greedy Allocation Logic Delay
export const emulateGreedyAllocation = async (onProgress) => {
  return new Promise((resolve) => {
    let pct = 0;
    const timer = setInterval(() => {
      pct = Math.min(pct + 2, 100);
      onProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        resolve();
      }
    }, 60);
  });
};
