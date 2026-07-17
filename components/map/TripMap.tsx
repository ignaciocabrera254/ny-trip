"use client";

import { useEffect, useState, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { LatLng, Restroom } from "@/lib/types";
import {
  BulletIcon,
  HomeIcon,
  PickedPointIcon,
  RestroomIcon,
  SunsetIcon,
} from "@/components/map/MarkerIcons";

export type MapStop = {
  id: string;
  position: LatLng;
  label: string;
  color: string;
  isSunsetSpot: boolean;
  visited?: boolean;
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

// Internal component to handle drawing polylines using google.maps API
function MapPolyline({
  origin,
  stops,
  drawRoute,
}: {
  origin?: LatLng;
  stops: MapStop[];
  drawRoute: boolean;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!drawRoute || stops.length === 0) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const path = [
      ...(origin ? [origin] : []),
      ...stops.map((s) => s.position),
    ];

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        strokeColor: "#21262C",
        strokeOpacity: 0.7,
        strokeWeight: 2,
        icons: [
          {
            icon: {
              path: "M 0,-1 0,1",
              strokeOpacity: 1,
              scale: 4,
            },
            offset: "0",
            repeat: "20px",
          },
        ],
        map,
      });
      // To create dashed effect we set strokeOpacity of line to 0, and use icons
      polylineRef.current.setOptions({ strokeOpacity: 0 });
    } else {
      polylineRef.current.setPath(path);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, origin, stops, drawRoute]);

  return null;
}

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
  const [apiKey] = useState(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "");

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-bold text-ink/60">
        Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local
      </div>
    );
  }

  return (
    <div className={className ?? "h-full w-full"}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          center={center}
          defaultZoom={zoom}
          zoom={zoom}
          mapId="sundy_map_id" // required for AdvancedMarker
          disableDefaultUI
          onClick={(e) => {
            if (e.detail.latLng && onMapClick) {
              onMapClick({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
            }
          }}
        >
          {origin && (
            <AdvancedMarker position={origin} title="Casa — Jersey City">
              <HomeIcon />
            </AdvancedMarker>
          )}

          {stops.map((stop, index) => (
            <AdvancedMarker
              key={stop.id}
              position={stop.position}
              title={stop.popup || stop.label}
              zIndex={stop.isSunsetSpot ? 100 : 50}
            >
              {stop.isSunsetSpot ? (
                <SunsetIcon visited={stop.visited} />
              ) : (
                <BulletIcon number={index + 1} color={stop.color} visited={stop.visited} />
              )}
            </AdvancedMarker>
          ))}

          {showRestrooms &&
            restrooms.map((r) => (
              <AdvancedMarker key={r.id} position={{ lat: r.lat, lng: r.lng }} title={r.name}>
                <RestroomIcon source={r.source} />
              </AdvancedMarker>
            ))}

          {pickedPoint && (
            <AdvancedMarker position={pickedPoint}>
              <PickedPointIcon />
            </AdvancedMarker>
          )}

          <MapPolyline origin={origin} stops={stops} drawRoute={drawRoute} />
        </Map>
      </APIProvider>
    </div>
  );
}
