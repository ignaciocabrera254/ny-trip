"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import L from "leaflet";
import type { LatLng, Restroom } from "@/lib/types";
import {
  bulletIcon,
  homeIcon,
  pickedPointIcon,
  restroomIcon,
  sunsetIcon,
} from "@/components/map/markerIcons";

export type MapStop = {
  id: string;
  position: LatLng;
  label: string;
  color: string;
  isSunsetSpot: boolean;
  popup?: string;
};

type TripMapProps = {
  center: LatLng;
  zoom?: number;
  origin?: LatLng;
  stops?: MapStop[];
  drawRoute?: boolean;
  restrooms?: Restroom[];
  showRestrooms?: boolean;
  pickedPoint?: LatLng | null;
  onMapClick?: (point: LatLng) => void;
  className?: string;
};

export default function TripMap({
  center,
  zoom = 13,
  origin,
  stops = [],
  drawRoute = false,
  restrooms = [],
  showRestrooms = false,
  pickedPoint = null,
  onMapClick,
  className,
}: TripMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    stops: L.LayerGroup;
    restrooms: L.LayerGroup;
    misc: L.LayerGroup;
  } | null>(null);
  const handleMapClick = useEffectEvent((point: LatLng) => {
    onMapClick?.(point);
  });

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
    });

    // CARTO's free Positron basemap: same OpenStreetMap data, no API key/billing,
    // and a cleaner render that keeps the numbered bullets legible under sun.
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    const stopsLayer = L.layerGroup().addTo(map);
    const restroomsLayer = L.layerGroup();
    const miscLayer = L.layerGroup().addTo(map);

    layersRef.current = { stops: stopsLayer, restrooms: restroomsLayer, misc: miscLayer };
    mapRef.current = map;

    map.on("click", (e: L.LeafletMouseEvent) => {
      handleMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when the caller changes day/context.
  useEffect(() => {
    mapRef.current?.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom]);

  // Redraw stops, origin, and route line.
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.stops.clearLayers();
    layers.misc.clearLayers();

    if (origin) {
      L.marker([origin.lat, origin.lng], { icon: homeIcon() })
        .bindPopup("Casa — Jersey City")
        .addTo(layers.misc);
    }

    stops.forEach((stop, index) => {
      const icon = stop.isSunsetSpot ? sunsetIcon() : bulletIcon(index + 1, stop.color);
      const marker = L.marker([stop.position.lat, stop.position.lng], { icon }).addTo(
        layers.stops
      );
      if (stop.popup) marker.bindPopup(stop.popup);
      else marker.bindPopup(stop.label);
    });

    if (drawRoute && stops.length > 0) {
      const path: L.LatLngExpression[] = [
        ...(origin ? [[origin.lat, origin.lng] as L.LatLngExpression] : []),
        ...stops.map((s) => [s.position.lat, s.position.lng] as L.LatLngExpression),
      ];
      L.polyline(path, {
        color: "#0a0a0a",
        weight: 2,
        dashArray: "6 6",
        opacity: 0.7,
      }).addTo(layers.misc);
    }

    if (pickedPoint) {
      L.marker([pickedPoint.lat, pickedPoint.lng], { icon: pickedPointIcon() }).addTo(
        layers.misc
      );
    }
  }, [stops, origin, drawRoute, pickedPoint]);

  // Toggle + redraw restroom layer.
  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.restrooms.clearLayers();

    if (showRestrooms) {
      restrooms.forEach((r) => {
        L.marker([r.lat, r.lng], { icon: restroomIcon(r.source) })
          .bindPopup(r.name)
          .addTo(layers.restrooms);
      });
      if (!map.hasLayer(layers.restrooms)) layers.restrooms.addTo(map);
    } else if (map.hasLayer(layers.restrooms)) {
      map.removeLayer(layers.restrooms);
    }
  }, [restrooms, showRestrooms]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Mapa del recorrido"
      className={className ?? "h-full w-full"}
    />
  );
}
