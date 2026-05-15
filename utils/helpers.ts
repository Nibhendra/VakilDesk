import { Timestamp } from 'firebase/firestore';

/**
 * Format a Firestore Timestamp to a readable date string
 */
export const formatDate = (
  ts: Timestamp | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

/**
 * Format a number as Indian Rupees
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Get initials from a full name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
};

/**
 * Relative date label (Today, Tomorrow, or date string)
 */
export const getRelativeDateLabel = (ts: Timestamp): string => {
  const date = ts.toDate();
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Truncate long strings
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};
