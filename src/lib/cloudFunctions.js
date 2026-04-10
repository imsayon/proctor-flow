import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

function callable(name) {
  if (!functions) throw new Error('Firebase Functions not initialized');
  return httpsCallable(functions, name);
}

export const bootstrapAdmin = async (payload) => {
  const fn = callable('bootstrapAdmin');
  const res = await fn(payload);
  return res.data;
};

export const adminCreateUser = async (payload) => {
  const fn = callable('adminCreateUser');
  const res = await fn(payload);
  return res.data;
};

export const adminResetPassword = async (payload) => {
  const fn = callable('adminResetPassword');
  const res = await fn(payload);
  return res.data;
};

