import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Payment, PaymentInput } from '../../types';
import { updateCase } from './cases';
import { getCase } from './cases';

const COLLECTION = 'payments';

export const createPayment = async (userId: string, data: PaymentInput): Promise<string> => {
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });

  // Update the case's paid amount
  const existingCase = await getCase(data.caseId);
  if (existingCase) {
    await updateCase(data.caseId, {
      paidAmount: existingCase.paidAmount + data.amount,
    });
  }

  return ref.id;
};

export const getPaymentsByCase = async (caseId: string): Promise<Payment[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('caseId', '==', caseId)
  );
  const snapshot = await getDocs(q);
  const payments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
  return payments.sort((a, b) => (b.date?.toMillis?.() || 0) - (a.date?.toMillis?.() || 0));
};

export const getPaymentsByUser = async (userId: string): Promise<Payment[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const payments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
  return payments.sort((a, b) => (b.date?.toMillis?.() || 0) - (a.date?.toMillis?.() || 0));
};
