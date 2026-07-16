"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so it can only load client-side.
const DynamicTripMap = dynamic(() => import("@/components/map/TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-bold uppercase tracking-wide text-ink/60">
      Cargando mapa…
    </div>
  ),
});

export default DynamicTripMap;
