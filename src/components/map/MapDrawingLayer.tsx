"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Marker, Polyline, Polygon, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import type { Zone } from "@/lib/types";

// Create circular div icons for vertices
function createVertexIcon(isFirst: boolean, vertexCount: number) {
  const size = isFirst && vertexCount >= 3 ? 24 : 18;
  const color = isFirst && vertexCount >= 3 ? "#5B7C4F" : "#C17F4E";
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:grab;"></div>`,
  });
}

interface MapDrawingLayerProps {
  isDrawing: boolean;
  onComplete: (coordinates: [number, number][]) => void;
  onCancel: () => void;
  editingZone?: Zone | null;
}

export default function MapDrawingLayer({ isDrawing, onComplete, onCancel, editingZone }: MapDrawingLayerProps) {
  const map = useMap();
  const [vertices, setVertices] = useState<L.LatLng[]>([]);
  const isDragging = useRef(false);

  // Load vertices from editingZone when entering edit mode
  useEffect(() => {
    if (editingZone) {
      let geo: any = editingZone.geometry;
      if (typeof geo === "string") {
        try { geo = JSON.parse(geo); } catch { return; }
      }
      if (geo?.coordinates?.[0]) {
        const coords = geo.coordinates[0];
        const ring = coords.length > 1 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]
          ? coords.slice(0, -1)
          : coords;
        setVertices(ring.map((c: number[]) => L.latLng(c[1], c[0])));
      }
    } else if (!isDrawing) {
      setVertices([]);
    }
  }, [editingZone, isDrawing]);

  useMapEvents({
    click(e) {
      if (!isDrawing || isDragging.current) return;
      setVertices(prev => [...prev, e.latlng]);
    },
  });

  const handleUndo = useCallback(() => {
    setVertices(prev => prev.slice(0, -1));
  }, []);

  const handleComplete = useCallback(() => {
    if (vertices.length < 3) return;
    // Keep vertices in tap order — user traces the perimeter naturally
    const coords: [number, number][] = vertices.map(v => [v.lng, v.lat]);
    coords.push([vertices[0].lng, vertices[0].lat]); // close ring
    onComplete(coords);
    setVertices([]);
  }, [vertices, onComplete]);

  const handleCancel = useCallback(() => {
    setVertices([]);
    onCancel();
  }, [onCancel]);

  if (!isDrawing) return null;

  const positions = vertices.map(v => [v.lat, v.lng] as [number, number]);

  return (
    <>
      {/* Polygon fill preview when 3+ vertices */}
      {vertices.length >= 3 && (
        <Polygon
          positions={positions}
          pathOptions={{ color: "#5B7C4F", fillColor: "#5B7C4F", fillOpacity: 0.2, weight: 2, dashArray: "6 4" }}
        />
      )}

      {/* Line connecting vertices */}
      {vertices.length >= 2 && (
        <Polyline positions={positions} pathOptions={{ color: "#FFFFFF", weight: 2, opacity: 0.9 }} />
      )}

      {/* Draggable vertex markers */}
      {vertices.map((v, i) => (
        <Marker
          key={`vertex-${i}-${vertices.length}`}
          position={[v.lat, v.lng]}
          icon={createVertexIcon(i === 0, vertices.length)}
          draggable
          eventHandlers={{
            dragstart: () => {
              isDragging.current = true;
            },
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const newPos = marker.getLatLng();
              setVertices(prev => {
                const updated = [...prev];
                updated[i] = newPos;
                return updated;
              });
              setTimeout(() => { isDragging.current = false; }, 100);
            },
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              if (i === 0 && vertices.length >= 3) {
                handleComplete();
              }
            },
          }}
        />
      ))}

      {/* Drawing toolbar */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-linen border border-fence text-stone-c rounded-full font-bold text-sm shadow-lg hover:bg-clay transition-colors"
        >
          Cancel
        </button>
        {vertices.length > 0 && (
          <button
            onClick={handleUndo}
            className="px-4 py-2 bg-linen border border-fence text-stone-c rounded-full font-bold text-sm shadow-lg hover:bg-clay transition-colors"
          >
            Undo
          </button>
        )}
        {vertices.length >= 3 && (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-leaf text-white rounded-full font-bold text-sm shadow-lg hover:bg-leaf-dk transition-colors"
          >
            Complete
          </button>
        )}
      </div>
    </>
  );
}
