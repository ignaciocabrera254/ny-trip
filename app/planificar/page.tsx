"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, Plus, TriangleAlert } from "lucide-react";
import DestinationCard from "@/components/planning/DestinationCard";
import DestinationForm from "@/components/planning/DestinationForm";
import SunsetSpotPicker from "@/components/planning/SunsetSpotPicker";
import DayOriginPicker, { type DayOrigin } from "@/components/planning/DayOriginPicker";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { centroid } from "@/lib/geo/centroid";
import { haversineKm } from "@/lib/geo/haversine";
import { useTripData } from "@/lib/useTripData";
import type { Day } from "@/lib/types";

/** Free-text day title, debounced-saved on change. The "Día N · fecha" anchor next to
 * it is derived (not stored) so the list always visibly reads in day order, never sector order. */
function DayTitleInput({ day, onSave }: { day: Day; onSave: (title: string) => void }) {
  const [value, setValue] = useState(day.title);

  useEffect(() => setValue(day.title), [day.id, day.title]);

  useEffect(() => {
    if (value === day.title) return;
    const timer = setTimeout(() => onSave(value), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      placeholder="Título del día"
      aria-label={`Título del día — ${day.title}`}
      className="w-full max-w-[220px] truncate bg-transparent text-sm font-normal text-ink/50 focus:text-ink focus:underline focus:outline-none"
    />
  );
}

export default function PlanificarPage() {
  const {
    days,
    destinations,
    loading,
    error,
    dismissError,
    addDestination,
    updateDay,
    updateDestination,
    deleteDestination,
  } = useTripData();

  const [formOpen, setFormOpen] = useState(false);
  const [formDefaultDayId, setFormDefaultDayId] = useState<string | null>(null);
  const [formForceSunset, setFormForceSunset] = useState(false);
  const [sunsetPickerDayId, setSunsetPickerDayId] = useState<string | null>(null);
  const [originPickerDayId, setOriginPickerDayId] = useState<string | null>(null);

  const backlog = useMemo(() => destinations.filter((d) => d.day_id === null), [destinations]);
  const byDay = useMemo(() => {
    const map = new Map<string, typeof destinations>();
    for (const day of days) map.set(day.id, []);
    for (const d of destinations) {
      if (d.day_id && map.has(d.day_id)) map.get(d.day_id)!.push(d);
    }
    return map;
  }, [days, destinations]);

  // Centroid of each day's already-assigned stops, used to suggest the
  // geographically closest day for a backlog destination.
  const dayCentroids = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number }>();
    for (const day of days) {
      const c = centroid((byDay.get(day.id) ?? []).map((s) => ({ lat: s.lat, lng: s.lng })));
      if (c) map.set(day.id, c);
    }
    return map;
  }, [days, byDay]);

  function suggestDayFor(point: { lat: number; lng: number }): { day: Day; km: number } | null {
    let best: { day: Day; km: number } | null = null;
    for (const day of days) {
      const c = dayCentroids.get(day.id);
      if (!c) continue;
      const km = haversineKm(point, c);
      if (!best || km < best.km) best = { day, km };
    }
    return best;
  }

  function openAddForm(dayId: string | null = null, forceSunset = false) {
    setFormDefaultDayId(dayId);
    setFormForceSunset(forceSunset);
    setFormOpen(true);
  }

  async function handleMoveToDay(id: string, dayId: string | null) {
    await updateDestination(id, { day_id: dayId });
  }

  async function handleToggleSunset(id: string, isSunsetSpot: boolean) {
    await updateDestination(id, { is_sunset_spot: isSunsetSpot });
  }

  async function handleUpdateCost(id: string, cost: number | null) {
    await updateDestination(id, { estimated_cost: cost });
  }

  async function handleSetOrigin(dayId: string, origin: DayOrigin) {
    await updateDay(dayId, {
      origin_lat: origin?.lat ?? null,
      origin_lng: origin?.lng ?? null,
      origin_label: origin?.label ?? null,
    });
  }

  const sunsetPickerDay = sunsetPickerDayId ? days.find((d) => d.id === sunsetPickerDayId) ?? null : null;
  const originPickerDay = originPickerDayId ? days.find((d) => d.id === originPickerDayId) ?? null : null;

  function dayCostTotal(stops: typeof destinations): number | null {
    const withCost = stops.filter((s) => s.estimated_cost != null);
    if (withCost.length === 0) return null;
    return withCost.reduce((sum, s) => sum + (s.estimated_cost ?? 0), 0);
  }

  const tripCostTotal = dayCostTotal(destinations);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-ink/60">Cargando…</div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
        <Image src="/brand/logo.svg" alt="Sundy" width={120} height={39} className="h-7 w-auto" priority />
      </header>

      {error && <ErrorBanner message={error} onDismiss={dismissError} />}

      <div className="flex flex-col gap-3 p-4">
        <h1 className="text-xl font-black uppercase tracking-tight text-ink pb-2">Planifica tu ruta</h1>
        {days.map((day, index) => {
          const stops = byDay.get(day.id) ?? [];
          const missingSunset = stops.length > 0 && !stops.some((s) => s.is_sunset_spot);
          const dayCost = dayCostTotal(stops);
          return (
            <details key={day.id} className="rounded-md border border-border">
              <summary className="flex cursor-pointer items-center justify-between px-3 py-3 font-bold">
                <span className="flex min-w-0 flex-col items-start gap-0.5">
                  <span>
                    Día {index + 1}{" "}
                    <span className="font-normal text-ink/50">
                      ·{" "}
                      {new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric" }).format(
                        new Date(day.date + "T12:00:00")
                      )}
                    </span>
                  </span>
                  <DayTitleInput day={day} onSave={(title) => updateDay(day.id, { title })} />
                  {dayCost !== null && (
                    <span className="text-xs font-normal text-slate-600 mt-0.5">~${Math.round(dayCost)}</span>
                  )}
                </span>
                <span className="flex items-center gap-2 text-sm font-normal text-ink/50">
                  {missingSunset && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSunsetPickerDayId(day.id);
                      }}
                      aria-label={`Falta sunset spot para ${day.title} — elegir uno`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-warning cursor-pointer"
                    >
                      <TriangleAlert size={16} aria-hidden />
                    </button>
                  )}
                  {stops.length}
                </span>
              </summary>
              <div className="border-t border-border p-3">
                <button
                  onClick={() => setOriginPickerDayId(day.id)}
                  className="mb-3 flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer"
                >
                  <MapPin size={14} aria-hidden />
                  Origen: {day.origin_label ?? "Casa"}
                </button>
                <ul className="flex flex-col gap-2">
                  {stops.length === 0 && <p className="text-sm text-ink/50">Sin destinos asignados.</p>}
                  {stops.map((d) => (
                    <DestinationCard
                      key={d.id}
                      destination={d}
                      days={days}
                      onMoveToDay={handleMoveToDay}
                      onToggleSunset={handleToggleSunset}
                      onUpdateCost={handleUpdateCost}
                      onDelete={deleteDestination}
                    />
                  ))}
                </ul>
              </div>
            </details>
          );
        })}

        <details className="rounded-md border border-border">
          <summary className="flex cursor-pointer items-center justify-between px-3 py-3 font-bold">
            <span>Destinos sin asignar</span>
            <span className="text-sm font-normal text-ink/50">{backlog.length}</span>
          </summary>
          <ul className="flex flex-col gap-2 border-t border-border p-3">
            {backlog.length === 0 && <p className="text-sm text-ink/50">No hay destinos sin asignar.</p>}
            {backlog.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                days={days}
                onMoveToDay={handleMoveToDay}
                onToggleSunset={handleToggleSunset}
                onUpdateCost={handleUpdateCost}
                onDelete={deleteDestination}
                suggestedDay={suggestDayFor(d)}
              />
            ))}
          </ul>
        </details>

        {tripCostTotal !== null && (
          <p className="px-1 text-sm font-semibold text-slate-600">
            Total estimado del viaje: ~${Math.round(tripCostTotal)}
          </p>
        )}
      </div>

      <button
        onClick={() => openAddForm(null, false)}
        aria-label="Agregar destino"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-lg cursor-pointer"
      >
        <Plus size={26} aria-hidden />
      </button>

      {sunsetPickerDay && (
        <SunsetSpotPicker
          day={sunsetPickerDay}
          stops={byDay.get(sunsetPickerDay.id) ?? []}
          onClose={() => setSunsetPickerDayId(null)}
          onMarkExisting={(id) => {
            handleToggleSunset(id, true);
            setSunsetPickerDayId(null);
          }}
          onAddNew={() => {
            const dayId = sunsetPickerDay.id;
            setSunsetPickerDayId(null);
            openAddForm(dayId, true);
          }}
        />
      )}

      {originPickerDay && (
        <DayOriginPicker
          day={originPickerDay}
          onClose={() => setOriginPickerDayId(null)}
          onSelect={(origin) => handleSetOrigin(originPickerDay.id, origin)}
        />
      )}

      <DestinationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        days={days}
        defaultDayId={formDefaultDayId}
        forceSunsetSpot={formForceSunset}
        onAdd={addDestination}
      />
    </div>
  );
}
