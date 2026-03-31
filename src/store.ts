import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Location } from './types';

const COLLECTION = 'locations';

export async function getLocations(): Promise<Location[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Location);
}

export async function addLocation(location: Omit<Location, 'id'>): Promise<string> {
  // Strip undefined values — Firestore rejects them
  const clean = Object.fromEntries(Object.entries(location).filter(([, v]) => v !== undefined));
  const docRef = await addDoc(collection(db, COLLECTION), clean);
  return docRef.id;
}

export async function updateLocation(id: string, updates: Partial<Location>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
  await updateDoc(doc(db, COLLECTION, id), clean);
}

export async function deleteLocation(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
