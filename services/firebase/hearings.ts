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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Hearing, HearingInput } from '../../types';

const COLLECTION = 'hearings';

export const createHearing = async (userId: string, data: HearingInput): Promise<string> => {
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getHearings = async (userId: string): Promise<Hearing[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const hearings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Hearing));
  return hearings.sort((a, b) => (a.date?.toMillis?.() || 0) - (b.date?.toMillis?.() || 0));
};

export const getUpcomingHearings = async (userId: string): Promise<Hearing[]> => {
  const now = Timestamp.now();
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  let hearings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Hearing));
  
  // Filter locally to avoid composite index requirements
  hearings = hearings.filter(h => 
    h.status === 'scheduled' && 
    (h.date?.toMillis?.() || 0) >= now.toMillis()
  );
  
  return hearings.sort((a, b) => (a.date?.toMillis?.() || 0) - (b.date?.toMillis?.() || 0));
};

export const getHearingsByCase = async (caseId: string): Promise<Hearing[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('caseId', '==', caseId)
  );
  const snapshot = await getDocs(q);
  const hearings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Hearing));
  return hearings.sort((a, b) => (a.date?.toMillis?.() || 0) - (b.date?.toMillis?.() || 0));
};

export const updateHearing = async (hearingId: string, data: Partial<HearingInput>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, hearingId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteHearing = async (hearingId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, hearingId));
};
