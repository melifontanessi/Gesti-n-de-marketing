/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a duration in milliseconds to a human-readable string like '1h 25m' or '45m 12s'.
 */
export function formatDuration(ms: number, includeSeconds = false): string {
  if (ms <= 0) return '0m';
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || (hours === 0 && !includeSeconds)) {
    parts.push(`${minutes}m`);
  }
  if (includeSeconds && (hours === 0 || seconds > 0)) {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ') || '0s';
}

/**
 * Formats an Epoch timestamp into a readable hour/minute string, e.g. "14:35" or "09:05".
 */
export function formatTime(timestamp?: number): string {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats an Epoch timestamp into a date string, e.g. "21 Jun, 21:30".
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthName = months[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${monthName}, ${hours}:${minutes} hs`;
}

/**
 * Persists value to localStorage safely.
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }
}

/**
 * Loads value from localStorage safely.
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage', error);
    return defaultValue;
  }
}
