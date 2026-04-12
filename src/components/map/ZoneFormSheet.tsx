"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useZones } from "@/hooks/useZones";
import { StatusEnum } from "@/lib/constants";
import type { Zone } from "@/lib/types";

interface ZoneFormSheetProps {
  coordinates: [number, number][]; // GeoJSON [lng, lat] closed ring
  existingZone?: Zone | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ZoneFormSheet({ coordinates, existingZone, onSave, onCancel }: ZoneFormSheetProps) {
  const { createZone, saveZone } = useZones();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(existingZone?.name || "");
  const [status, setStatus] = useState<string>(existingZone?.status || StatusEnum.STORED);
  const [drainage, setDrainage] = useState(existingZone?.drainage || "");
  const [sunExposure, setSunExposure] = useState(existingZone?.sun_exposure || "");
  const [frostRisk, setFrostRisk] = useState(existingZone?.frost_risk || "");
  const [elevation, setElevation] = useState(existingZone?.elevation?.toString() || "");
  const [elevationLoading, setElevationLoading] = useState(false);
  const [soilNotes, setSoilNotes] = useState(existingZone?.soil_notes || "");

  // Auto-fetch elevation from centroid of the polygon
  useEffect(() => {
    if (elevation) return; // don't override existing value
    async function fetchElevation() {
      setElevationLoading(true);
      try {
        // Calculate centroid from coordinates (skip last point which is the closing duplicate)
        const ring = coordinates.slice(0, -1);
        const centLat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
        const centLng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
        const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${centLat}&longitude=${centLng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.elevation?.[0] != null) {
            // Convert meters to feet
            const feet = Math.round(data.elevation[0] * 3.28084);
            setElevation(feet.toString());
          }
        }
      } catch {
        // silently fail — user can enter manually
      } finally {
        setElevationLoading(false);
      }
    }
    fetchElevation();
  }, [coordinates]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    // Store as JSON string — Firestore doesn't support nested arrays (GeoJSON coordinates are 3 levels deep)
    const geometry = JSON.stringify({ type: "Polygon", coordinates: [coordinates] });

    const zoneData = {
      name: name.trim(),
      geometry,
      status: status as StatusEnum,
      ...(drainage && { drainage: drainage as any }),
      ...(sunExposure && { sun_exposure: sunExposure as any }),
      ...(frostRisk && { frost_risk: frostRisk as any }),
      ...(elevation && { elevation: parseInt(elevation) }),
      ...(soilNotes && { soil_notes: soilNotes }),
    };

    try {
      if (existingZone) {
        await saveZone(existingZone.id, zoneData as any);
      } else {
        await createZone(zoneData as any);
      }
      onSave();
    } catch (err) {
      console.error("Failed to save zone:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-root/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[85vh] overflow-y-auto">
        <div className="w-12 h-1 bg-fence rounded-full mx-auto mt-3 mb-2" />
        <div className="sticky top-0 bg-linen/95 backdrop-blur z-10 px-6 py-3 flex justify-between items-center border-b border-fence">
          <h2 className="font-bitter text-xl font-bold text-root">
            {existingZone ? "Edit Zone" : "New Zone"}
          </h2>
          <button onClick={onCancel} className="p-2 bg-clay rounded-full text-stone-c hover:text-root">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Zone Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Zone 6 — East Meadow"
              className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                {Object.values(StatusEnum).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">
                Elevation (ft) {elevationLoading && <Loader2 className="w-3 h-3 inline animate-spin text-creek" />}
              </label>
              <input
                type="number"
                value={elevation}
                onChange={e => setElevation(e.target.value)}
                placeholder={elevationLoading ? "Fetching..." : "1020"}
                className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Drainage</label>
              <select value={drainage} onChange={e => setDrainage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                <option value="">—</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Sun</label>
              <select value={sunExposure} onChange={e => setSunExposure(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                <option value="">—</option>
                <option value="full">Full</option>
                <option value="partial">Partial</option>
                <option value="shade">Shade</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Frost Risk</label>
              <select value={frostRisk} onChange={e => setFrostRisk(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Soil Notes</label>
            <textarea
              value={soilNotes}
              onChange={e => setSoilNotes(e.target.value)}
              rows={2}
              placeholder="Sandy loam, amended with compost..."
              className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full py-3 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors disabled:opacity-50 mt-2"
          >
            {saving ? "Saving..." : existingZone ? "Update Zone" : "Create Zone"}
          </button>
        </div>
      </div>
    </div>
  );
}
