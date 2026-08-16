// Small shared helpers. No dependencies on React or storage.

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Local (not UTC) calendar day key, e.g. "2026-08-16". */
export function dayKey(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseDayKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(aKey, bKey) {
  const ms = parseDayKey(bKey) - parseDayKey(aKey);
  return Math.round(ms / 86400000);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function prettyDate(key) {
  return parseDayKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function shortDate(key) {
  return parseDayKey(key).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function timeOf(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * Deterministic 32-bit hash. Used to pick the "remark of the day" so the same
 * day always yields the same card, without storing a pointer.
 */
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pickForDay(list, key, salt = "") {
  if (!list.length) return null;
  return list[hashString(key + salt) % list.length];
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export function mean(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Count of consecutive days ending today that appear in `keys`. */
export function streakFrom(keys) {
  const set = new Set(keys);
  let streak = 0;
  let cursor = new Date();
  // Today doesn't break the streak if it hasn't happened yet.
  if (!set.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function download(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
