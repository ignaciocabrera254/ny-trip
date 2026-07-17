"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";
import PlacePicker from "@/components/planning/PlacePicker";
import { PORT_AUTHORITY, type Day, type LatLng } from "@/lib/types";

export type DayOrigin = { lat: number; lng: number; label: string } | null;

type Props = {
  day: Day;
  onClose: () => void;
  /** null = reset to home (the default fallback). */
  onSelect: (origin: DayOrigin) => void;
};

export default function DayOriginPicker({ day, onClose, onSelect }: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customPoint, setCustomPoint] = useState<LatLng | null>(null);
  const [customName, setCustomName] = useState("");

  function pick(origin: DayOrigin) {
    onSelect(origin);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Cerrar" onClick={onClose} className="backdrop-button absolute inset-0 bg-ink/50 cursor-pointer" />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border-t-2 border-ink bg-paper p-5 pb-8 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide">Origen del día</h2>
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

        {!customMode ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                pick({ lat: PORT_AUTHORITY.lat, lng: PORT_AUTHORITY.lng, label: "Port Authority Bus Terminal" })
              }
              className="flex items-center gap-2 rounded-md border border-border p-3 text-left text-sm font-semibold cursor-pointer hover:border-ink"
            >
              <MapPin size={18} aria-hidden className="shrink-0 text-ink/50" />
              Port Authority Bus Terminal
            </button>
            <button
              onClick={() => pick(null)}
              className="flex items-center gap-2 rounded-md border border-border p-3 text-left text-sm font-semibold cursor-pointer hover:border-ink"
            >
              <MapPin size={18} aria-hidden className="shrink-0 text-ink/50" />
              Casa (1180 Summit Ave)
            </button>
            <button
              onClick={() => setCustomMode(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-full border-2 border-ink text-sm font-bold uppercase cursor-pointer"
            >
              Personalizado
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <PlacePicker
              value={customPoint}
              onChange={(point, suggestedName) => {
                setCustomPoint(point);
                setCustomName(suggestedName);
              }}
            />

            {customPoint && (
              <>
                <label className="flex flex-col gap-1 text-sm font-semibold">
                  Nombre del origen
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="h-11 rounded-md border border-border px-3 text-base font-normal"
                  />
                </label>
                <button
                  onClick={() =>
                    pick({ lat: customPoint.lat, lng: customPoint.lng, label: customName.trim() || "Personalizado" })
                  }
                  className="h-12 rounded-full bg-cta font-bold uppercase text-cta-foreground cursor-pointer"
                >
                  Usar este origen
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
