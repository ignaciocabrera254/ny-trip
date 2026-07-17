import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import CategoryBullet from "@/components/ui/CategoryBullet";
import type { Day, Destination } from "@/lib/types";

type Props = {
  destination: Destination;
  days: Day[];
  onMoveToDay: (id: string, dayId: string | null) => void;
  onToggleSunset: (id: string, isSunsetSpot: boolean) => void;
  onDelete: (id: string) => void;
  /** Geographically closest day, offered only for unassigned (backlog) destinations. */
  suggestedDay?: { day: Day; km: number } | null;
};

export default function DestinationCard({
  destination,
  days,
  onMoveToDay,
  onToggleSunset,
  onDelete,
  suggestedDay,
}: Props) {
  const [showSuggestion, setShowSuggestion] = useState(false);

  return (
    <li className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        {suggestedDay ? (
          <button
            onClick={() => setShowSuggestion((v) => !v)}
            aria-expanded={showSuggestion}
            className="min-w-0 flex-1 cursor-pointer text-left"
          >
            <p className="truncate font-semibold leading-tight">{destination.name}</p>
            <CategoryBullet category={destination.category} />
            {destination.notes && (
              <p className="mt-1 truncate text-sm text-ink/60">{destination.notes}</p>
            )}
          </button>
        ) : (
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{destination.name}</p>
            <CategoryBullet category={destination.category} />
            {destination.notes && (
              <p className="mt-1 truncate text-sm text-ink/60">{destination.notes}</p>
            )}
          </div>
        )}
        <button
          onClick={() => onDelete(destination.id)}
          aria-label={`Eliminar ${destination.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink/50 hover:text-danger cursor-pointer"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>

      {suggestedDay && showSuggestion && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <span className="text-ink/70">
            Sugerido: <span className="font-semibold text-ink">{suggestedDay.day.title}</span> —{" "}
            {suggestedDay.day.date}
          </span>
          <button
            onClick={() => onMoveToDay(destination.id, suggestedDay.day.id)}
            className="shrink-0 rounded-full bg-cta px-3 py-1.5 text-xs font-bold uppercase text-cta-foreground cursor-pointer"
          >
            Asignar
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <select
          value={destination.day_id ?? "backlog"}
          onChange={(e) =>
            onMoveToDay(destination.id, e.target.value === "backlog" ? null : e.target.value)
          }
          className="h-11 flex-1 rounded-md border border-border bg-paper px-2 text-sm cursor-pointer"
          aria-label={`Día asignado a ${destination.name}`}
        >
          <option value="backlog">Sin asignar</option>
          {days.map((day) => (
            <option key={day.id} value={day.id}>
              {day.title} — {day.date}
            </option>
          ))}
        </select>

        <button
          onClick={() => onToggleSunset(destination.id, !destination.is_sunset_spot)}
          aria-pressed={destination.is_sunset_spot}
          aria-label={
            destination.is_sunset_spot
              ? `Quitar ${destination.name} como sunset spot`
              : `Marcar ${destination.name} como sunset spot`
          }
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 cursor-pointer ${
            destination.is_sunset_spot
              ? "border-line-sunset bg-line-sunset text-ink"
              : "border-border text-ink/40"
          }`}
        >
          <Star size={18} aria-hidden fill={destination.is_sunset_spot ? "currentColor" : "none"} />
        </button>
      </div>
    </li>
  );
}
