"use client";

import { useMemo, useState } from "react";
import { Plus, TriangleAlert } from "lucide-react";
import DestinationCard from "@/components/planning/DestinationCard";
import DestinationForm from "@/components/planning/DestinationForm";
import { useTripData } from "@/lib/useTripData";

export default function PlanificarPage() {
  const {
    days,
    destinations,
    loading,
    addDestination,
    updateDestination,
    deleteDestination,
  } = useTripData();

  const [formOpen, setFormOpen] = useState(false);

  const backlog = useMemo(() => destinations.filter((d) => d.day_id === null), [destinations]);
  const byDay = useMemo(() => {
    const map = new Map<string, typeof destinations>();
    for (const day of days) map.set(day.id, []);
    for (const d of destinations) {
      if (d.day_id && map.has(d.day_id)) map.get(d.day_id)!.push(d);
    }
    return map;
  }, [days, destinations]);

  async function handleMoveToDay(id: string, dayId: string | null) {
    await updateDestination(id, { day_id: dayId });
  }

  async function handleToggleSunset(id: string, isSunsetSpot: boolean) {
    await updateDestination(id, { is_sunset_spot: isSunsetSpot });
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-ink/60">Cargando…</div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
        <h1 className="text-lg font-black uppercase tracking-tight">Planificar</h1>
      </header>

      <div className="flex flex-col gap-3 p-4">
        {days.map((day) => {
          const stops = byDay.get(day.id) ?? [];
          const missingSunset = stops.length > 0 && !stops.some((s) => s.is_sunset_spot);
          return (
            <details key={day.id} className="rounded-md border border-border" open={stops.length > 0}>
              <summary className="flex cursor-pointer items-center justify-between px-3 py-3 font-bold">
                <span>
                  {day.title} <span className="font-normal text-ink/50">— {day.date}</span>
                </span>
                <span className="flex items-center gap-2 text-sm font-normal text-ink/50">
                  {missingSunset && <TriangleAlert size={16} className="text-danger" aria-label="Falta sunset spot" />}
                  {stops.length}
                </span>
              </summary>
              <ul className="flex flex-col gap-2 border-t border-border p-3">
                {stops.length === 0 && <p className="text-sm text-ink/50">Sin destinos asignados.</p>}
                {stops.map((d) => (
                  <DestinationCard
                    key={d.id}
                    destination={d}
                    days={days}
                    onMoveToDay={handleMoveToDay}
                    onToggleSunset={handleToggleSunset}
                    onDelete={deleteDestination}
                  />
                ))}
              </ul>
            </details>
          );
        })}

        <details className="rounded-md border border-border" open={backlog.length > 0}>
          <summary className="flex cursor-pointer items-center justify-between px-3 py-3 font-bold">
            <span>Backlog</span>
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
                onDelete={deleteDestination}
              />
            ))}
          </ul>
        </details>
      </div>

      <button
        onClick={() => setFormOpen(true)}
        aria-label="Agregar destino"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-lg cursor-pointer"
      >
        <Plus size={26} aria-hidden />
      </button>

      <DestinationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        days={days}
        defaultDayId={null}
        onAdd={addDestination}
      />
    </div>
  );
}
