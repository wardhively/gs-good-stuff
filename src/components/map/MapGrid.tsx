"use client";

import { useState, useEffect, useMemo } from "react";
import { Polyline, useMap, useMapEvents } from "react-leaflet";
import { getGridInterval, feetToDegreesLat, feetToDegreesLng } from "@/lib/geometry-utils";

interface MapGridProps {
  enabled: boolean;
}

export default function MapGrid({ enabled }: MapGridProps) {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => { setZoom(map.getZoom()); setBounds(map.getBounds()); },
  });

  const lines = useMemo(() => {
    if (!enabled) return { major: [], minor: [] };

    const { intervalFt, minorFt } = getGridInterval(Math.round(zoom));
    const centerLat = bounds.getCenter().lat;

    const dLat = feetToDegreesLat(intervalFt);
    const dLng = feetToDegreesLng(intervalFt, centerLat);

    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const west = bounds.getWest();
    const east = bounds.getEast();

    // Align to round intervals
    const startLat = Math.floor(south / dLat) * dLat;
    const startLng = Math.floor(west / dLng) * dLng;

    const major: [number, number][][] = [];

    // Horizontal lines (constant latitude)
    for (let lat = startLat; lat <= north; lat += dLat) {
      major.push([[lat, west], [lat, east]]);
    }
    // Vertical lines (constant longitude)
    for (let lng = startLng; lng <= east; lng += dLng) {
      major.push([[south, lng], [north, lng]]);
    }

    // Minor grid (1ft ticks at high zoom)
    const minor: [number, number][][] = [];
    if (minorFt && minorFt < intervalFt) {
      const dLatMinor = feetToDegreesLat(minorFt);
      const dLngMinor = feetToDegreesLng(minorFt, centerLat);
      const startLatMinor = Math.floor(south / dLatMinor) * dLatMinor;
      const startLngMinor = Math.floor(west / dLngMinor) * dLngMinor;

      for (let lat = startLatMinor; lat <= north; lat += dLatMinor) {
        // Skip if it's a major line
        if (Math.abs(lat % dLat) > dLatMinor * 0.1) {
          minor.push([[lat, west], [lat, east]]);
        }
      }
      for (let lng = startLngMinor; lng <= east; lng += dLngMinor) {
        if (Math.abs(lng % dLng) > dLngMinor * 0.1) {
          minor.push([[south, lng], [north, lng]]);
        }
      }
    }

    return { major, minor };
  }, [enabled, zoom, bounds]);

  if (!enabled) return null;

  const { label } = getGridInterval(Math.round(zoom));

  return (
    <>
      {/* Major grid lines */}
      {lines.major.map((line, i) => (
        <Polyline
          key={`major-${i}`}
          positions={line}
          pathOptions={{ color: '#FFFFFF', weight: 1, opacity: 0.25, dashArray: undefined }}
        />
      ))}
      {/* Minor grid lines */}
      {lines.minor.map((line, i) => (
        <Polyline
          key={`minor-${i}`}
          positions={line}
          pathOptions={{ color: '#FFFFFF', weight: 0.5, opacity: 0.12 }}
        />
      ))}
      {/* Grid scale label — rendered as a div overlay */}
      <div className="absolute top-14 left-3 z-[500] bg-root/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none">
        Grid: {label}
      </div>
    </>
  );
}
