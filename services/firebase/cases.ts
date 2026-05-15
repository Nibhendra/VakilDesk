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
} from 'firebase/firestore';
import { db } from './config';
import { Case, CaseInput } from '../../types';

const COLLECTION = 'cases';

export const createCase = async (userId: string, data: CaseInput): Promise<string> => {
  const ref = doc(collection(db, COLLECTION));
  const pendingAmount = data.totalFees - data.paidAmount;
  await setDoc(ref, {
    ...data,
    userId,
    pendingAmount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getCases = async (userId: string): Promise<Case[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const cases = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Case));
  return cases.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

export const getCase = async (caseId: string): Promise<Case | null> => {
  const d = await getDoc(doc(db, COLLECTION, caseId));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as Case;
};

export const getCasesByClient = async (userId: string, clientId: string): Promise<Case[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  let cases = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Case));
  cases = cases.filter(c => c.clientId === clientId);
  return cases.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

export const getActiveCases = async (userId: string): Promise<Case[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  let cases = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Case));
  cases = cases.filter(c => c.status === 'active');
  return cases.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

export const updateCase = async (caseId: string, data: Partial<CaseInput>): Promise<void> => {
  const updates: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
  if (data.totalFees !== undefined || data.paidAmount !== undefined) {
    const existing = await getCase(caseId);
    if (existing) {
      const fees = data.totalFees ?? existing.totalFees;
      const paid = data.paidAmount ?? existing.paidAmount;
      updates.pendingAmount = fees - paid;
    }
  }
  await updateDoc(doc(db, COLLECTION, caseId), updates);
};

export const deleteCase = async (caseId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, caseId));
};
