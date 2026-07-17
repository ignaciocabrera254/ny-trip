"use client";

import { useState } from "react";
import { ExternalLink, Navigation, Pencil, Plus, Trash2, X } from "lucide-react";
import PlacePicker from "@/components/planning/PlacePicker";
import { googleMapsWalkingUrl } from "@/lib/maps/googleMapsLink";
import {
  TIP_CATEGORY_COLOR,
  TIP_CATEGORY_ICON,
  TIP_CATEGORY_LABEL,
  type Destination,
  type DestinationTip,
  type LatLng,
  type TipCategory,
} from "@/lib/types";

const TIP_CATEGORIES = Object.keys(TIP_CATEGORY_LABEL) as TipCategory[];

type Props = {
  destination: Destination;
  tips: DestinationTip[];
  onClose: () => void;
  onAdd: (input: Omit<DestinationTip, "id" | "sort_order">) => Promise<void>;
  onUpdate: (id: string, patch: Partial<DestinationTip>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function TipsSheet({ destination, tips, onClose, onAdd, onUpdate, onDelete }: Props) {
  // `editingTip === undefined` → list view. `null` → new-tip form. A tip → editing that tip.
  const [editingTip, setEditingTip] = useState<DestinationTip | null | undefined>(undefined);
  const [category, setCategory] = useState<TipCategory>("otro");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [point, setPoint] = useState<LatLng | null>(null);
  const [noLocation, setNoLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  function openForm(tip: DestinationTip | null) {
    setEditingTip(tip);
    setCategory(tip?.category ?? "otro");
    setName(tip?.name ?? "");
    setNotes(tip?.notes ?? "");
    setLink(tip?.link ?? "");
    setPoint(tip?.lat != null && tip?.lng != null ? { lat: tip.lat, lng: tip.lng } : null);
    setNoLocation(!!tip && tip.lat == null);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        category,
        name: name.trim(),
        notes: notes.trim() || null,
        lat: noLocation ? null : point?.lat ?? null,
        lng: noLocation ? null : point?.lng ?? null,
        link: link.trim() || null,
      };
      if (editingTip) {
        await onUpdate(editingTip.id, payload);
      } else {
        await onAdd({ destination_id: destination.id, ...payload });
      }
      setEditingTip(undefined);
    } finally {
      setSaving(false);
    }
  }

  const grouped = TIP_CATEGORIES.map((c) => ({ category: c, items: tips.filter((t) => t.category === c) })).filter(
    (g) => g.items.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Cerrar" onClick={onClose} className="backdrop-button absolute inset-0 bg-ink/50 cursor-pointer" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border-t-2 border-ink bg-paper p-5 pb-8 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide">Tips</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink cursor-pointer"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <p className="mb-4 truncate text-sm text-ink/70">{destination.name}</p>

        {editingTip === undefined ? (
          <>
            <div className="flex flex-col gap-4">
              {grouped.length === 0 && (
                <p className="text-sm text-ink/50">Todavía no hay tips para este destino.</p>
              )}
              {grouped.map((g) => (
                <div key={g.category}>
                  <p
                    className="mb-2 text-xs font-bold uppercase tracking-wide"
                    style={{ color: TIP_CATEGORY_COLOR[g.category] }}
                  >
                    {TIP_CATEGORY_ICON[g.category]} {TIP_CATEGORY_LABEL[g.category]}
                  </p>
                  <div className="flex flex-col gap-2">
                    {g.items.map((tip) => (
                      <div key={tip.id} className="flex items-start justify-between gap-2 rounded-md border border-border p-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{tip.name}</p>
                          {tip.notes && <p className="truncate text-sm text-ink/60">{tip.notes}</p>}
                          {tip.link && (
                            <a
                              href={tip.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm underline"
                            >
                              <ExternalLink size={12} aria-hidden /> Link
                            </a>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {tip.lat != null && tip.lng != null && (
                            <a
                              href={googleMapsWalkingUrl({ lat: tip.lat, lng: tip.lng })}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Ir a ${tip.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-border cursor-pointer"
                            >
                              <Navigation size={14} aria-hidden />
                            </a>
                          )}
                          <button
                            onClick={() => openForm(tip)}
                            aria-label={`Editar ${tip.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/50 hover:text-ink cursor-pointer"
                          >
                            <Pencil size={14} aria-hidden />
                          </button>
                          <button
                            onClick={() => onDelete(tip.id)}
                            aria-label={`Eliminar ${tip.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/50 hover:text-danger cursor-pointer"
                          >
                            <Trash2 size={14} aria-hidden />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => openForm(null)}
              className="mt-4 flex h-11 items-center justify-center gap-2 rounded-full border-2 border-ink text-sm font-bold uppercase cursor-pointer"
            >
              <Plus size={16} aria-hidden />
              Agregar tip
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {TIP_CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="rounded-full border-2 px-3 py-1.5 text-xs font-bold uppercase cursor-pointer"
                    style={
                      active
                        ? { borderColor: TIP_CATEGORY_COLOR[c], background: TIP_CATEGORY_COLOR[c], color: "#fff" }
                        : { borderColor: "var(--border)", color: "var(--text-primary)" }
                    }
                  >
                    {TIP_CATEGORY_ICON[c]} {TIP_CATEGORY_LABEL[c]}
                  </button>
                );
              })}
            </div>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Nombre
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-md border border-border px-3 text-base font-normal"
              />
            </label>

            {!noLocation && (
              <PlacePicker
                value={point}
                onChange={(p, suggestedName) => {
                  setPoint(p);
                  if (!name.trim()) setName(suggestedName);
                }}
              />
            )}
            <button
              onClick={() => {
                setNoLocation((v) => !v);
                setPoint(null);
              }}
              className="self-start text-sm font-semibold underline cursor-pointer"
            >
              {noLocation ? "Agregar ubicación" : "Sin ubicación específica"}
            </button>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Notas (opcional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="rounded-md border border-border p-3 text-base font-normal"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Link (opcional)
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://"
                className="h-11 rounded-md border border-border px-3 text-base font-normal"
              />
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingTip(undefined)}
                className="h-12 flex-1 rounded-full border-2 border-ink text-sm font-bold uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="h-12 flex-1 rounded-full bg-cta font-bold uppercase text-cta-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? "Guardando…" : "Guardar tip"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
