"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus } from 'lucide-react';
import { ADDISON_COORDINATES, STATUS_COLORS } from '@/lib/constants';
import type { Zone } from '@/lib/types';
import ZoneDetailSheet from './ZoneDetailSheet';
import MapDrawingLayer from './MapDrawingLayer';
import ZoneFormSheet from './ZoneFormSheet';
import { useZones } from '@/hooks/useZones';

export default function FarmMap() {
  const { zones, loading } = useZones();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Drawing state
  const [drawMode, setDrawMode] = useState<'off' | 'drawing' | 'editing'>('off');
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [drawnCoordinates, setDrawnCoordinates] = useState<[number, number][] | null>(null);

  const center: [number, number] = [ADDISON_COORDINATES.lat, ADDISON_COORDINATES.lng];

  const handleDrawComplete = (coordinates: [number, number][]) => {
    setDrawnCoordinates(coordinates);
  };

  const handleDrawCancel = () => {
    setDrawMode('off');
    setEditingZone(null);
    setDrawnCoordinates(null);
  };

  const handleFormSave = () => {
    setDrawMode('off');
    setEditingZone(null);
    setDrawnCoordinates(null);
  };

  const handleEditZone = (zone: Zone) => {
    setSelectedZone(null);
    setEditingZone(zone);
    setDrawMode('editing');
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-[#EAE8E3]">
      <MapContainer
        center={center}
        zoom={19}
        maxZoom={22}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <ZoomControl position="topright" />

        {/* Esri World Imagery satellite tiles */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri, Maxar, Earthstar Geographics'
          maxNativeZoom={19}
          maxZoom={22}
        />

        {/* Existing zone polygons */}
        {!loading && zones.map((zone) => {
          let geo = zone.geometry;
          if (typeof geo === 'string') {
            try { geo = JSON.parse(geo); } catch { return null; }
          }
          if (!geo?.coordinates?.[0]) return null;

          const positions: [number, number][] = geo.coordinates[0].map(
            (coord: any) => [coord[1], coord[0]]
          );

          const isSelected = selectedZone?.id === zone.id;
          const statusColor = STATUS_COLORS[zone.status] || '#8B7D6B';
          const dimmed = drawMode !== 'off';

          return (
            <Polygon
              key={zone.id}
              positions={positions}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: statusColor,
                fillOpacity: dimmed ? 0.15 : isSelected ? 0.55 : 0.4,
                weight: isSelected ? 3 : 2,
                opacity: dimmed ? 0.4 : 0.9,
              }}
              eventHandlers={drawMode === 'off' ? {
                click: () => setSelectedZone(zone),
              } : {}}
            >
              <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-sm">
                <div>{zone.name}</div>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Drawing layer */}
        <MapDrawingLayer
          isDrawing={drawMode !== 'off'}
          onComplete={handleDrawComplete}
          onCancel={handleDrawCancel}
          editingZone={drawMode === 'editing' ? editingZone : null}
        />
      </MapContainer>

      {/* Drawing mode banner */}
      {drawMode !== 'off' && !drawnCoordinates && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] bg-soil/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur">
          {drawMode === 'editing' ? 'Drag vertices to adjust' : 'Tap to place vertices'}
        </div>
      )}

      {/* Add Zone FAB */}
      {drawMode === 'off' && !selectedZone && (
        <button
          onClick={() => setDrawMode('drawing')}
          className="absolute bottom-24 right-6 w-14 h-14 bg-leaf text-white rounded-full shadow-[0_4px_14px_rgba(91,124,79,0.5)] flex justify-center items-center hover:bg-leaf-dk hover:scale-105 active:scale-95 transition-all z-[1000]"
          aria-label="Add Zone"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Zone detail sheet */}
      {selectedZone && drawMode === 'off' && (
        <ZoneDetailSheet
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onEdit={handleEditZone}
        />
      )}

      {/* Zone form sheet (after drawing complete) */}
      {drawnCoordinates && (
        <ZoneFormSheet
          coordinates={drawnCoordinates}
          existingZone={drawMode === 'editing' ? editingZone : null}
          onSave={handleFormSave}
          onCancel={handleDrawCancel}
        />
      )}
    </div>
  );
}
