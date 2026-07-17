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

/** Deep link into Google Maps public-transit directions between two points.
 *  Omit `origin` (e.g. geolocation denied/unavailable) to let Google Maps ask
 *  the visitor for their current location instead. */
export function googleMapsTransitUrl(origin: LatLng | null, destination: LatLng): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  if (origin) url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  url.searchParams.set("travelmode", "transit");
  return url.toString();
}
