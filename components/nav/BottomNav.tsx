"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, ClipboardList, MapPinned } from "lucide-react";

const TABS = [
  { href: "/", label: "Hoy", icon: MapPinned },
  { href: "/planificar", label: "Planificar", icon: CalendarRange },
  { href: "/destinos", label: "Destinos", icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)]"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer ${
              active ? "text-ink" : "text-ink/40"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
