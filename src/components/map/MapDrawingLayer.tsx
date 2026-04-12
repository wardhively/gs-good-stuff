"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Marker, Polyline, Polygon, CircleMarker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import type { Zone, SiteFeature } from "@/lib/types";
import { findSnapTarget, constrainTo90Degrees, polygonAreaSqFt, polygonPerimeterFt, edgeLengths, edgeMidpoint, haversineDistance, formatFeet } from "@/lib/geometry-utils";
import type { DrawingToolsState, DrawingToolsActions } from "@/hooks/useDrawingTools";
import DrawingToolbar from "./DrawingToolbar";

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

function createMidpointIcon() {
  return L.divIcon({
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div style="width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,0.6);border:2px solid rgba(255,255,255,0.9);cursor:pointer;"></div>`,
  });
}

interface MapDrawingLayerProps {
  isDrawing: boolean;
  drawingType?: 'polygon' | 'line' | 'point';
  onComplete: (coordinates: [number, number][]) => void;
  onCancel: () => void;
  editingZone?: Zone | null;
  existingZones?: Zone[];
  existingSiteFeatures?: SiteFeature[];
  toolsState: DrawingToolsState;
  toolsActions: DrawingToolsActions;
}

export default function MapDrawingLayer({
  isDrawing, drawingType = 'polygon', onComplete, onCancel,
  editingZone, existingZones = [], existingSiteFeatures = [],
  toolsState, toolsActions,
}: MapDrawingLayerProps) {
  const map = useMap();
  const [vertices, setVertices] = useState<L.LatLng[]>([]);
  const [snapPreview, setSnapPreview] = useState<L.LatLng | null>(null);
  const isDragging = useRef(false);

  // Collect all existing zone vertices for snapping
  const existingVertices = useMemo(() => {
    const verts: L.LatLng[] = [];
    existingZones.forEach(z => {
      let geo: any = z.geometry;
      if (typeof geo === "string") try { geo = JSON.parse(geo); } catch { return; }
      if (geo?.coordinates?.[0]) {
        geo.coordinates[0].forEach((c: number[]) => verts.push(L.latLng(c[1], c[0])));
      }
    });
    existingSiteFeatures.forEach(f => {
      let geo: any = f.geometry;
      if (typeof geo === "string") try { geo = JSON.parse(geo); } catch { return; }
      if (geo?.coordinates) {
        const coords = geo.type === 'Polygon' ? geo.coordinates[0] : geo.coordinates;
        if (Array.isArray(coords)) {
          coords.forEach((c: any) => {
            if (Array.isArray(c) && c.length >= 2) verts.push(L.latLng(c[1], c[0]));
          });
        }
      }
    });
    return verts;
  }, [existingZones, existingSiteFeatures]);

  // Load vertices from editingZone
  useEffect(() => {
    if (editingZone) {
      let geo: any = editingZone.geometry;
      if (typeof geo === "string") try { geo = JSON.parse(geo); } catch { return; }
      if (geo?.coordinates?.[0]) {
        const coords = geo.coordinates[0];
        const ring = coords.length > 1 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]
          ? coords.slice(0, -1) : coords;
        const verts = ring.map((c: number[]) => L.latLng(c[1], c[0]));
        setVertices(verts);
        toolsActions.pushState(verts, "load zone");
      }
    } else if (!isDrawing) {
      setVertices([]);
    }
  }, [editingZone, isDrawing]);

  // Map click → add vertex
  useMapEvents({
    click(e) {
      if (!isDrawing || isDragging.current) return;

      // Point features: single click completes
      if (drawingType === 'point') {
        onComplete([[e.latlng.lng, e.latlng.lat]]);
        return;
      }

      let point = e.latlng;

      // Snap
      if (toolsState.snapEnabled) {
        const snap = findSnapTarget(point, existingVertices, map);
        if (snap) point = L.latLng(snap.lat, snap.lng);
      }

      // 90-degree constraint
      if (toolsState.rightAngleEnabled && vertices.length >= 2) {
        const prev = vertices[vertices.length - 2];
        const curr = vertices[vertices.length - 1];
        const constrained = constrainTo90Degrees(
          [prev.lng, prev.lat], [curr.lng, curr.lat], [point.lng, point.lat]
        );
        point = L.latLng(constrained[1], constrained[0]);
      }

      const newVerts = [...vertices, point];
      setVertices(newVerts);
      toolsActions.pushState(newVerts, "add vertex");
    },
    mousemove(e) {
      if (!isDrawing || !toolsState.snapEnabled) { setSnapPreview(null); return; }
      const snap = findSnapTarget(e.latlng, existingVertices, map);
      setSnapPreview(snap ? L.latLng(snap.lat, snap.lng) : null);
    },
  });

  const handleUndo = useCallback(() => {
    const restored = toolsActions.undo();
    if (restored) setVertices(restored);
    else if (vertices.length > 0) setVertices(prev => prev.slice(0, -1));
  }, [toolsActions, vertices]);

  const handleRedo = useCallback(() => {
    const restored = toolsActions.redo();
    if (restored) setVertices(restored);
  }, [toolsActions]);

  const handleComplete = useCallback(() => {
    if (drawingType === 'line' && vertices.length >= 2) {
      const coords: [number, number][] = vertices.map(v => [v.lng, v.lat]);
      onComplete(coords);
      setVertices([]);
      return;
    }
    if (vertices.length < 3) return;
    const coords: [number, number][] = vertices.map(v => [v.lng, v.lat]);
    coords.push([vertices[0].lng, vertices[0].lat]);
    onComplete(coords);
    setVertices([]);
  }, [vertices, onComplete, drawingType]);

  const handleCancel = useCallback(() => {
    setVertices([]);
    toolsActions.clearHistory();
    onCancel();
  }, [onCancel, toolsActions]);

  const handleMidpointInsert = useCallback((index: number) => {
    const a = vertices[index];
    const b = vertices[(index + 1) % vertices.length];
    const mid = L.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2);
    const newVerts = [...vertices.slice(0, index + 1), mid, ...vertices.slice(index + 1)];
    setVertices(newVerts);
    toolsActions.pushState(newVerts, "insert midpoint");
  }, [vertices, toolsActions]);

  if (!isDrawing) return null;

  const positions = vertices.map(v => [v.lat, v.lng] as [number, number]);
  const isPolygon = drawingType === 'polygon';

  // Compute measurements
  const ring = vertices.map(v => [v.lng, v.lat] as [number, number]);
  const areaSqFt = isPolygon && ring.length >= 3 ? polygonAreaSqFt(ring) : null;
  const perimeterFt = ring.length >= 2 ? polygonPerimeterFt(ring) : null;
  const lengths = ring.length >= 2 ? edgeLengths(ring) : [];

  return (
    <>
      {/* Polygon fill preview */}
      {isPolygon && vertices.length >= 3 && (
        <Polygon positions={positions} pathOptions={{ color: "#5B7C4F", fillColor: "#5B7C4F", fillOpacity: 0.2, weight: 2, dashArray: "6 4" }} />
      )}

      {/* Line preview */}
      {vertices.length >= 2 && (
        <Polyline positions={positions} pathOptions={{ color: "#FFFFFF", weight: 2, opacity: 0.9 }} />
      )}

      {/* Edge length labels */}
      {toolsState.showMeasurements && vertices.length >= 2 && lengths.map((len, i) => {
        if (i >= vertices.length - (isPolygon ? 0 : 1)) return null;
        const j = (i + 1) % vertices.length;
        if (!vertices[j]) return null;
        const midLat = (vertices[i].lat + vertices[j].lat) / 2;
        const midLng = (vertices[i].lng + vertices[j].lng) / 2;

        // Hide tiny edges
        const aPx = map.latLngToContainerPoint(vertices[i]);
        const bPx = map.latLngToContainerPoint(vertices[j]);
        if (Math.sqrt((aPx.x - bPx.x) ** 2 + (aPx.y - bPx.y) ** 2) < 40) return null;

        return (
          <Marker
            key={`edge-${i}`}
            position={[midLat, midLng]}
            interactive={false}
            icon={L.divIcon({
              className: '',
              iconSize: [0, 0],
              html: `<div style="white-space:nowrap;font-size:11px;font-weight:bold;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.9);transform:translate(-50%,-50%);pointer-events:none;background:rgba(0,0,0,0.4);padding:1px 4px;border-radius:4px;">${formatFeet(len)}</div>`,
            })}
          />
        );
      })}

      {/* Snap preview indicator */}
      {snapPreview && (
        <CircleMarker
          center={[snapPreview.lat, snapPreview.lng]}
          radius={16}
          pathOptions={{ color: "#3E7A8C", fillColor: "#3E7A8C", fillOpacity: 0.3, weight: 2, dashArray: "4 4" }}
        />
      )}

      {/* 90-degree guide lines */}
      {toolsState.rightAngleEnabled && vertices.length >= 2 && (() => {
        const curr = vertices[vertices.length - 1];
        const prev = vertices[vertices.length - 2];
        const dx = curr.lng - prev.lng;
        const dy = curr.lat - prev.lat;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;
        const scale = 0.002; // guide line length in degrees
        const perpX = -dy / len * scale;
        const perpY = dx / len * scale;
        return (
          <>
            <Polyline positions={[[curr.lat, curr.lng], [curr.lat + perpY, curr.lng + perpX]]} pathOptions={{ color: "#FFFFFF", weight: 1, opacity: 0.4, dashArray: "4 4" }} />
            <Polyline positions={[[curr.lat, curr.lng], [curr.lat - perpY, curr.lng - perpX]]} pathOptions={{ color: "#FFFFFF", weight: 1, opacity: 0.4, dashArray: "4 4" }} />
            <Polyline positions={[[curr.lat, curr.lng], [curr.lat + dx / len * scale, curr.lng + dy / len * scale]]} pathOptions={{ color: "#FFFFFF", weight: 1, opacity: 0.2, dashArray: "4 4" }} />
          </>
        );
      })()}

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
              toolsActions.pushState([...vertices], `drag vertex ${i}`);
            },
            dragend: (e) => {
              const marker = e.target as L.Marker;
              let newPos = marker.getLatLng();

              if (toolsState.snapEnabled) {
                const snap = findSnapTarget(newPos, existingVertices, map);
                if (snap) newPos = L.latLng(snap.lat, snap.lng);
              }

              const newVerts = [...vertices];
              newVerts[i] = newPos;
              setVertices(newVerts);
              setTimeout(() => { isDragging.current = false; }, 100);
            },
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              if (i === 0 && vertices.length >= 3 && isPolygon) handleComplete();
            },
          }}
        />
      ))}

      {/* Midpoint insert handles (edit mode only) */}
      {editingZone && vertices.length >= 2 && vertices.map((v, i) => {
        const j = (i + 1) % vertices.length;
        if (!isPolygon && j === 0 && i === vertices.length - 1) return null;
        const midLat = (v.lat + vertices[j].lat) / 2;
        const midLng = (v.lng + vertices[j].lng) / 2;
        return (
          <Marker
            key={`mid-${i}`}
            position={[midLat, midLng]}
            icon={createMidpointIcon()}
            eventHandlers={{
              click: (e) => { L.DomEvent.stopPropagation(e); handleMidpointInsert(i); },
            }}
          />
        );
      })}

      {/* Drawing toolbar */}
      <DrawingToolbar
        state={toolsState}
        actions={{ ...toolsActions, undo: handleUndo as any, redo: handleRedo as any }}
        vertexCount={vertices.length}
        areaSqFt={areaSqFt}
        perimeterFt={perimeterFt}
        isDrawing={isDrawing}
      />

      {/* Action buttons */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        <button onClick={handleCancel} className="px-4 py-2 bg-linen border border-fence text-stone-c rounded-full font-bold text-sm shadow-lg hover:bg-clay transition-colors">
          Cancel
        </button>
        {vertices.length > 0 && (
          <button onClick={handleUndo} className="px-4 py-2 bg-linen border border-fence text-stone-c rounded-full font-bold text-sm shadow-lg hover:bg-clay transition-colors">
            Undo
          </button>
        )}
        {((isPolygon && vertices.length >= 3) || (!isPolygon && vertices.length >= 2)) && (
          <button onClick={handleComplete} className="px-4 py-2 bg-leaf text-white rounded-full font-bold text-sm shadow-lg hover:bg-leaf-dk transition-colors">
            Complete
          </button>
        )}
      </div>
    </>
  );
}
