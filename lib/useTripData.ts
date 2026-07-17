import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { queuePatch } from "@/lib/offline/queue";
import type { Day, Destination, DestinationTip, Restroom } from "@/lib/types";

function fetchAll() {
  return Promise.all([
    supabase.from("days").select("*").order("sort_order"),
    supabase.from("destinations").select("*").order("sort_order"),
    // Curated, user-authored, always small (unlike restrooms) — fine to load
    // eagerly instead of deferring like the ~1000-row restrooms table.
    supabase.from("destination_tips").select("*").order("sort_order"),
  ]);
}

export function useTripData() {
  const [days, setDays] = useState<Day[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [tips, setTips] = useState<DestinationTip[]>([]);
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [restroomsLoaded, setRestroomsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Callback-style (not async/await) so the fetch is a genuine external-system
  // subscription from the effect's point of view, not a synchronous setState.
  useEffect(() => {
    let cancelled = false;
    fetchAll().then(([daysRes, destRes, tipsRes]) => {
      if (cancelled) return;
      if (daysRes.data) setDays(daysRes.data);
      if (destRes.data) setDestinations(destRes.data);
      if (tipsRes.data) setTips(tipsRes.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Restrooms (~1000 rows) aren't needed for the first paint — only once the
  // user opens the WC layer or the nearby-restrooms sheet — so they're fetched
  // lazily instead of blocking "Cargando itinerario" on a query nobody asked for yet.
  async function loadRestrooms() {
    if (restroomsLoaded) return;
    setRestroomsLoaded(true);
    const { data } = await supabase.from("restrooms").select("*");
    if (data) setRestrooms(data);
  }

  /** Optimistic day update (origin, title), reverted on a real server error. */
  async function updateDay(id: string, patch: Partial<Day>) {
    const previous = days;
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    const { error } = await supabase.from("days").update(patch).eq("id", id);
    if (error) {
      setDays(previous);
      setError(error.message);
    }
  }

  // Optimistic local update, reverted if Supabase rejects the write so the UI
  // never claims a change stuck that didn't actually persist. Offline writes
  // (no network, or a request that fails after connectivity drops) are queued
  // locally instead of reverted, and replayed once the connection is back.
  async function updateDestination(id: string, patch: Partial<Destination>) {
    const previous = destinations;
    setDestinations((prev) =>
      prev
        .map((d) => (d.id === id ? { ...d, ...patch } : d))
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    );

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      queuePatch(id, patch);
      return;
    }

    try {
      const { error } = await supabase.from("destinations").update(patch).eq("id", id);
      if (error) {
        // A response came back from the server — a real application error
        // (bad request, RLS, etc.), not a connectivity problem. Retrying
        // later won't fix it, so surface it instead of queueing.
        setDestinations(previous);
        setError(error.message);
      }
    } catch {
      // supabase-js only throws here when the underlying fetch itself never
      // completed (dropped signal, DNS, timeout) — that's connectivity by
      // definition, even when navigator.onLine still (wrongly) says true.
      queuePatch(id, patch);
    }
  }

  async function addDestination(
    input: Omit<Destination, "id" | "visited" | "sort_order"> & { sort_order?: number }
  ) {
    const { data, error } = await supabase
      .from("destinations")
      .insert({ ...input, visited: false, sort_order: input.sort_order ?? 0 })
      .select()
      .single();
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    setDestinations((prev) =>
      [...prev, data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    );
  }

  async function deleteDestination(id: string) {
    const previous = destinations;
    setDestinations((prev) => prev.filter((d) => d.id !== id));
    const { error } = await supabase.from("destinations").delete().eq("id", id);
    if (error) {
      setDestinations(previous);
      setError(error.message);
    }
  }

  /** Persist a new stop order (drag-free ↑↓ reorder or route optimization). */
  async function reorderDestinations(orderedIds: string[]) {
    const previous = destinations;
    setDestinations((prev) => {
      const order = new Map(orderedIds.map((id, i) => [id, i]));
      const updated = prev.map((d) =>
        order.has(d.id) ? { ...d, sort_order: order.get(d.id)! } : d
      );
      return updated.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    });
    const results = await Promise.all(
      orderedIds.map((id, i) => supabase.from("destinations").update({ sort_order: i }).eq("id", id))
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      setDestinations(previous);
      setError(failed.error.message);
    }
  }

  async function addTip(input: Omit<DestinationTip, "id" | "sort_order"> & { sort_order?: number }) {
    const { data, error } = await supabase
      .from("destination_tips")
      .insert({ ...input, sort_order: input.sort_order ?? 0 })
      .select()
      .single();
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    setTips((prev) => [...prev, data]);
  }

  async function updateTip(id: string, patch: Partial<DestinationTip>) {
    const previous = tips;
    setTips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("destination_tips").update(patch).eq("id", id);
    if (error) {
      setTips(previous);
      setError(error.message);
    }
  }

  async function deleteTip(id: string) {
    const previous = tips;
    setTips((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("destination_tips").delete().eq("id", id);
    if (error) {
      setTips(previous);
      setError(error.message);
    }
  }

  return {
    days,
    destinations,
    tips,
    restrooms,
    loadRestrooms,
    loading,
    error,
    dismissError: () => setError(null),
    updateDay,
    updateDestination,
    addDestination,
    deleteDestination,
    reorderDestinations,
    addTip,
    updateTip,
    deleteTip,
  };
}
