// IST offset is UTC + 5 hours 30 minutes
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * Returns the current date in Asia/Kolkata formatted as YYYY-MM-DD
 */
function getKolkataDateString(dateObj = new Date()) {
  const istDate = new Date(dateObj.getTime() + IST_OFFSET_MS);
  return istDate.toISOString().slice(0, 10);
}

/**
 * Returns a list of the next N date strings (YYYY-MM-DD) in Asia/Kolkata
 */
function getRollingDates(days = 14) {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    dates.push(getKolkataDateString(d));
  }
  return dates;
}

/**
 * Creates a UTC Date object representing a specific hour on an Asia/Kolkata calendar date
 * e.g. ('2026-10-27', 6) -> 2026-10-27T06:00:00+05:30 -> UTC instant
 */
function createSlotInstant(dateString, hour) {
  const paddedHour = String(hour).padStart(2, '0');
  // ISO-8601 string with explicit +05:30 time zone offset
  const isoString = `${dateString}T${paddedHour}:00:00+05:30`;
  return new Date(isoString);
}

/**
 * Format slot label
 * e.g. 6 -> "06:00 - 07:00"
 */
function formatSlotLabel(hour) {
  const start = String(hour).padStart(2, '0') + ':00';
  const end = String(hour + 1).padStart(2, '0') + ':00';
  return `${start} - ${end}`;
}

module.exports = {
  IST_OFFSET_MS,
  getKolkataDateString,
  getRollingDates,
  createSlotInstant,
  formatSlotLabel,
};
