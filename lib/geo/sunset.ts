import { getTimes } from "suncalc";
import { walkingMinutes } from "@/lib/geo/walking";
import type { LatLng } from "@/lib/types";

// ponytail: trip runs entirely within US daylight saving (mid-Aug–early Sep), so a
// fixed UTC-4 offset always lands on the correct NY calendar day regardless of the
// device's own timezone. Revisit if the itinerary ever crosses into EST (Nov–Mar).
const NY_UTC_OFFSET = "-04:00";
const NY_TIME_ZONE = "America/New_York";

/** Sunset instant for a given day/spot, using the day's date as seen in NY. */
export function sunsetTimeFor(dateStr: string, point: LatLng): Date {
  const noonInNy = new Date(`${dateStr}T12:00:00${NY_UTC_OFFSET}`);
  // NYC's latitude never has a sunless day, so `sunset` is never null here.
  return getTimes(noonInNy, point.lat, point.lng).sunset!;
}

/** Format an instant as "HH:MM" in NY local time, independent of device timezone. */
export function formatNyTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: NY_TIME_ZONE,
  }).format(date);
}

/** Latest instant to leave `distanceKm` away on foot (5 km/h) to arrive with a buffer. */
export function departureDeadline(target: Date, distanceKm: number, bufferMinutes = 30): Date {
  return new Date(target.getTime() - (walkingMinutes(distanceKm) + bufferMinutes) * 60_000);
}
