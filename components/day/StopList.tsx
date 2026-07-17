import { Check, ChevronDown, ChevronUp, TriangleAlert } from "lucide-react";
import { haversineKm } from "@/lib/geo/haversine";
import { walkingMinutes } from "@/lib/geo/walking";
import { formatMinutes, parseHHMM } from "@/lib/geo/scheduleEstimate";
import { googleMapsTransitUrl } from "@/lib/maps/googleMapsLink";
import { CATEGORY_COLOR } from "@/lib/types";
import type { Destination } from "@/lib/types";

const TRANSIT_HINT_KM = 2.5;

type Props = {
  stops: Destination[];
  onToggleVisited: (id: string, visited: boolean) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  /** Estimated arrival time (minutes since midnight) per stop, index-aligned. */
  arrivalMinutes?: number[];
};

export default function StopList({ stops, onToggleVisited, onMove, arrivalMinutes }: Props) {
  if (stops.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-ink/60">
        Este día todavía no tiene destinos. Agrégalos desde &quot;Planificar&quot;.
      </p>
    );
  }

  return (
    <ol className="flex flex-col px-4 pb-4">
      {stops.map((stop, index) => {
        const next = stops[index + 1];
        const segmentKm = next ? haversineKm(stop, next) : null;
        return (
          <li key={stop.id} className="flex flex-col">
            <div
              className={`flex items-center gap-3 rounded-md border border-border p-3 ${
                stop.visited ? "opacity-50" : ""
              }`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-bold text-white"
                style={{ backgroundColor: CATEGORY_COLOR[stop.is_sunset_spot ? "sunset" : stop.category] }}
                aria-hidden
              >
                {stop.is_sunset_spot ? "★" : index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-tight">{stop.name}</p>
                {stop.notes && <p className="truncate text-sm text-ink/60">{stop.notes}</p>}
                {stop.closes_at &&
                  arrivalMinutes?.[index] !== undefined &&
                  arrivalMinutes[index] > parseHHMM(stop.closes_at) && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-warning">
                      <TriangleAlert size={12} aria-hidden />
                      Podría estar cerrado (llegada estimada ~{formatMinutes(arrivalMinutes[index])}, cierra{" "}
                      {stop.closes_at.slice(0, 5)})
                    </p>
                  )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onMove(stop.id, "up")}
                  disabled={index === 0}
                  aria-label={`Mover ${stop.name} antes`}
                  className="flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronUp size={20} aria-hidden />
                </button>
                <button
                  onClick={() => onMove(stop.id, "down")}
                  disabled={index === stops.length - 1}
                  aria-label={`Mover ${stop.name} después`}
                  className="flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronDown size={20} aria-hidden />
                </button>
                <button
                  onClick={() => onToggleVisited(stop.id, !stop.visited)}
                  aria-pressed={stop.visited}
                  aria-label={stop.visited ? `Marcar ${stop.name} como pendiente` : `Marcar ${stop.name} como visitado`}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 cursor-pointer transition-colors duration-150 ${
                    stop.visited ? "border-ink bg-ink text-paper" : "border-border text-transparent"
                  }`}
                >
                  <Check size={20} aria-hidden />
                </button>
              </div>
            </div>

            {segmentKm !== null && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 pl-3 text-xs text-ink/60">
                <span>
                  ↓ {segmentKm.toFixed(1)} km · ~{Math.round(walkingMinutes(segmentKm))} min a pie
                </span>
                {segmentKm > TRANSIT_HINT_KM && (
                  <>
                    <span className="font-semibold text-warning">considera subway/bus</span>
                    <a
                      href={googleMapsTransitUrl(stop, next)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline"
                    >
                      Ver en transporte público
                    </a>
                  </>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
