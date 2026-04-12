"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Tooltip, ZoomControl, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plus, Layers, Map as MapIcon, Ruler } from 'lucide-react';
import { ADDISON_COORDINATES, STATUS_COLORS, SITE_FEATURE_TYPES } from '@/lib/constants';
import type { Zone, SiteFeature } from '@/lib/types';
import ZoneDetailSheet from './ZoneDetailSheet';
import ZoneFormSheet from './ZoneFormSheet';
import SiteFeatureSheet, { SiteFeatureCreateSheet } from './SiteFeatureSheet';
import MapDrawingLayer from './MapDrawingLayer';
import MapGrid from './MapGrid';
import EdgeLabels from './EdgeLabels';
import { useZones } from '@/hooks/useZones';
import { useSiteFeatures } from '@/hooks/useSiteFeatures';
import { useDrawingTools } from '@/hooks/useDrawingTools';

export default function FarmMap() {
  const { zones, loading } = useZones();
  const { features: siteFeatures } = useSiteFeatures();
  const [toolsState, toolsActions] = useDrawingTools();

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<SiteFeature | null>(null);

  // Drawing state
  const [drawMode, setDrawMode] = useState<'off' | 'zone' | 'feature' | 'editing-zone' | 'editing-feature'>('off');
  const [drawingType, setDrawingType] = useState<'polygon' | 'line' | 'point'>('polygon');
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [drawnCoordinates, setDrawnCoordinates] = useState<[number, number][] | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const center: [number, number] = [ADDISON_COORDINATES.lat, ADDISON_COORDINATES.lng];
  const isDrawing = drawMode !== 'off';

  const handleDrawComplete = (coordinates: [number, number][]) => {
    setDrawnCoordinates(coordinates);
  };

  const handleDrawCancel = () => {
    setDrawMode('off');
    setEditingZone(null);
    setDrawnCoordinates(null);
    setShowAddMenu(false);
    toolsActions.reset();
  };

  const handleFormSave = () => {
    setDrawMode('off');
    setEditingZone(null);
    setDrawnCoordinates(null);
    toolsActions.reset();
  };

  const handleEditZone = (zone: Zone) => {
    setSelectedZone(null);
    setEditingZone(zone);
    setDrawMode('editing-zone');
  };

  const handleEditFeature = (feature: SiteFeature) => {
    setSelectedFeature(null);
    // For now, delete and redraw
    // TODO: implement feature editing with vertex loading
  };

  const startFeatureDraw = (geomType: 'polygon' | 'line' | 'point') => {
    setDrawingType(geomType);
    setDrawMode('feature');
    setShowAddMenu(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-[#EAE8E3]">
      <MapContainer center={center} zoom={19} maxZoom={22} className="w-full h-full z-0" zoomControl={false}>
        <ZoomControl position="topright" />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri, Maxar, Earthstar Geographics'
          maxNativeZoom={19}
          maxZoom={22}
        />

        {/* Imperial grid overlay */}
        <MapGrid enabled={toolsState.gridEnabled} />

        {/* Edge labels on existing features */}
        <EdgeLabels zones={zones} siteFeatures={siteFeatures} enabled={toolsState.showDimensions} />

        {/* Site features (below zones) */}
        {siteFeatures.map(feat => {
          let geo: any = feat.geometry;
          if (typeof geo === 'string') try { geo = JSON.parse(geo); } catch { return null; }
          const typeInfo = SITE_FEATURE_TYPES[feat.type] || SITE_FEATURE_TYPES.custom;
          const color = feat.color || typeInfo.color;
          const dimmed = isDrawing;

          if (geo?.type === 'Point' && geo.coordinates) {
            return (
              <CircleMarker
                key={feat.id}
                center={[geo.coordinates[1], geo.coordinates[0]]}
                radius={8}
                pathOptions={{ color: '#FFFFFF', fillColor: color, fillOpacity: dimmed ? 0.3 : 0.8, weight: 2 }}
                eventHandlers={!isDrawing ? { click: () => setSelectedFeature(feat) } : {}}
              >
                <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-[10px]">
                  {feat.name}
                </Tooltip>
              </CircleMarker>
            );
          }

          if (geo?.type === 'LineString' && geo.coordinates) {
            const positions = geo.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
            return (
              <Polyline
                key={feat.id}
                positions={positions}
                pathOptions={{ color, weight: 3, opacity: dimmed ? 0.3 : 0.8, dashArray: "8 4" }}
                eventHandlers={!isDrawing ? { click: () => setSelectedFeature(feat) } : {}}
              >
                <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-[10px]">
                  {feat.name}
                </Tooltip>
              </Polyline>
            );
          }

          if (geo?.type === 'Polygon' && geo.coordinates?.[0]) {
            const positions = geo.coordinates[0].map((c: number[]) => [c[1], c[0]] as [number, number]);
            return (
              <Polygon
                key={feat.id}
                positions={positions}
                pathOptions={{ color, fillColor: color, fillOpacity: dimmed ? 0.1 : 0.25, weight: 2, dashArray: "6 3", opacity: dimmed ? 0.3 : 0.7 }}
                eventHandlers={!isDrawing ? { click: () => setSelectedFeature(feat) } : {}}
              >
                <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-[10px]">
                  {feat.name}
                </Tooltip>
              </Polygon>
            );
          }
          return null;
        })}

        {/* Zone polygons */}
        {!loading && zones.map((zone) => {
          let geo: any = zone.geometry;
          if (typeof geo === 'string') try { geo = JSON.parse(geo); } catch { return null; }
          if (!geo?.coordinates?.[0]) return null;

          const positions: [number, number][] = geo.coordinates[0].map((coord: any) => [coord[1], coord[0]]);
          const isSelected = selectedZone?.id === zone.id;
          const statusColor = STATUS_COLORS[zone.status] || '#8B7D6B';
          const dimmed = isDrawing;

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
              eventHandlers={!isDrawing ? { click: () => setSelectedZone(zone) } : {}}
            >
              <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-sm">
                <div>{zone.name}</div>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Drawing layer */}
        <MapDrawingLayer
          isDrawing={isDrawing}
          drawingType={drawingType}
          onComplete={handleDrawComplete}
          onCancel={handleDrawCancel}
          editingZone={drawMode === 'editing-zone' ? editingZone : null}
          existingZones={zones}
          existingSiteFeatures={siteFeatures}
          toolsState={toolsState}
          toolsActions={toolsActions}
        />
      </MapContainer>

      {/* Drawing mode banner */}
      {isDrawing && !drawnCoordinates && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] bg-soil/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur">
          {drawMode === 'editing-zone' ? 'Drag vertices to adjust' :
           drawMode === 'feature' ? `Tap to draw ${drawingType}` :
           'Tap to place vertices'}
        </div>
      )}

      {/* Show dimensions toggle (when NOT drawing) */}
      {!isDrawing && !selectedZone && !selectedFeature && (
        <button
          onClick={toolsActions.toggleDimensions}
          className={`absolute top-14 left-3 z-[1000] w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-md ${
            toolsState.showDimensions ? 'bg-leaf text-white' : 'bg-linen/90 text-stone-c border border-fence'
          }`}
          title="Show Dimensions"
        >
          <Ruler className="w-4 h-4" />
        </button>
      )}

      {/* Grid toggle (when NOT drawing) */}
      {!isDrawing && !selectedZone && !selectedFeature && (
        <button
          onClick={toolsActions.toggleGrid}
          className={`absolute top-14 left-14 z-[1000] w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-md ${
            toolsState.gridEnabled ? 'bg-leaf text-white' : 'bg-linen/90 text-stone-c border border-fence'
          }`}
          title="Grid Overlay"
        >
          <Layers className="w-4 h-4" />
        </button>
      )}

      {/* Add FAB with menu */}
      {!isDrawing && !selectedZone && !selectedFeature && (
        <div className="absolute bottom-24 right-6 z-[1000]">
          {showAddMenu && (
            <div className="mb-2 bg-linen rounded-xl shadow-lg border border-fence-lt p-2 space-y-1 min-w-[160px]">
              <button
                onClick={() => { setDrawMode('zone'); setDrawingType('polygon'); setShowAddMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-root hover:bg-clay transition-colors flex items-center gap-2"
              >
                <MapIcon className="w-4 h-4 text-leaf" /> New Zone
              </button>
              <div className="h-px bg-fence-lt" />
              <p className="px-3 pt-1 text-[9px] uppercase text-stone-c font-bold tracking-wider">Site Features</p>
              {Object.entries(SITE_FEATURE_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => startFeatureDraw(info.geometry as any)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-root hover:bg-clay transition-colors flex items-center gap-2"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                  {info.label}
                  <span className="text-[9px] text-ash ml-auto">{info.geometry}</span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`w-14 h-14 rounded-full shadow-[0_4px_14px_rgba(91,124,79,0.5)] flex justify-center items-center hover:scale-105 active:scale-95 transition-all ${
              showAddMenu ? 'bg-root text-white rotate-45' : 'bg-leaf text-white'
            }`}
            aria-label="Add"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Zone detail sheet */}
      {selectedZone && !isDrawing && (
        <ZoneDetailSheet zone={selectedZone} onClose={() => setSelectedZone(null)} onEdit={handleEditZone} />
      )}

      {/* Site feature detail sheet */}
      {selectedFeature && !isDrawing && (
        <SiteFeatureSheet feature={selectedFeature} onClose={() => setSelectedFeature(null)} onEdit={handleEditFeature} />
      )}

      {/* Zone form (after drawing complete) */}
      {drawnCoordinates && (drawMode === 'zone' || drawMode === 'editing-zone') && (
        <ZoneFormSheet
          coordinates={drawnCoordinates}
          existingZone={drawMode === 'editing-zone' ? editingZone : null}
          onSave={handleFormSave}
          onCancel={handleDrawCancel}
        />
      )}

      {/* Site feature form (after drawing complete) */}
      {drawnCoordinates && drawMode === 'feature' && (
        <SiteFeatureCreateSheet
          coordinates={drawnCoordinates}
          geometryType={drawingType}
          onSave={handleFormSave}
          onCancel={handleDrawCancel}
        />
      )}
    </div>
  );
}
