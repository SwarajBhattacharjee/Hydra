/**
 * Utilities for user-local timezone handling.
 * Ensures "Today" is computed according to the user's browser local clock,
 * preventing server-UTC offset mismatches across timezone boundaries or DST transitions.
 */

export function getTodayLocalDateString(dateObj: Date = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyTime(isoOrTime: string): string {
  if (isoOrTime.includes(':') && isoOrTime.length === 5) {
    // HH:MM format
    const [h, m] = isoOrTime.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  }
  const date = new Date(isoOrTime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatFriendlyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = getTodayLocalDateString();
  
  if (dateStr === today) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === getTodayLocalDateString(yesterday)) return 'Yesterday';

  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getPreviousDateString(dateStr: string, daysAgo: number = 1): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - daysAgo);
  return getTodayLocalDateString(date);
}

export function calculateConsecutiveDays(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sorted = Array.from(new Set(completedDates)).sort().reverse();
  const today = getTodayLocalDateString();
  const yesterday = getPreviousDateString(today, 1);

  // If latest completed date is neither today nor yesterday, streak is broken (0)
  if (sorted[0] !== today && sorted[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const expectedPrev = getPreviousDateString(currentDate, 1);
    if (sorted[i] === expectedPrev) {
      streak++;
      currentDate = sorted[i];
    } else {
      break;
    }
  }

  return streak;
}
