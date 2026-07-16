import type { LatLng } from "@/lib/types";

/** Deep link into Google Maps directions, no API key involved. */
export function googleMapsDirectionsUrl(points: LatLng[]): string {
  const path = points.map((p) => `${p.lat},${p.lng}`).join("/");
  return `https://www.google.com/maps/dir/${path}`;
}

export function googleMapsWalkingUrl(destination: LatLng): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  url.searchParams.set("travelmode", "walking");
  return url.toString();
}
