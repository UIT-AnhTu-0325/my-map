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
  const docRef = await addDoc(collection(db, COLLECTION), location);
  return docRef.id;
}

export async function updateLocation(id: string, updates: Partial<Location>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), updates);
}

export async function deleteLocation(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
