const WALK_SPEED_KMH = 5;

/** Walking time in minutes for a distance at a brisk 5 km/h pace. */
export function walkingMinutes(km: number): number {
  return (km / WALK_SPEED_KMH) * 60;
}
