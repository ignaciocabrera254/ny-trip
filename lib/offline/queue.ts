import { supabase } from "@/lib/supabase/client";
import type { Destination } from "@/lib/types";

const STORAGE_KEY = "ny-trip-offline-queue";

type QueuedPatch = { id: string; patch: Partial<Destination> };

function readQueue(): QueuedPatch[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedPatch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/** Queue a destination patch made while offline; a later patch to the same id merges in. */
export function queuePatch(id: string, patch: Partial<Destination>) {
  const queue = readQueue();
  const existing = queue.find((q) => q.id === id);
  if (existing) Object.assign(existing.patch, patch);
  else queue.push({ id, patch });
  writeQueue(queue);
}

export function hasQueuedPatches() {
  return readQueue().length > 0;
}

/** Replay queued patches against Supabase; entries that fail again stay queued. */
export async function flushQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  const remaining: QueuedPatch[] = [];
  for (const item of queue) {
    const { error } = await supabase.from("destinations").update(item.patch).eq("id", item.id);
    if (error) remaining.push(item);
  }
  writeQueue(remaining);
}
