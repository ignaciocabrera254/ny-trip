import { haversineKm } from "@/lib/geo/haversine";
import type { Destination, LatLng } from "@/lib/types";

/** Nearest-neighbor from origin; sunset spot (if any) is always forced last. */
export function optimizeDay(
  origin: LatLng,
  stops: Destination[]
): Destination[] {
  const sunset = stops.find((s) => s.is_sunset_spot);
  const rest = stops.filter((s) => !s.is_sunset_spot);

  const ordered: Destination[] = [];
  const remaining = [...rest];
  let current = origin;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineKm(current, remaining[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    current = next;
  }

  return sunset ? [...ordered, sunset] : ordered;
}

/** Straight-line total distance for the ordered route, starting from origin. */
export function totalRouteKm(origin: LatLng, orderedStops: LatLng[]): number {
  let total = 0;
  let current = origin;
  for (const stop of orderedStops) {
    total += haversineKm(current, stop);
    current = stop;
  }
  return total;
}
