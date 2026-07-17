export type DestinationCategory =
  | "mirador"
  | "monumento"
  | "museo"
  | "parque"
  | "comida"
  | "templo"
  | "sunset"
  | "otro";

export type LatLng = { lat: number; lng: number };

export type Day = {
  id: string;
  date: string;
  title: string;
  sort_order: number;
  /** Optional per-day route start (e.g. Port Authority instead of home). NULL falls back to HOME. */
  origin_lat: number | null;
  origin_lng: number | null;
  origin_label: string | null;
};

export type Destination = {
  id: string;
  day_id: string | null;
  name: string;
  category: DestinationCategory;
  lat: number;
  lng: number;
  notes: string | null;
  is_sunset_spot: boolean;
  visited: boolean;
  sort_order: number;
  /** Optional manual "HH:MM" hours, used only for a rough same-day arrival estimate. */
  opens_at: string | null;
  closes_at: string | null;
  /** Optional rough budget estimate for this stop. */
  estimated_cost: number | null;
  currency: string;
};

export type Restroom = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  notes: string | null;
  source: "official" | "custom";
};

export type TipCategory =
  | "comida"
  | "foto"
  | "bicicletas"
  | "entrada"
  | "baño"
  | "tienda"
  | "mirador"
  | "otro";

export type DestinationTip = {
  id: string;
  destination_id: string;
  category: TipCategory;
  name: string;
  notes: string | null;
  lat: number | null;
  lng: number | null;
  link: string | null;
  sort_order: number;
};

export const CATEGORY_LABEL: Record<DestinationCategory, string> = {
  mirador: "Mirador",
  monumento: "Monumento",
  museo: "Museo",
  parque: "Parque",
  comida: "Comida",
  templo: "Templo",
  sunset: "Sunset",
  otro: "Otro",
};

export const CATEGORY_COLOR: Record<DestinationCategory, string> = {
  mirador: "#0039A6",
  monumento: "#EE352E",
  museo: "#996633",
  parque: "#00933C",
  comida: "#FF6319",
  templo: "#B933AD",
  sunset: "#E89B31",
  otro: "#007AFF",
};

export const TIP_CATEGORY_LABEL: Record<TipCategory, string> = {
  comida: "Comida",
  foto: "Foto",
  bicicletas: "Bicicletas",
  entrada: "Entrada",
  baño: "Baño",
  tienda: "Tienda",
  mirador: "Mirador",
  otro: "Otro",
};

export const TIP_CATEGORY_ICON: Record<TipCategory, string> = {
  comida: "🍔",
  foto: "📸",
  bicicletas: "🚲",
  entrada: "🎟️",
  baño: "🚻",
  tienda: "🛍️",
  mirador: "👀",
  otro: "📍",
};

// var(--coral) / var(--dusk-rose) / var(--teal) / var(--amber-600) / var(--teal) /
// var(--slate-600) / var(--amber-500) / var(--slate-400) — resolved to hex since
// these back inline styles (map-less contexts), not Tailwind classes.
export const TIP_CATEGORY_COLOR: Record<TipCategory, string> = {
  comida: "#E56B4A",
  foto: "#C2506E",
  bicicletas: "#2A9D8F",
  entrada: "#C97E1E",
  baño: "#2A9D8F",
  tienda: "#515B67",
  mirador: "#E89B31",
  otro: "#939BA5",
};

export const HOME: LatLng = { lat: 40.7484, lng: -74.0465 };
/** Default alternate day-origin: Port Authority Bus Terminal. */
export const PORT_AUTHORITY: LatLng = { lat: 40.7569, lng: -73.9903 };
