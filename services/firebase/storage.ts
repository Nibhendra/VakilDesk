import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { storage, db } from './config';
import { LegalDocument } from '../../types';

const COLLECTION = 'documents';

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

export const uploadDocument = async (
  userId: string,
  fileUri: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  caseId?: string,
  clientId?: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const storagePath = `documents/${userId}/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, storagePath);

  // Fetch the file as blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);

        // Save metadata to Firestore
        const docRef = doc(collection(db, COLLECTION));
        await setDoc(docRef, {
          userId,
          caseId: caseId ?? null,
          clientId: clientId ?? null,
          name: fileName,
          type: fileType,
          size: fileSize,
          url,
          storagePath,
          createdAt: serverTimestamp(),
        });

        resolve(url);
      }
    );
  });
};

export const getDocumentsByCase = async (caseId: string): Promise<LegalDocument[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('caseId', '==', caseId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LegalDocument));
};

export const deleteDocument = async (documentId: string, storagePath: string): Promise<void> => {
  // Delete from Storage
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);

  // Delete metadata from Firestore
  await deleteDoc(doc(db, COLLECTION, documentId));
};
