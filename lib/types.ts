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

export const HOME: LatLng = { lat: 40.7484, lng: -74.0465 };
