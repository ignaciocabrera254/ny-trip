export type NominatimResult = {
  display_name: string;
  lat: number;
  lng: number;
};

/** Client-side geocode search against the free Nominatim API. */
export async function searchPlace(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("viewbox", "-74.3,40.55,-73.7,40.92");
  url.searchParams.set("bounded", "0");

  const res = await fetch(url.toString(), {
    headers: { "Accept-Language": "es,en" },
  });
  if (!res.ok) throw new Error("Nominatim search failed");

  const data: Array<{ display_name: string; lat: string; lon: string }> =
    await res.json();

  return data.map((d) => ({
    display_name: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}
