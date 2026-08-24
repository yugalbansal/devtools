/* Formatting helpers */

export function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

export function formatTimestamp(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleString();
}

export function relativeTime(unixSeconds) {
  const diffSec = unixSeconds - Math.floor(Date.now() / 1000);
  const absMin = Math.floor(Math.abs(diffSec) / 60);
  const label = absMin >= 60
    ? `${Math.floor(absMin / 60)}h`
    : `${Math.max(absMin, 1)}m`;
  if (absMin < 1 && Math.abs(diffSec) < 60) return 'just now';
  return diffSec > 0 ? `in ${label}` : `${label} ago`;
}

export function truncate(text, max = 200) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}
