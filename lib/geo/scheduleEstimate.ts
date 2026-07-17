import { haversineKm } from "@/lib/geo/haversine";
import { walkingMinutes } from "@/lib/geo/walking";
import type { LatLng } from "@/lib/types";

const VISIT_MINUTES = 45;

export function parseHHMM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.round(totalMinutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Rough same-day arrival estimate per stop (minutes since midnight),
 * index-aligned with `stops`: day start + accumulated walking time + a flat
 * visit time at every prior stop. It's a coarse estimate, not a schedule —
 * ignores traffic, queues, opening-hour gaps, everything.
 */
export function estimateArrivals(origin: LatLng, stops: LatLng[], dayStartMinutes: number): number[] {
  const arrivals: number[] = [];
  let clock = dayStartMinutes;
  let current = origin;
  for (const stop of stops) {
    clock += walkingMinutes(haversineKm(current, stop));
    arrivals.push(clock);
    clock += VISIT_MINUTES;
    current = stop;
  }
  return arrivals;
}
