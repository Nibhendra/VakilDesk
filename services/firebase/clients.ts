import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { Client, ClientInput } from '../../types';

const COLLECTION = 'clients';

export const createClient = async (userId: string, data: ClientInput): Promise<string> => {
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    ...data,
    userId,
    activeCasesCount: 0,
    totalPaid: 0,
    totalPending: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getClients = async (userId: string): Promise<Client[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const clients = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Client));
  
  // Sort client-side to avoid requiring Firebase composite indexes
  return clients.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

export const getClient = async (clientId: string): Promise<Client | null> => {
  const d = await getDoc(doc(db, COLLECTION, clientId));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as Client;
};

export const updateClient = async (clientId: string, data: Partial<ClientInput>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, clientId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteClient = async (clientId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, clientId));
};

export const searchClients = async (userId: string, searchTerm: string): Promise<Client[]> => {
  // Firestore doesn't support full-text search natively; fetch all and filter client-side
  const all = await getClients(userId);
  const term = searchTerm.toLowerCase();
  return all.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.email && c.email.toLowerCase().includes(term))
  );
};
