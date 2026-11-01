// Date helpers. All dates are local-calendar "YYYY-MM-DD" strings; math goes through UTC day numbers so DST never shifts a day.

const DAY_MS = 86400000;
export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isISO(s) {
  const m = typeof s === "string" && ISO_RE.exec(s);
  if (!m) return false;
  const [, y, mo, d] = m.map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

const pad = (n) => String(n).padStart(2, "0");

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function today(now = new Date()) {
  return toISO(now);
}

function dayNum(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

function fromDayNum(n) {
  const dt = new Date(n * DAY_MS);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function addDays(iso, n) {
  return fromDayNum(dayNum(iso) + n);
}

export function addMonths(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total % 12;
  const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  return `${ny}-${pad(nm + 1)}-${pad(Math.min(d, last))}`;
}

export function daysBetween(a, b) {
  return dayNum(b) - dayNum(a);
}

/** 0 = Sunday. */
export function weekday(iso) {
  return (((dayNum(iso) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
}

/** Monday on or before the date. */
export function startOfWeek(iso) {
  return addDays(iso, -((weekday(iso) + 6) % 7));
}

export function endOfMonth(iso) {
  const [y, m] = iso.split("-").map(Number);
  return `${y}-${pad(m)}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`;
}

/** The next occurrence of weekday `wd` strictly after `from` (1..7 days ahead). */
function upcoming(from, wd) {
  const diff = ((wd - weekday(from) + 6) % 7) + 1;
  return addDays(from, diff);
}

function matchWeekday(word) {
  if (word.length < 3) return -1;
  return WEEKDAYS.findIndex((w, i) => WEEKDAY_NAMES[i].toLowerCase().startsWith(word) && word.startsWith(w));
}

function matchMonth(word) {
  if (word.length < 3) return -1;
  return MONTHS.findIndex((m, i) => MONTH_NAMES[i].toLowerCase().startsWith(word) && word.startsWith(m));
}

function build(y, m, d) {
  const iso = `${y}-${pad(m)}-${pad(d)}`;
  return isISO(iso) ? iso : null;
}

/** Month/day with no year: this year, or next year if that date already passed. */
function inferYear(m, d, from) {
  const y = Number(from.slice(0, 4));
  const here = build(y, m, d);
  if (!here) return null;
  return here < from ? build(y + 1, m, d) : here;
}

/**
 * Parse a human date. Returns an ISO string, "" to clear, or null if it isn't understood.
 *   today tomorrow yesterday | mon, friday | next mon | +3d 2w 1m | in 3 days | eow eom nextweek
 *   2026-11-05 | 11/5 11/5/2027 | nov 5, 5 nov, nov 5 2027 | none clear -
 */
export function parseDate(input, from = today()) {
  const raw = String(input ?? "").trim().toLowerCase();
  if (raw === "") return null;
  if (["none", "clear", "-", "x", "no", "off"].includes(raw)) return "";
  if (isISO(raw)) return raw;

  const s = raw.replace(/\s+/g, " ");
  if (["today", "tod", "now"].includes(s)) return from;
  if (["tomorrow", "tom", "tmr", "tmrw"].includes(s)) return addDays(from, 1);
  if (["yesterday", "yest"].includes(s)) return addDays(from, -1);
  if (["eow", "endofweek"].includes(s.replace(/ /g, ""))) {
    const fri = upcoming(addDays(from, -1), 5); // today if it's Friday
    return fri;
  }
  if (["eom", "endofmonth"].includes(s.replace(/ /g, ""))) return endOfMonth(from);
  if (["nextweek", "next week", "nw"].includes(s)) return upcoming(from, 1);
  if (["nextmonth", "next month", "nm"].includes(s)) return addMonths(from, 1);

  let m = /^(?:\+|in )?(\d+) ?(d|day|days|w|wk|wks|week|weeks|m|mo|month|months)$/.exec(s);
  if (m) {
    const n = Number(m[1]);
    const unit = m[2][0];
    if (unit === "d") return addDays(from, n);
    if (unit === "w") return addDays(from, n * 7);
    return addMonths(from, n);
  }

  m = /^(next )?([a-z]+)$/.exec(s);
  if (m) {
    const wd = matchWeekday(m[2]);
    if (wd !== -1) {
      if (!m[1]) return upcoming(from, wd);
      // "next fri" = that weekday in next calendar week.
      const mondayNext = upcoming(from, 1);
      return addDays(mondayNext, (wd + 6) % 7);
    }
  }

  m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/.exec(s);
  if (m) {
    const mo = Number(m[1]);
    const d = Number(m[2]);
    if (m[3]) {
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      return build(y, mo, d);
    }
    return inferYear(mo, d, from);
  }

  m = /^([a-z]+) (\d{1,2})(?:st|nd|rd|th)?(?:,? (\d{4}))?$/.exec(s);
  if (m && matchMonth(m[1]) !== -1) {
    const mo = matchMonth(m[1]) + 1;
    return m[3] ? build(Number(m[3]), mo, Number(m[2])) : inferYear(mo, Number(m[2]), from);
  }
  m = /^(\d{1,2})(?:st|nd|rd|th)? ([a-z]+)(?:,? (\d{4}))?$/.exec(s);
  if (m && matchMonth(m[2]) !== -1) {
    const mo = matchMonth(m[2]) + 1;
    return m[3] ? build(Number(m[3]), mo, Number(m[1])) : inferYear(mo, Number(m[1]), from);
  }

  return null;
}

/** Short label relative to `from`: Today, Tomorrow, Yesterday, Fri, Nov 12, Nov 12 2027. */
export function formatDate(iso, from = today()) {
  if (!iso) return "";
  const diff = daysBetween(from, iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const [y, m, d] = iso.split("-").map(Number);
  if (diff > 1 && diff < 7) return WEEKDAY_NAMES[weekday(iso)].slice(0, 3);
  const base = `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
  return y === Number(from.slice(0, 4)) ? base : `${base} ${y}`;
}

/** Long label: "Fri, Nov 6". */
export function formatLong(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-").map(Number);
  return `${WEEKDAY_NAMES[weekday(iso)].slice(0, 3)}, ${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}

/** "3d ago", "in 2d", "today" for aging / countdowns. */
export function relative(iso, from = today()) {
  const diff = daysBetween(from, iso);
  if (diff === 0) return "today";
  return diff < 0 ? `${-diff}d ago` : `in ${diff}d`;
}
