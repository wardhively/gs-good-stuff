"use client";

import { useState } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { useSiteFeatures } from "@/hooks/useSiteFeatures";
import { SITE_FEATURE_TYPES } from "@/lib/constants";
import type { SiteFeature, SiteFeatureType } from "@/lib/types";

interface SiteFeatureSheetProps {
  feature: SiteFeature;
  onClose: () => void;
  onEdit: (feature: SiteFeature) => void;
}

export default function SiteFeatureSheet({ feature, onClose, onEdit }: SiteFeatureSheetProps) {
  const { deleteFeature } = useSiteFeatures();
  const typeInfo = SITE_FEATURE_TYPES[feature.type] || SITE_FEATURE_TYPES.custom;

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${feature.name}"?`)) return;
    await deleteFeature(feature.id);
    onClose();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[1000] border-t border-fence max-h-[50vh] overflow-y-auto">
      <div className="w-12 h-1 bg-fence rounded-full mx-auto mt-3 mb-2" />
      <button onClick={onClose} className="absolute top-4 right-4 text-stone-c hover:text-root p-1">
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: feature.color || typeInfo.color }}>
            <span className="text-white text-xs font-bold">{typeInfo.label.charAt(0)}</span>
          </div>
          <div>
            <h2 className="font-bitter text-xl font-bold text-root">{feature.name}</h2>
            <p className="text-xs text-stone-c">{typeInfo.label} · {feature.geometry_type}</p>
          </div>
        </div>

        {feature.notes && (
          <p className="text-sm text-root font-dm-sans mb-4">{feature.notes}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(feature)}
            className="flex-1 py-3 rounded-xl font-bold border border-fence text-stone-c hover:bg-clay transition-colors flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="py-3 px-4 rounded-xl font-bold border border-frost-lt text-frost hover:bg-frost-lt transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Sheet (type picker + name) ───────────────────────────────

interface SiteFeatureCreateSheetProps {
  coordinates: [number, number][];
  geometryType: 'polygon' | 'line' | 'point';
  onSave: () => void;
  onCancel: () => void;
}

export function SiteFeatureCreateSheet({ coordinates, geometryType, onSave, onCancel }: SiteFeatureCreateSheetProps) {
  const { createFeature } = useSiteFeatures();
  const [name, setName] = useState("");
  const [type, setType] = useState<SiteFeatureType>("custom");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const geometry = geometryType === 'point'
        ? JSON.stringify({ type: "Point", coordinates: coordinates[0] })
        : geometryType === 'line'
        ? JSON.stringify({ type: "LineString", coordinates })
        : JSON.stringify({ type: "Polygon", coordinates: [coordinates] });

      const typeInfo = SITE_FEATURE_TYPES[type] || SITE_FEATURE_TYPES.custom;
      await createFeature({
        name: name.trim(),
        type,
        geometry_type: geometryType,
        geometry,
        color: typeInfo.color,
        ...(notes ? { notes } : {}),
      } as any);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-root/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[85vh] overflow-y-auto">
        <div className="w-12 h-1 bg-fence rounded-full mx-auto mt-3 mb-2" />
        <div className="px-6 pb-6">
          <h2 className="font-bitter text-xl font-bold text-root mb-4">New Site Feature</h2>

          {/* Type picker */}
          <div className="mb-4">
            <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-2">Feature Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(SITE_FEATURE_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setType(key as SiteFeatureType)}
                  className={`py-2 px-2 rounded-lg text-[11px] font-bold text-center transition-colors ${
                    type === key ? 'text-white shadow-sm' : 'bg-clay text-stone-c hover:bg-fence'
                  }`}
                  style={type === key ? { backgroundColor: info.color } : {}}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Front walkway" className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal resize-none" />
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full py-3 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Feature"}
          </button>
        </div>
      </div>
    </div>
  );
}
