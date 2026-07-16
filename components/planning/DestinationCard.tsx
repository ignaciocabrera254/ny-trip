import { Star, Trash2 } from "lucide-react";
import CategoryBullet from "@/components/ui/CategoryBullet";
import type { Day, Destination } from "@/lib/types";

type Props = {
  destination: Destination;
  days: Day[];
  onMoveToDay: (id: string, dayId: string | null) => void;
  onToggleSunset: (id: string, isSunsetSpot: boolean) => void;
  onDelete: (id: string) => void;
};

export default function DestinationCard({
  destination,
  days,
  onMoveToDay,
  onToggleSunset,
  onDelete,
}: Props) {
  return (
    <li className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{destination.name}</p>
          <CategoryBullet category={destination.category} />
          {destination.notes && (
            <p className="mt-1 truncate text-sm text-ink/60">{destination.notes}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(destination.id)}
          aria-label={`Eliminar ${destination.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink/50 hover:text-danger cursor-pointer"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>

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
