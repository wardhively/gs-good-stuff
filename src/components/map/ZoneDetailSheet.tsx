import React, { useState, useRef, useEffect } from 'react';
import { X, Pencil, Trash2, ChevronDown, ChevronUp, Eye, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Zone, Variety } from '@/lib/types';
import { STATUS_COLORS } from '@/lib/constants';
import { useInventory } from '@/hooks/useInventory';
import { useZones } from '@/hooks/useZones';
import VarietyDetailSheet from '@/components/admin/VarietyDetailSheet';
import { cacheFileOffline, syncPendingFiles } from '@/lib/storage-sync';
import { get } from 'idb-keyval';
import Checklist from '@/components/admin/Checklist';
import { ZONE_CHECKLIST_DEFAULTS } from '@/lib/constants';
import type { ChecklistItem } from '@/lib/types';

interface ZoneDetailSheetProps {
  zone: Zone;
  onClose: () => void;
  onEdit: (zone: Zone) => void;
}

export default function ZoneDetailSheet({ zone, onClose, onEdit }: ZoneDetailSheetProps) {
  const router = useRouter();
  const badgeColor = STATUS_COLORS[zone.status] || '#8B7D6B';
  const { varieties, saveVariety } = useInventory();
  const { deleteZone, saveZone: saveZoneFn } = useZones();
  const zoneVarieties = varieties.filter(v => v.zone_id === zone.id);
  const varietyCount = zoneVarieties.reduce((acc, v) => acc + v.count, 0);
  const [expandedVariety, setExpandedVariety] = useState<string | null>(null);
  const [detailVariety, setDetailVariety] = useState<Variety | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const pendingUrl = await cacheFileOffline(zone.id, file, 'zone');
        newUrls.push(pendingUrl);
      }
      const existingUrls = zone.photo_urls || [];
      await saveZoneFn(zone.id, { photo_urls: [...existingUrls, ...newUrls] } as any);
      syncPendingFiles();
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${zone.name}"? This cannot be undone.`)) return;
    await deleteZone(zone.id);
    onClose();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[1000] border-t border-fence transition-transform duration-300 max-h-[70vh] overflow-y-auto">
      <div className="w-12 h-1 bg-fence rounded-full mx-auto mt-3 mb-2" />

      <button onClick={onClose} className="absolute top-4 right-4 text-stone-c hover:text-root p-1">
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 pt-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-bitter text-2xl font-bold text-root">{zone.name}</h2>
            <p className="text-sm text-stone-c font-dm-sans mb-2">Internal ID: {zone.id}</p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm"
            style={{ backgroundColor: badgeColor }}
          >
            {zone.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-clay p-3 rounded-lg border border-fence-lt">
            <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-1">Varieties</p>
            <p className="text-lg font-bold text-root">{varietyCount}</p>
          </div>
          <div className="bg-clay p-3 rounded-lg border border-fence-lt">
            <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-1">Elevation</p>
            <p className="text-lg font-bold text-root">{zone.elevation ? `${zone.elevation} ft` : 'N/A'}</p>
          </div>
          <div className="bg-clay p-3 rounded-lg border border-fence-lt">
            <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-1">Drainage</p>
            <p className="text-sm font-bold text-root capitalize">{zone.drainage || 'Unknown'}</p>
          </div>
          <div className="bg-clay p-3 rounded-lg border border-fence-lt">
            <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-1">Frost Risk</p>
            <p className="text-sm font-bold text-root capitalize">{zone.frost_risk || 'Unknown'}</p>
          </div>
        </div>

        {zone.soil_notes && (
          <div className="mb-4">
            <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-1">Soil Notes</p>
            <p className="text-sm text-root font-dm-sans leading-relaxed">{zone.soil_notes}</p>
          </div>
        )}

        {/* Zone checklist */}
        <div className="mb-4">
          <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-2">Tasks</p>
          <Checklist
            items={zone.checklist || []}
            presetItems={ZONE_CHECKLIST_DEFAULTS}
            onChange={(items: ChecklistItem[]) => saveZoneFn(zone.id, { checklist: items } as any)}
          />
        </div>

        {/* Zone photos */}
        <div className="mb-4">
          <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-2">Photos</p>
          {zone.photo_urls && zone.photo_urls.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {zone.photo_urls.map((url: string, i: number) => (
                <ZonePhotoThumb key={i} url={url} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ash italic mb-1">No photos yet</p>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-fence rounded-lg text-sm text-stone-c hover:bg-clay transition-colors disabled:opacity-50"
          >
            <Camera className="w-4 h-4" /> {photoUploading ? 'Uploading...' : 'Add Photo'}
          </button>
        </div>

        {/* Inventory table for this zone */}
        <div className="mb-4">
          <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold mb-2">Varieties in Zone</p>
          {zoneVarieties.length === 0 ? (
            <p className="text-sm text-ash font-dm-sans italic">No varieties assigned to this zone</p>
          ) : (
            <div className="border border-fence-lt rounded-lg overflow-hidden">
              <table className="w-full text-sm font-dm-sans">
                <thead>
                  <tr className="bg-clay text-[10px] uppercase text-stone-c tracking-wider">
                    <th className="text-left py-2 px-3 font-bold">Name</th>
                    <th className="text-center py-2 px-2 font-bold">Qty</th>
                    <th className="text-center py-2 px-2 font-bold">Status</th>
                    <th className="text-right py-2 px-3 font-bold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneVarieties.map(v => (
                    <React.Fragment key={v.id}>
                      <tr
                        className="border-t border-fence-lt cursor-pointer hover:bg-cream transition-colors"
                        onClick={() => setExpandedVariety(expandedVariety === v.id ? null : v.id)}
                      >
                        <td className="py-2 px-3 text-root font-medium flex items-center gap-1">
                          {expandedVariety === v.id ? <ChevronUp className="w-3 h-3 text-ash" /> : <ChevronDown className="w-3 h-3 text-ash" />}
                          {v.name}
                        </td>
                        <td className="py-2 px-2 text-center text-root">{v.count}</td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase"
                            style={{ backgroundColor: STATUS_COLORS[v.status] || '#8B7D6B' }}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-root">{v.price ? `$${v.price}` : '—'}</td>
                      </tr>
                      {expandedVariety === v.id && (
                        <tr>
                          <td colSpan={4} className="bg-cream/50 px-3 py-2 border-t border-fence-lt">
                            <div className="flex items-center gap-3 text-xs text-stone-c font-dm-sans">
                              <span>Form: <strong className="text-root">{v.bloom_form || '—'}</strong></span>
                              <span>Size: <strong className="text-root">{v.bloom_size || '—'}</strong></span>
                              <span>Grade: <strong className="text-root">{v.grade || '—'}</strong></span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDetailVariety(v); }}
                              className="mt-2 px-3 py-1.5 bg-soil text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-root transition-colors"
                            >
                              <Eye className="w-3 h-3" /> View Inventory Detail
                            </button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/inventory')}
          className="w-full bg-soil text-white py-3 rounded-lg font-bold hover:bg-root transition-colors shadow-sm"
        >
          Manage All Inventory
        </button>

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => onEdit(zone)}
            className="flex-1 py-3 rounded-xl font-bold border border-fence text-stone-c hover:bg-clay transition-colors flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit Zone
          </button>
          <button
            onClick={handleDelete}
            className="py-3 px-4 rounded-xl font-bold border border-frost-lt text-frost hover:bg-frost-lt transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Variety detail modal */}
      {detailVariety && (
        <VarietyDetailSheet
          variety={detailVariety}
          onClose={() => setDetailVariety(null)}
          onSave={saveVariety}
        />
      )}
    </div>
  );
}

function ZonePhotoThumb({ url }: { url: string }) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    if (url.startsWith('pending://')) {
      const uuid = url.replace('pending://', '');
      const idbKey = uuid.replace('zone_', '').replace('photo_', '');
      get(`file_${idbKey}`).then((payload: any) => {
        if (payload?.blob) setSrc(URL.createObjectURL(payload.blob));
      });
    } else {
      setSrc(url);
    }
    return () => { if (src.startsWith('blob:')) URL.revokeObjectURL(src); };
  }, [url]);

  if (!src) return <div className="w-20 h-20 rounded-lg bg-clay animate-pulse flex-shrink-0" />;
  return <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-fence-lt" />;
}
