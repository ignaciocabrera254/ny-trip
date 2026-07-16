import type { Day } from "@/lib/types";

type Props = {
  days: Day[];
  selectedDayId: string | null;
  onSelect: (dayId: string) => void;
};

const WEEKDAY = new Intl.DateTimeFormat("es", { weekday: "short" });
const DAY_NUM = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });

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
        return (
          <button
            key={day.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(day.id)}
            className={`flex min-w-20 shrink-0 flex-col items-center rounded-md border-2 px-3 py-2 cursor-pointer transition-colors duration-150 ${
              selected
                ? "border-ink bg-ink text-paper"
                : "border-border bg-paper text-ink hover:border-ink/50"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              {WEEKDAY.format(date)}
            </span>
            <span className="text-sm font-bold">{DAY_NUM.format(date)}</span>
          </button>
        );
      })}
    </div>
  );
}
