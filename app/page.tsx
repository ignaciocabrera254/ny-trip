"use client";

import { useMemo, useState } from "react";
import { Route, ToiletIcon, TriangleAlert } from "lucide-react";
import DynamicTripMap from "@/components/map/DynamicTripMap";
import type { MapStop } from "@/components/map/TripMap";
import DaySelector from "@/components/day/DaySelector";
import StopList from "@/components/day/StopList";
import NearbyRestroomsSheet from "@/components/restrooms/NearbyRestroomsSheet";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { useTripData } from "@/lib/useTripData";
import { optimizeDay, totalRouteKm } from "@/lib/geo/routeOptimize";
import { googleMapsDirectionsUrl } from "@/lib/maps/googleMapsLink";
import { CATEGORY_COLOR, HOME } from "@/lib/types";

function pickDefaultDayId(days: { id: string; date: string }[]): string | null {
  if (days.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const exact = days.find((d) => d.date === today);
  if (exact) return exact.id;
  const upcoming = days.find((d) => d.date >= today);
  return (upcoming ?? days[days.length - 1]).id;
}

export default function HoyPage() {
  const {
    days,
    destinations,
    restrooms,
    loading,
    error,
    dismissError,
    updateDestination,
    reorderDestinations,
  } = useTripData();

  const [manualDayId, setManualDayId] = useState<string | null>(null);
  const [showRestroomLayer, setShowRestroomLayer] = useState(false);
  const [restroomSheetOpen, setRestroomSheetOpen] = useState(false);

  const defaultDayId = useMemo(() => pickDefaultDayId(days), [days]);
  const selectedDayId = manualDayId ?? defaultDayId;

  const dayStops = useMemo(
    () => destinations.filter((d) => d.day_id === selectedDayId),
    [destinations, selectedDayId]
  );

  const hasSunsetSpot = dayStops.some((s) => s.is_sunset_spot);
  const totalKm = totalRouteKm(HOME, dayStops);

  const mapStops: MapStop[] = dayStops.map((s) => ({
    id: s.id,
    position: { lat: s.lat, lng: s.lng },
    label: s.name,
    color: CATEGORY_COLOR[s.category],
    isSunsetSpot: s.is_sunset_spot,
    popup: s.name,
  }));

  async function handleOptimize() {
    if (!selectedDayId) return;
    const optimized = optimizeDay(HOME, dayStops);
    await reorderDestinations(optimized.map((s) => s.id));
  }

  async function handleMove(id: string, direction: "up" | "down") {
    const index = dayStops.findIndex((s) => s.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= dayStops.length) return;
    const reordered = [...dayStops];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await reorderDestinations(reordered.map((s) => s.id));
  }

  const mapCenter = dayStops[0] ? { lat: dayStops[0].lat, lng: dayStops[0].lng } : HOME;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-ink/60">
        Cargando itinerario…
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
        <h1 className="text-lg font-black uppercase tracking-tight">NY Trip Planner</h1>
      </header>

      <DaySelector days={days} selectedDayId={selectedDayId} onSelect={setManualDayId} />

      {error && <ErrorBanner message={error} onDismiss={dismissError} />}

      {dayStops.length > 0 && !hasSunsetSpot && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-md border-2 border-danger bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
          <TriangleAlert size={18} aria-hidden />
          Falta sunset spot para este día
        </div>
      )}

      <div className="relative h-[38vh] w-full shrink-0 border-y border-border">
        <DynamicTripMap
          center={mapCenter}
          origin={HOME}
          stops={mapStops}
          drawRoute
          restrooms={restrooms}
          showRestrooms={showRestroomLayer}
        />
        <button
          onClick={() => setShowRestroomLayer((v) => !v)}
          aria-pressed={showRestroomLayer}
          aria-label="Mostrar u ocultar baños en el mapa"
          className={`absolute right-3 top-3 z-[400] flex h-11 items-center gap-1.5 rounded-full border-2 border-ink px-3 text-xs font-bold uppercase cursor-pointer ${
            showRestroomLayer ? "bg-ink text-paper" : "bg-paper text-ink"
          }`}
        >
          <ToiletIcon size={16} aria-hidden />
          WC
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <p className="text-sm text-ink/70">
          {totalKm.toFixed(1)} km <span className="text-ink/50">aprox. en línea recta</span>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleOptimize}
            disabled={dayStops.length < 2}
            className="flex h-11 items-center gap-1.5 rounded-full border-2 border-ink px-3 text-xs font-bold uppercase disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <Route size={16} aria-hidden />
            Optimizar
          </button>
          {dayStops.length > 0 && (
            <a
              href={googleMapsDirectionsUrl([HOME, ...dayStops.map((s) => ({ lat: s.lat, lng: s.lng }))])}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center rounded-full bg-cta px-4 text-xs font-bold uppercase text-cta-foreground cursor-pointer transition-transform duration-150 active:scale-[0.98]"
            >
              Google Maps
            </a>
          )}
        </div>
      </div>

      <StopList
        stops={dayStops}
        onToggleVisited={(id, visited) => updateDestination(id, { visited })}
        onMove={handleMove}
      />

      <button
        onClick={() => setRestroomSheetOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-cta px-5 font-bold text-cta-foreground shadow-lg cursor-pointer"
      >
        <ToiletIcon size={20} aria-hidden />
        Baños cerca
      </button>

      {restroomSheetOpen && (
        <NearbyRestroomsSheet
          onClose={() => setRestroomSheetOpen(false)}
          restrooms={restrooms}
        />
      )}
    </div>
  );
}
