"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Route, ToiletIcon, TriangleAlert, Home } from "lucide-react";
import DynamicTripMap from "@/components/map/DynamicTripMap";
import type { MapStop } from "@/components/map/TripMap";
import DaySelector from "@/components/day/DaySelector";
import StopList from "@/components/day/StopList";
import NearbyRestroomsSheet from "@/components/restrooms/NearbyRestroomsSheet";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { useTripData } from "@/lib/useTripData";
import { optimizeDay, totalRouteKm } from "@/lib/geo/routeOptimize";
import { haversineKm } from "@/lib/geo/haversine";
import { departureDeadline, formatNyTime, sunsetTimeFor } from "@/lib/geo/sunset";
import { estimateArrivals, parseHHMM } from "@/lib/geo/scheduleEstimate";
import { googleMapsDirectionsUrl, googleMapsTransitUrl } from "@/lib/maps/googleMapsLink";
import { fetchDailyWeather, type DailyWeather } from "@/lib/weather/openMeteo";
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
    loadRestrooms,
    loading,
    error,
    dismissError,
    updateDestination,
    reorderDestinations,
  } = useTripData();

  const [manualDayId, setManualDayId] = useState<string | null>(null);
  const [showRestroomLayer, setShowRestroomLayer] = useState(false);
  const [restroomSheetOpen, setRestroomSheetOpen] = useState(false);
  const [dayStartTime, setDayStartTime] = useState("10:00");
  const [weather, setWeather] = useState<DailyWeather | null>(null);

  const defaultDayId = useMemo(() => pickDefaultDayId(days), [days]);
  const selectedDayId = manualDayId ?? defaultDayId;

  const dayStops = useMemo(
    () => destinations.filter((d) => d.day_id === selectedDayId),
    [destinations, selectedDayId]
  );

  const hasSunsetSpot = dayStops.some((s) => s.is_sunset_spot);
  const totalKm = totalRouteKm(HOME, dayStops);
  const stopsWithCost = dayStops.filter((s) => s.estimated_cost != null);
  const dayCostTotal =
    stopsWithCost.length > 0
      ? stopsWithCost.reduce((sum, s) => sum + (s.estimated_cost ?? 0), 0)
      : null;

  const selectedDay = days.find((d) => d.id === selectedDayId);

  const sunsetInfo = useMemo(() => {
    if (!selectedDay) return null;
    const sunsetIndex = dayStops.findIndex((s) => s.is_sunset_spot);
    if (sunsetIndex === -1) return null;
    const spot = dayStops[sunsetIndex];
    const sunsetAt = sunsetTimeFor(selectedDay.date, spot);
    const from = sunsetIndex > 0 ? dayStops[sunsetIndex - 1] : HOME;
    const fromLabel = sunsetIndex > 0 ? dayStops[sunsetIndex - 1].name : "casa";
    const deadline = departureDeadline(sunsetAt, haversineKm(from, spot));
    return { sunsetAt, deadline, fromLabel };
  }, [selectedDay, dayStops]);

  useEffect(() => {
    let cancelled = false;
    setWeather(null);
    if (!selectedDay) return;
    fetchDailyWeather(selectedDay.date).then((w) => {
      if (!cancelled) setWeather(w);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDay]);

  const arrivalMinutes = useMemo(
    () => estimateArrivals(HOME, dayStops, parseHHMM(dayStartTime)),
    [dayStops, dayStartTime]
  );

  const mapStops: MapStop[] = dayStops.map((s) => ({
    id: s.id,
    position: { lat: s.lat, lng: s.lng },
    label: s.name,
    color: CATEGORY_COLOR[s.category],
    isSunsetSpot: s.is_sunset_spot,
    visited: s.visited,
    popup: s.name,
  }));

  const visitedCount = dayStops.filter((s) => s.visited).length;

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

  function handleGoHome() {
    const open = (origin: { lat: number; lng: number } | null) =>
      window.open(googleMapsTransitUrl(origin, HOME), "_blank", "noopener,noreferrer");

    if (!("geolocation" in navigator)) {
      open(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => open({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => open(null),
      { timeout: 8000 }
    );
  }

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
        <Image src="/brand/logo.svg" alt="Sundy" width={120} height={39} className="h-7 w-auto" priority />
        <div className="flex items-center gap-2">
          {weather && (
            <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-semibold">
              ☀️ {Math.round(weather.maxTempC)}°C · 🌧️ {Math.round(weather.rainChancePct)}%
            </span>
          )}
          <button
            onClick={() => {
              loadRestrooms();
              setRestroomSheetOpen(true);
            }}
            aria-label="Baños cerca"
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink cursor-pointer hover:bg-muted transition-all active:scale-95"
          >
            <ToiletIcon size={16} aria-hidden />
          </button>
          <button
            onClick={handleGoHome}
            aria-label="A casa"
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink cursor-pointer hover:bg-muted transition-all active:scale-95"
          >
            <Home size={16} aria-hidden />
          </button>
        </div>
      </header>

      <DaySelector days={days} selectedDayId={selectedDayId} onSelect={setManualDayId} />

      {error && <ErrorBanner message={error} onDismiss={dismissError} />}

      {dayStops.length > 0 && !hasSunsetSpot && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-md border-2 border-warning bg-warning/10 px-3 py-2 text-sm font-semibold text-warning">
          <TriangleAlert size={18} aria-hidden />
          Falta sunset spot para este día
        </div>
      )}

      {sunsetInfo && (
        <div className="mx-4 mb-2 flex flex-col gap-1 rounded-md border-2 border-amber-500 bg-amber-50 px-3 py-2 text-sm">
          <span className="font-semibold">🌇 Atardecer: {formatNyTime(sunsetInfo.sunsetAt)}</span>
          <span className="text-ink/70">
            Sal de {sunsetInfo.fromLabel} antes de las {formatNyTime(sunsetInfo.deadline)} para llegar al
            atardecer
          </span>
        </div>
      )}

      <div className="relative h-[30vh] w-full shrink-0 border-y border-border">
        <DynamicTripMap
          center={mapCenter}
          origin={HOME}
          stops={mapStops}
          drawRoute
          restrooms={restrooms}
          showRestrooms={showRestroomLayer}
        />
        <button
          onClick={() => {
            loadRestrooms();
            setShowRestroomLayer((v) => !v);
          }}
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
          {dayCostTotal !== null && (
            <span className="text-slate-600"> · 💵 ~${Math.round(dayCostTotal)} estimado</span>
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleOptimize}
            disabled={dayStops.length < 2}
            className="flex h-11 items-center gap-1.5 rounded-full border-2 border-amber-500 px-3 text-xs font-bold uppercase text-amber-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
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

      {dayStops.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 text-sm text-ink/70">
          <span className="shrink-0 font-semibold">
            {visitedCount} de {dayStops.length} visitados
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-cta transition-[width] duration-300"
              style={{ width: `${(visitedCount / dayStops.length) * 100}%` }}
            />
          </div>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink/50">
            Inicio
            <input
              type="time"
              value={dayStartTime}
              onChange={(e) => setDayStartTime(e.target.value)}
              className="rounded border border-border px-1 py-0.5 text-xs text-ink"
            />
          </label>
        </div>
      )}

      <StopList
        stops={dayStops}
        onToggleVisited={(id, visited) => updateDestination(id, { visited })}
        onMove={handleMove}
        arrivalMinutes={arrivalMinutes}
      />



      {restroomSheetOpen && (
        <NearbyRestroomsSheet
          onClose={() => setRestroomSheetOpen(false)}
          restrooms={restrooms}
        />
      )}
    </div>
  );
}
