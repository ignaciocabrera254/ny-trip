"use client";

import { useState } from "react";
import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import DynamicTripMap from "@/components/map/DynamicTripMap";
import { searchPlace, type SearchResult } from "@/lib/geo/geocoding";
import { HOME, type LatLng } from "@/lib/types";

type Props = {
  /** Currently picked point, owned by the caller (controlled). */
  value: LatLng | null;
  onChange: (point: LatLng, suggestedName: string, placeId: string | null) => void;
  mapZoom?: number;
};

/**
 * "Buscar / Tocar mapa" location picker shared by the destination form, the
 * day-origin picker, and destination tips. Owns only the search/map-tap UI
 * and the picked-point confirmation line — name, category, and everything
 * else that comes after picking a point is the caller's own fields.
 */
export default function PlacePicker({ value, onChange, mapZoom = 12 }: Props) {
  const [mode, setMode] = useState<"search" | "map">("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      setResults(await searchPlace(query));
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }

  function pickResult(r: SearchResult) {
    // The Geocoding API returns a street address, not a place name (that's
    // the Places API) — what the person actually searched for is the best
    // guess at a name, e.g. "B&H Photo Video" instead of "420 9th Ave".
    onChange({ lat: r.lat, lng: r.lng }, query.trim(), r.placeId ?? null);
    setResults([]);
    setSearched(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("search")}
          className={`h-11 flex-1 rounded-full border-2 border-ink text-sm font-bold uppercase cursor-pointer ${
            mode === "search" ? "bg-ink text-paper" : "bg-paper text-ink"
          }`}
        >
          Buscar
        </button>
        <button
          onClick={() => setMode("map")}
          className={`h-11 flex-1 rounded-full border-2 border-ink text-sm font-bold uppercase cursor-pointer ${
            mode === "map" ? "bg-ink text-paper" : "bg-paper text-ink"
          }`}
        >
          Tocar mapa
        </button>
      </div>

      {mode === "search" && (
        <div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearched(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nombre del lugar o dirección"
                className="h-11 w-full rounded-md border border-border pl-3 pr-10 text-base"
              />
              {query.length > 0 && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSearched(false);
                    setResults([]);
                  }}
                  aria-label="Borrar búsqueda"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              aria-label="Buscar lugar"
              className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-ink cursor-pointer"
            >
              {searching ? (
                <LoaderCircle className="animate-spin" size={18} aria-hidden />
              ) : (
                <Search size={18} aria-hidden />
              )}
            </button>
          </div>
          {results.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {results.map((r) => (
                <li key={`${r.lat}-${r.lng}`}>
                  <button
                    onClick={() => pickResult(r)}
                    className="w-full rounded-md border border-border p-2 text-left text-sm cursor-pointer hover:border-ink"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searched && !searching && results.length === 0 && (
            <div className="mt-2 rounded-md border border-border p-3 text-sm">
              <p className="text-ink/70">No encontramos ese lugar.</p>
              <button
                onClick={() => setMode("map")}
                className="mt-1 font-bold underline cursor-pointer"
              >
                Tocar el mapa para ubicarlo
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "map" && (
        <div className="h-56 w-full overflow-hidden rounded-md border border-border">
          <DynamicTripMap
            center={value ?? HOME}
            zoom={mapZoom}
            pickedPoint={value}
            onMapClick={(point) => onChange(point, query.trim(), null)}
          />
        </div>
      )}

      {value && (
        <div className="flex items-center gap-1.5 text-sm text-ink/60">
          <MapPin size={14} aria-hidden />
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
