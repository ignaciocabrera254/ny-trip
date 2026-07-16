"use client";

import { useState } from "react";
import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import DynamicTripMap from "@/components/map/DynamicTripMap";
import { searchPlace, type NominatimResult } from "@/lib/geo/nominatim";
import { CATEGORY_LABEL, HOME, type Day, type Destination, type DestinationCategory, type LatLng } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  days: Day[];
  defaultDayId: string | null;
  onAdd: (input: Omit<Destination, "id" | "visited" | "sort_order">) => Promise<void>;
};

const CATEGORIES = Object.keys(CATEGORY_LABEL) as DestinationCategory[];

export default function DestinationForm({ open, onClose, days, defaultDayId, onAdd }: Props) {
  const [mode, setMode] = useState<"search" | "map">("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [picked, setPicked] = useState<LatLng | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DestinationCategory>("otro");
  const [notes, setNotes] = useState("");
  const [dayId, setDayId] = useState<string>(defaultDayId ?? "backlog");
  const [isSunsetSpot, setIsSunsetSpot] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function reset() {
    setQuery("");
    setResults([]);
    setPicked(null);
    setName("");
    setCategory("otro");
    setNotes("");
    setIsSunsetSpot(false);
    setMode("search");
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      setResults(await searchPlace(query));
    } finally {
      setSearching(false);
    }
  }

  function pickResult(r: NominatimResult) {
    setPicked({ lat: r.lat, lng: r.lng });
    setName(r.display_name.split(",")[0]);
    setResults([]);
  }

  async function handleSubmit() {
    if (!picked || !name.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        name: name.trim(),
        category,
        lat: picked.lat,
        lng: picked.lng,
        notes: notes.trim() || null,
        is_sunset_spot: isSunsetSpot,
        day_id: dayId === "backlog" ? null : dayId,
      });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Cerrar" onClick={onClose} className="backdrop-button absolute inset-0 bg-ink/50 cursor-pointer" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border-t-2 border-ink bg-paper p-5 pb-8 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide">Nuevo destino</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink cursor-pointer"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="mb-3 flex gap-2">
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
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nombre del lugar"
                className="h-11 flex-1 rounded-md border border-border px-3 text-base"
              />
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
          </div>
        )}

        {mode === "map" && (
          <div className="mb-3 h-56 w-full overflow-hidden rounded-md border border-border">
            <DynamicTripMap
              center={picked ?? HOME}
              zoom={12}
              pickedPoint={picked}
              onMapClick={(point) => setPicked(point)}
            />
          </div>
        )}

        {picked && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-sm text-ink/60">
              <MapPin size={14} aria-hidden />
              {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
            </div>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Nombre
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-md border border-border px-3 text-base font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Categoría
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DestinationCategory)}
                className="h-11 rounded-md border border-border px-3 text-base font-normal cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Día
              <select
                value={dayId}
                onChange={(e) => setDayId(e.target.value)}
                className="h-11 rounded-md border border-border px-3 text-base font-normal cursor-pointer"
              >
                <option value="backlog">Sin asignar</option>
                {days.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} — {d.date}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Notas
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="rounded-md border border-border p-3 text-base font-normal"
              />
            </label>

            <label className="flex h-11 items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={isSunsetSpot}
                onChange={(e) => setIsSunsetSpot(e.target.checked)}
                className="h-5 w-5"
              />
              Es el sunset spot del día
            </label>

            <button
              onClick={handleSubmit}
              disabled={!name.trim() || saving}
              className="h-12 rounded-full bg-cta font-bold uppercase text-cta-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? "Guardando…" : "Agregar destino"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
