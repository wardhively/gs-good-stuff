"use client";

import { useMemo, useState } from "react";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { haversineDistance, formatFeet } from "@/lib/geometry-utils";
import type { Zone, SiteFeature } from "@/lib/types";

interface EdgeLabelsProps {
  zones: Zone[];
  siteFeatures: SiteFeature[];
  enabled: boolean;
}

function parseGeometry(geo: any): [number, number][] | null {
  if (typeof geo === "string") {
    try { geo = JSON.parse(geo); } catch { return null; }
  }
  if (geo?.coordinates?.[0]) return geo.coordinates[0];
  return null;
}

export default function EdgeLabels({ zones, siteFeatures, enabled }: EdgeLabelsProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const labels = useMemo(() => {
    if (!enabled) return [];

    const result: { position: [number, number]; text: string; key: string }[] = [];

    // Zone edges
    zones.forEach(zone => {
      const ring = parseGeometry(zone.geometry);
      if (!ring || ring.length < 2) return;

      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i];
        const b = ring[i + 1];
        const dist = haversineDistance(a, b);
        const mid: [number, number] = [(a[1] + b[1]) / 2, (a[0] + b[0]) / 2]; // [lat, lng] for Leaflet

        // Check screen distance — hide tiny edges
        const aPx = map.latLngToContainerPoint([a[1], a[0]]);
        const bPx = map.latLngToContainerPoint([b[1], b[0]]);
        const screenDist = Math.sqrt((aPx.x - bPx.x) ** 2 + (aPx.y - bPx.y) ** 2);
        if (screenDist < 30) return;

        result.push({ position: mid, text: formatFeet(dist), key: `z-${zone.id}-${i}` });
      }
    });

    // Site feature edges
    siteFeatures.forEach(feat => {
      const ring = parseGeometry(feat.geometry);
      if (!ring || ring.length < 2) return;

      const isClosed = feat.geometry_type === 'polygon';
      const edgeCount = isClosed ? ring.length - 1 : ring.length - 1;

      for (let i = 0; i < edgeCount; i++) {
        const a = ring[i];
        const b = ring[i + 1];
        if (!b) continue;
        const dist = haversineDistance(a, b);
        const mid: [number, number] = [(a[1] + b[1]) / 2, (a[0] + b[0]) / 2];

        const aPx = map.latLngToContainerPoint([a[1], a[0]]);
        const bPx = map.latLngToContainerPoint([b[1], b[0]]);
        const screenDist = Math.sqrt((aPx.x - bPx.x) ** 2 + (aPx.y - bPx.y) ** 2);
        if (screenDist < 30) return;

        result.push({ position: mid, text: formatFeet(dist), key: `f-${feat.id}-${i}` });
      }
    });

    return result;
  }, [enabled, zones, siteFeatures, zoom]);

  if (!enabled || labels.length === 0) return null;

  return (
    <>
      {labels.map(label => (
        <Marker
          key={label.key}
          position={label.position}
          interactive={false}
          icon={L.divIcon({
            className: '',
            iconSize: [0, 0],
            html: `<div style="white-space:nowrap;font-size:10px;font-weight:bold;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.8);transform:translate(-50%,-50%);pointer-events:none;">${label.text}</div>`,
          })}
        />
      ))}
    </>
  );
}
