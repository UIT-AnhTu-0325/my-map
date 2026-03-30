import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const SESSION_KEY = 'my-map-auth';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function login(username: string, password: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  const q = query(
    collection(db, 'users'),
    where('username', '==', username),
    where('password', '==', hashed),
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    localStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(SESSION_KEY) === 'true';
}

// Helper: call this once from browser console to generate a hash for a new user
// e.g. in console: import('/src/auth.ts').then(m => m.generateHash('NgayMai@123'))
export { hashPassword as generateHash };
