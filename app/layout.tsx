import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/nav/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "NY Trip Planner",
  description: "Itinerario personal para el viaje a Nueva York, 24 ago – 2 sep 2026",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-dvh flex flex-col bg-paper text-ink font-sans">
        <div className="flex-1 pb-16">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
