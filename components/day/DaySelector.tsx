import type { Day } from "@/lib/types";

type Props = {
  days: Day[];
  selectedDayId: string | null;
  onSelect: (dayId: string) => void;
};

const WEEKDAY = new Intl.DateTimeFormat("es", { weekday: "short" });
const DAY_NUM = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });

// Same "today" definition pickDefaultDayId() uses, so the dot always lands on
// whichever day that auto-selection logic would also pick.
const TODAY = new Date().toISOString().slice(0, 10);

export default function DaySelector({ days, selectedDayId, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Seleccionar día"
      className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {days.map((day) => {
        const date = new Date(`${day.date}T12:00:00`);
        const selected = day.id === selectedDayId;
        const isToday = day.date === TODAY;
        return (
          <button
            key={day.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(day.id)}
            className={`relative flex min-w-20 shrink-0 flex-col items-center rounded-md border-2 px-3 py-2 cursor-pointer transition-colors duration-150 ${
              selected
                ? "border-amber-500 bg-amber-500 text-amber-900"
                : isToday
                  ? "border-amber-500 bg-paper text-ink"
                  : "border-border bg-paper text-ink hover:border-ink/50"
            }`}
          >
            {isToday && (
              <span
                className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-paper bg-amber-500"
                aria-hidden
              />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              {WEEKDAY.format(date)}
              {isToday && <span className="sr-only"> (hoy)</span>}
            </span>
            <span className="text-sm font-bold">{DAY_NUM.format(date)}</span>
            {day.title && (
              <span className="max-w-[72px] truncate text-[9px] font-semibold uppercase tracking-wide opacity-60">
                {day.title}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
