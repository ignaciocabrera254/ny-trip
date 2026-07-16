import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Day, Destination, Restroom } from "@/lib/types";

function fetchAll() {
  return Promise.all([
    supabase.from("days").select("*").order("sort_order"),
    supabase.from("destinations").select("*").order("sort_order"),
    supabase.from("restrooms").select("*"),
  ]);
}

export function useTripData() {
  const [days, setDays] = useState<Day[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Callback-style (not async/await) so the fetch is a genuine external-system
  // subscription from the effect's point of view, not a synchronous setState.
  useEffect(() => {
    let cancelled = false;
    fetchAll().then(([daysRes, destRes, restRes]) => {
      if (cancelled) return;
      if (daysRes.data) setDays(daysRes.data);
      if (destRes.data) setDestinations(destRes.data);
      if (restRes.data) setRestrooms(restRes.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Optimistic local update, reverted if Supabase rejects the write so the UI
  // never claims a change stuck that didn't actually persist.
  async function updateDestination(id: string, patch: Partial<Destination>) {
    const previous = destinations;
    setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    const { error } = await supabase.from("destinations").update(patch).eq("id", id);
    if (error) {
      setDestinations(previous);
      setError(error.message);
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
      throw error;
    }
    setDestinations((prev) => [...prev, data]);
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
      return prev.map((d) => (order.has(d.id) ? { ...d, sort_order: order.get(d.id)! } : d));
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

  return {
    days,
    destinations,
    restrooms,
    loading,
    error,
    dismissError: () => setError(null),
    updateDestination,
    addDestination,
    deleteDestination,
    reorderDestinations,
  };
}
