import { DateTime } from 'luxon';

/**
 * Combine a calendar date + "HH:mm" or "HH:mm:ss" into a UTC JS Date.
 * Works with both string and Date inputs for the date.
 */
export function combineDateAndTimeToUTC(
  dateInput: string | Date,
  timeStr: string | null | undefined,
  timeZone: string
): Date | null {
  if (!timeStr) return null;

  const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timeStr.trim());
  if (!m) return null;

  const [, hh, mm, ss] = m;

  // Build a tz-aware DateTime from the date input
  const base =
    typeof dateInput === 'string'
      ? DateTime.fromISO(dateInput, { zone: timeZone })
      : DateTime.fromJSDate(dateInput, { zone: timeZone });

  if (!base.isValid) return null;

  const local = base.startOf('day').set({
    hour: Number(hh),
    minute: Number(mm),
    second: ss ? Number(ss) : 0,
    millisecond: 0,
  });

  if (!local.isValid) return null;

  return local.toUTC().toJSDate();
}


/**
 * Take a combined date-time (string or Date) and a selected IANA time zone,
 * interpret the value in that zone (if no offset is present), and return a UTC JS Date.
 *
 * Accepts:
 *  - "2025-10-14T20:00"          (no zone -> interpret in `timeZone`)
 *  - "2025-10-14 20:00"          (space instead of 'T')
 *  - "2025-10-14T20:00:00"       (no zone -> interpret in `timeZone`)
 *  - "2025-10-14T20:00:00+05:30" (has offset -> use it)
 *  - Date object (discouraged for local wall time; see note)
 */
export function toUTCFromLocalDateTime(
  dateTimeInput: string | Date,
  timeZone: string
): Date | null {
  let dt: DateTime | null = null;

  if (typeof dateTimeInput === 'string') {
    const s = dateTimeInput.trim().replace(' ', 'T');
    const hasZone = /([zZ]|[+-]\d{2}:\d{2})$/.test(s);

    // If input already has an explicit zone/offset, respect it.
    // Otherwise, interpret as wall time in the provided timeZone.
    dt = hasZone
      ? DateTime.fromISO(s) // uses embedded offset
      : DateTime.fromISO(s, { zone: timeZone }); // interpret in selected tz
  } else if (dateTimeInput instanceof Date) {
    // JS Date is an absolute instant. If you intended a *wall time* in timeZone,
    // pass a string instead. Here we just convert that instant to the zone, then UTC.
    dt = DateTime.fromJSDate(dateTimeInput, { zone: timeZone });
  }

  if (!dt || !dt.isValid) return null;
  return dt.toUTC().toJSDate();
}
