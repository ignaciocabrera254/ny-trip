"use client";

import { useState } from "react";
import Image from "next/image";
import { ClipboardList } from "lucide-react";
import ErrorBanner from "@/components/ui/ErrorBanner";
import TipsSheet from "@/components/planning/TipsSheet";
import CategoryBullet from "@/components/ui/CategoryBullet";
import { useTripData } from "@/lib/useTripData";

export default function DestinosPage() {
  const {
    destinations,
    tips,
    loading,
    error,
    dismissError,
    addTip,
    updateTip,
    deleteTip,
  } = useTripData();

  const [tipsStopId, setTipsStopId] = useState<string | null>(null);
  const tipsStop = destinations.find((s) => s.id === tipsStopId) ?? null;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-ink/60">Cargando…</div>
    );
  }

  const sortedDestinations = [...destinations].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col pb-24">
      <header className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
        <Image src="/brand/logo.svg" alt="Sundy" width={120} height={39} className="h-7 w-auto" priority />
      </header>

      {error && <ErrorBanner message={error} onDismiss={dismissError} />}

      <div className="flex flex-col gap-3 p-4">
        <h1 className="text-xl font-black uppercase tracking-tight text-ink pb-2">Tus Destinos</h1>
        
        {sortedDestinations.length === 0 ? (
          <p className="text-sm text-ink/50">Aún no has agregado destinos. Ve a la pestaña Planificar para empezar.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sortedDestinations.map((d) => {
              const destTips = tips.filter((t) => t.destination_id === d.id);
              return (
                <li key={d.id} className="flex flex-col gap-2 rounded-md border border-border p-3 bg-paper">
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">{d.name}</p>
                    <CategoryBullet category={d.category} />
                    {d.notes && <p className="mt-1 truncate text-sm text-ink/60">{d.notes}</p>}
                  </div>
                  <button
                    onClick={() => setTipsStopId(d.id)}
                    className="mt-1 flex h-9 items-center gap-1.5 self-start rounded-full border border-border px-3 text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    <ClipboardList size={14} aria-hidden />
                    {destTips.length > 0 ? `Tips (${destTips.length})` : "Agregar tips"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {tipsStop && (
        <TipsSheet
          destination={tipsStop}
          tips={tips.filter((t) => t.destination_id === tipsStop.id)}
          onClose={() => setTipsStopId(null)}
          onAdd={addTip}
          onUpdate={updateTip}
          onDelete={deleteTip}
        />
      )}
    </div>
  );
}
