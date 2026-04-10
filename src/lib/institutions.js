import {
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { institutionsCol } from './firestore';

export async function listInstitutionsIN({ max = 50 } = {}) {
  const q = query(
    institutionsCol(),
    where('country', '==', 'IN'),
    orderBy('name'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(i => i.active !== false);
}

export async function searchInstitutionsIN(term, { max = 20 } = {}) {
  const t = String(term || '').trim().toLowerCase();
  const initial = await listInstitutionsIN({ max: Math.max(max, 50) });
  if (!t) return initial.slice(0, max);
  return initial
    .filter(i => (i.name || '').toLowerCase().includes(t) || (i.aliases || []).some(a => String(a).toLowerCase().includes(t)))
    .slice(0, max);
}

export function emailDomain(email) {
  return String(email || '').split('@')[1]?.toLowerCase() || '';
}

