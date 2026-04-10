import {
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { institutionsCol } from './firestore';
import seedIN from '../data/institutions_in_seed.json';

function normalizeInstitution(i) {
  return {
    id: i.id,
    name: i.name,
    aliases: i.aliases || [],
    domains: i.domains || [],
    country: i.country || 'IN',
    active: i.active !== false,
    hasAdmin: Boolean(i.hasAdmin),
  };
}

function filterSearch(list, term, max) {
  const t = String(term || '').trim().toLowerCase();
  const normalized = list.map(normalizeInstitution).filter(i => i.active);
  if (!t) return normalized.slice(0, max);
  return normalized
    .filter(i => (i.name || '').toLowerCase().includes(t) || (i.aliases || []).some(a => String(a).toLowerCase().includes(t)))
    .slice(0, max);
}

export async function listInstitutionsIN({ max = 50 } = {}) {
  try {
    const q = query(
      institutionsCol(),
      where('country', '==', 'IN'),
      orderBy('name'),
      limit(max)
    );
    const snap = await getDocs(q);
    const remote = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.active !== false);
    if (remote.length) return remote.map(normalizeInstitution);
  } catch {
    // ignore and fall back to bundled seed list
  }
  return filterSearch(seedIN, '', max);
}

export async function searchInstitutionsIN(term, { max = 20 } = {}) {
  const initial = await listInstitutionsIN({ max: Math.max(max, 50) });
  return filterSearch(initial, term, max);
}

export function emailDomain(email) {
  return String(email || '').split('@')[1]?.toLowerCase() || '';
}

