"use client";

import { useEffect, useState } from "react";
import { X, Navigation, LoaderCircle } from "lucide-react";
import { haversineKm } from "@/lib/geo/haversine";
import { googleMapsWalkingUrl } from "@/lib/maps/googleMapsLink";
import type { Restroom } from "@/lib/types";

type Props = {
  onClose: () => void;
  restrooms: Restroom[];
};

type RestroomWithDistance = Restroom & { meters: number };

const hasGeolocation = typeof navigator !== "undefined" && "geolocation" in navigator;

/** Mount this only while the sheet is open (`{open && <NearbyRestroomsSheet .../>}`)
 * so each open is a fresh mount and the geolocation lookup starts immediately. */
export default function NearbyRestroomsSheet({ onClose, restrooms }: Props) {
  const [status, setStatus] = useState<"loading" | "error" | "done">(
    hasGeolocation ? "loading" : "error"
  );
  const [nearest, setNearest] = useState<RestroomWithDistance[]>([]);

  useEffect(() => {
    if (!hasGeolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const withDistance = restrooms
          .map((r) => ({ ...r, meters: Math.round(haversineKm(here, r) * 1000) }))
          .sort((a, b) => a.meters - b.meters)
          .slice(0, 5);
        setNearest(withDistance);
        setStatus("done");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="backdrop-button absolute inset-0 bg-ink/50 cursor-pointer"
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border-t-2 border-ink bg-paper p-5 pb-8 max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide">Baños cerca</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar baños cercanos"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink cursor-pointer"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-2 py-8 text-ink/70">
            <LoaderCircle className="animate-spin" size={20} aria-hidden />
            <span>Buscando tu ubicación…</span>
          </div>
        )}

        {status === "error" && (
          <p className="py-8 text-ink/70">
            No pudimos acceder a tu ubicación. Revisa los permisos de localización del
            navegador e intenta de nuevo.
          </p>
        )}

        {status === "done" && nearest.length === 0 && (
          <p className="py-8 text-ink/70">No hay baños cargados todavía.</p>
        )}

        {status === "done" && nearest.length > 0 && (
          <ul className="flex flex-col gap-3">
            {nearest.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{r.name}</p>
                  <p className="text-sm text-ink/60">
                    {r.meters} m · {r.source === "official" ? "Oficial (NYC)" : "Personal"}
                  </p>
                  {r.notes && <p className="text-sm text-ink/60">{r.notes}</p>}
                </div>
                <a
                  href={googleMapsWalkingUrl(r)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-cta px-4 text-sm font-bold text-cta-foreground cursor-pointer transition-transform duration-150 active:scale-[0.98]"
                >
                  <Navigation size={16} aria-hidden />
                  Ir
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
