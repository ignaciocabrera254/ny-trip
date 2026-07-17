"use server";

export type SearchResult = {
  display_name: string;
  lat: number;
  lng: number;
  placeId?: string;
};

/**
 * Server Action to geocode search against the Google Maps Geocoding API.
 * Uses the API key from environment variables safely on the server.
 */
export async function searchPlace(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está configurada");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  // Bias to NY area (approximate bounding box)
  url.searchParams.set("bounds", "40.55,-74.3|40.92,-73.7");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "es"); // Return results in Spanish

  const res = await fetch(url.toString(), {
    headers: {
      // Pasamos un referer válido para que Google Maps API acepte la petición
      // con la restricción de "Sitios web" activada.
      Referer: "https://ny-trip-ten.vercel.app/",
    },
  });

  if (!res.ok) throw new Error("Google Geocoding request failed");

  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message || "Error al buscar en Google Maps");
  }

  return data.results.map(
    (r: {
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
      place_id?: string;
    }) => ({
      display_name: r.formatted_address,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      placeId: r.place_id,
    })
  );
}

export type PlaceHours = { opensAt: string | null; closesAt: string | null };

function formatGoogleTime(t: string): string {
  return `${t.slice(0, 2)}:${t.slice(2, 4)}`;
}

/**
 * Server Action: looks up a place's opening hours for one weekday (0=Sun..6=Sat,
 * matching Google's convention) via the Places API "Place Details" endpoint.
 * Returns nulls whenever the place has no hours on record — parks, monuments,
 * and plenty of real businesses simply aren't in Google's hours data.
 */
export async function getPlaceHours(placeId: string, weekday: number): Promise<PlaceHours> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { opensAt: null, closesAt: null };

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "opening_hours");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    headers: { Referer: "https://ny-trip-ten.vercel.app/" },
  });
  if (!res.ok) return { opensAt: null, closesAt: null };

  const data = await res.json();
  if (data.status !== "OK") return { opensAt: null, closesAt: null };

  const periods: Array<{ open: { day: number; time: string }; close?: { day: number; time: string } }> =
    data.result?.opening_hours?.periods ?? [];
  const match = periods.find((p) => p.open.day === weekday);
  if (!match) return { opensAt: null, closesAt: null };

  return {
    opensAt: formatGoogleTime(match.open.time),
    closesAt: match.close ? formatGoogleTime(match.close.time) : null,
  };
}
