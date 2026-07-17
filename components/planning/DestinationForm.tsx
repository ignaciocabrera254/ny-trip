"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import DynamicTripMap from "@/components/map/DynamicTripMap";
import { searchPlace, type SearchResult } from "@/lib/geo/geocoding";
import { CATEGORY_LABEL, HOME, type Day, type Destination, type DestinationCategory, type LatLng } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  days: Day[];
  defaultDayId: string | null;
  forceSunsetSpot?: boolean;
  onAdd: (input: Omit<Destination, "id" | "visited" | "sort_order">) => Promise<void>;
};

const CATEGORIES = Object.keys(CATEGORY_LABEL) as DestinationCategory[];

export default function DestinationForm({
  open,
  onClose,
  days,
  defaultDayId,
  forceSunsetSpot,
  onAdd,
}: Props) {
  const [mode, setMode] = useState<"search" | "map">("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [picked, setPicked] = useState<LatLng | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DestinationCategory>("otro");
  const [notes, setNotes] = useState("");
  const [dayId, setDayId] = useState<string>(defaultDayId ?? "backlog");
  const [isSunsetSpot, setIsSunsetSpot] = useState(false);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The form component stays mounted across opens (parent toggles `open`, not
  // presence), so defaults must be re-applied here rather than via useState
  // initializers, which only run once on first mount.
  useEffect(() => {
    if (open) {
      reset();
      setDayId(defaultDayId ?? "backlog");
      setIsSunsetSpot(!!forceSunsetSpot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function reset() {
    setQuery("");
    setResults([]);
    setSearched(false);
    setPicked(null);
    setName("");
    setCategory("otro");
    setNotes("");
    setIsSunsetSpot(false);
    setOpensAt("");
    setClosesAt("");
    setMode("search");
  }

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
    setPicked({ lat: r.lat, lng: r.lng });
    setName(r.display_name.split(",")[0]);
    setResults([]);
    setSearched(false);
  }

  async function handleSubmit() {
    if (!picked || !name.trim()) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await onAdd({
        name: name.trim(),
        category,
        lat: picked.lat,
        lng: picked.lng,
        notes: notes.trim() || null,
        is_sunset_spot: isSunsetSpot,
        day_id: dayId === "backlog" ? null : dayId,
        opens_at: opensAt || null,
        closes_at: closesAt || null,
      });
      reset();
      onClose();
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "No se pudo guardar el destino.";
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Cerrar" onClick={onClose} className="backdrop-button absolute inset-0 bg-ink/50 cursor-pointer" />
      <div className="relative z-10 flex h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border-t-2 border-ink bg-paper p-5 pb-8 shadow-2xl">
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
                  onClick={() => {
                    if (!name.trim()) setName(query.trim());
                    setMode("map");
                  }}
                  className="mt-1 font-bold underline cursor-pointer"
                >
                  Tocar el mapa para ubicarlo y ponerle nombre
                </button>
              </div>
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

            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
                Abre (opcional)
                <input
                  type="time"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="h-11 rounded-md border border-border px-3 text-base font-normal"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
                Cierra (opcional)
                <input
                  type="time"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="h-11 rounded-md border border-border px-3 text-base font-normal"
                />
              </label>
            </div>
            {closesAt && (
              <p className="text-xs text-ink/50">
                Se usa solo para un aviso estimado si la llegada calculada cae después del cierre.
              </p>
            )}

            {submitError && (
              <p role="alert" className="text-sm font-semibold text-danger">
                No se pudo guardar: {submitError}
              </p>
            )}

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
