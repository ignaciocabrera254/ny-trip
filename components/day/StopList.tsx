import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_COLOR } from "@/lib/types";
import type { Destination } from "@/lib/types";

type Props = {
  stops: Destination[];
  onToggleVisited: (id: string, visited: boolean) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

export default function StopList({ stops, onToggleVisited, onMove }: Props) {
  if (stops.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-ink/60">
        Este día todavía no tiene destinos. Agrégalos desde &quot;Planificar&quot;.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2 px-4 pb-4">
      {stops.map((stop, index) => (
        <li
          key={stop.id}
          className={`flex items-center gap-3 rounded-md border border-border p-3 ${
            stop.visited ? "opacity-50" : ""
          }`}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-bold text-white"
            style={{ backgroundColor: stop.is_sunset_spot ? "#FCCC0A" : CATEGORY_COLOR[stop.category] }}
            aria-hidden
          >
            {stop.is_sunset_spot ? "★" : index + 1}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">{stop.name}</p>
            {stop.notes && <p className="truncate text-sm text-ink/60">{stop.notes}</p>}
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
        </li>
      ))}
    </ol>
  );
}
