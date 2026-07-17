"use client";

import { Plus, Star, X } from "lucide-react";
import type { Day, Destination } from "@/lib/types";

type Props = {
  day: Day;
  stops: Destination[];
  onClose: () => void;
  onMarkExisting: (id: string) => void;
  onAddNew: () => void;
};

export default function SunsetSpotPicker({ day, stops, onClose, onMarkExisting, onAddNew }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Cerrar" onClick={onClose} className="backdrop-button absolute inset-0 bg-ink/50 cursor-pointer" />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border-t-2 border-ink bg-paper p-5 pb-8 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide">Elegir sunset spot</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink cursor-pointer"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <p className="mb-3 text-sm text-ink/70">
          {day.title} — {day.date}
        </p>

        <div className="flex flex-col gap-2">
          {stops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => onMarkExisting(stop.id)}
              className="flex items-center justify-between gap-2 rounded-md border border-border p-3 text-left cursor-pointer hover:border-ink"
            >
              <span className="truncate font-semibold">{stop.name}</span>
              <Star size={18} aria-hidden />
            </button>
          ))}

          <button
            onClick={onAddNew}
            className="flex h-11 items-center justify-center gap-2 rounded-full border-2 border-ink text-sm font-bold uppercase cursor-pointer"
          >
            <Plus size={16} aria-hidden />
            Agregar nuevo destino de sunset
          </button>
        </div>
      </div>
    </div>
  );
}
