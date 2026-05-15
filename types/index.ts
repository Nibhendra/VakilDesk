import { Timestamp } from 'firebase/firestore';

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  barCouncilNumber?: string;
  specialization?: string;
  firmName?: string;
  address?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  activeCasesCount: number;
  totalPaid: number;
  totalPending: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ClientInput = Omit<Client, 'id' | 'userId' | 'activeCasesCount' | 'totalPaid' | 'totalPending' | 'createdAt' | 'updatedAt'>;

// ─── Case ─────────────────────────────────────────────────────────────────────

export type CaseStatus = 'active' | 'closed' | 'pending' | 'dismissed' | 'settled';
export type CaseType = 'civil' | 'criminal' | 'family' | 'corporate' | 'labour' | 'revenue' | 'other';

export interface Case {
  id: string;
  userId: string;
  clientId: string;
  clientName: string; // Denormalized for display
  caseNumber: string;
  title: string;
  type: CaseType;
  status: CaseStatus;
  court: string;
  judge?: string;
  opposingParty?: string;
  opposingCounsel?: string;
  filingDate?: Timestamp;
  nextHearingDate?: Timestamp;
  description?: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CaseInput = Omit<Case, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'pendingAmount'>;

// ─── Hearing ──────────────────────────────────────────────────────────────────

export type HearingStatus = 'scheduled' | 'completed' | 'adjourned' | 'cancelled';

export interface Hearing {
  id: string;
  userId: string;
  caseId: string;
  caseTitle: string; // Denormalized
  clientName: string; // Denormalized
  court: string;
  date: Timestamp;
  time?: string;
  status: HearingStatus;
  notes?: string;
  nextDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type HearingInput = Omit<Hearing, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentMode = 'cash' | 'cheque' | 'upi' | 'bank_transfer' | 'other';

export interface Payment {
  id: string;
  userId: string;
  caseId: string;
  clientId: string;
  clientName: string; // Denormalized
  caseTitle: string; // Denormalized
  amount: number;
  mode: PaymentMode;
  receiptNumber?: string;
  notes?: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export type PaymentInput = Omit<Payment, 'id' | 'userId' | 'createdAt'>;

// ─── Note ─────────────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  userId: string;
  caseId?: string;
  clientId?: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NoteInput = Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ─── Document ─────────────────────────────────────────────────────────────────

export interface LegalDocument {
  id: string;
  userId: string;
  caseId?: string;
  clientId?: string;
  name: string;
  type: string; // mime type
  size: number; // bytes
  url: string;
  storagePath: string;
  createdAt: Timestamp;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  activeCases: number;
  totalClients: number;
  upcomingHearings: number;
  pendingPayments: number;
  totalEarnings: number;
}
