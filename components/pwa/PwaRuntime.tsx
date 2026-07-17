"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { flushQueue, hasQueuedPatches } from "@/lib/offline/queue";

// ponytail: registered only in production — a dev-mode SW would cache stale
// Turbopack output and fight HMR for no benefit.
export default function PwaRuntime() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    setOffline(!navigator.onLine);

    function handleOnline() {
      setOffline(false);
      if (hasQueuedPatches()) flushQueue();
    }
    function handleOffline() {
      setOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (navigator.onLine && hasQueuedPatches()) flushQueue();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-1.5 bg-ink py-1 text-xs font-bold uppercase text-paper"
    >
      <WifiOff size={12} aria-hidden />
      Sin conexión — viendo datos guardados
    </div>
  );
}
