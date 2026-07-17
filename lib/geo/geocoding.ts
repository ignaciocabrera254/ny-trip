"use server";

export type SearchResult = {
  display_name: string;
  lat: number;
  lng: number;
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

  return data.results.map((r: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }) => ({
    display_name: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
  }));
}
