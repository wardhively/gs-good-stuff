"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ADDISON_COORDINATES, STATUS_COLORS } from '@/lib/constants';
import type { Zone } from '@/lib/types';
import ZoneDetailSheet from './ZoneDetailSheet';
import { useZones } from '@/hooks/useZones';

// Leaflet relies on window, which causes SSR breaking if improperly loaded
export default function FarmMap() {
  const { zones, loading } = useZones();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  
  // Center fallback for initial render
  const center: [number, number] = [ADDISON_COORDINATES.lat, ADDISON_COORDINATES.lng];

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-[#EAE8E3]">
      <MapContainer 
        center={center} 
        zoom={16} 
        maxZoom={19}
        className="w-full h-full z-0"
        zoomControl={false} // Disable default to move it somewhere custom if needed, or put it back
      >
        <ZoomControl position="topright" />
        
        {/* ArcGIS locally cached tiles with OSM fallback */}
        <TileLayer
          url="/tiles/{z}/{x}/{y}.png"
          errorTileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {!loading && zones.map((zone) => {
          // Flatten GeoJSON polygon [[lng, lat], [lng, lat]] to [[lat, lng], [lat, lng]] for Leaflet
          const positions: [number, number][] = zone.geometry.coordinates[0].map(
            (coord: any) => [coord[1], coord[0]]
          );
          
          const isSelected = selectedZone?.id === zone.id;
          const statusColor = STATUS_COLORS[zone.status] || '#8B7D6B';

          return (
            <Polygon
              key={zone.id}
              positions={positions}
              pathOptions={{
                color: statusColor,
                fillColor: statusColor,
                fillOpacity: isSelected ? 0.4 : 0.2,
                weight: isSelected ? 2 : 1,
                dashArray: isSelected ? undefined : "4 4"
              }}
              eventHandlers={{
                click: () => setSelectedZone(zone)
              }}
            >
              <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-root font-bold drop-shadow-md text-sm">
                <div>{zone.name}</div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Renders overlay bottom sheet over the map */}
      {selectedZone && (
        <ZoneDetailSheet zone={selectedZone} onClose={() => setSelectedZone(null)} />
      )}
    </div>
  );
}
