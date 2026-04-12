import { X } from 'lucide-react';
import type { Zone } from '@/lib/types';
import { STATUS_COLORS } from '@/lib/constants';

import { useInventory } from '@/hooks/useInventory';

interface ZoneDetailSheetProps {
  zone: Zone;
  onClose: () => void;
}

export default function ZoneDetailSheet({ zone, onClose }: ZoneDetailSheetProps) {
  const badgeColor = STATUS_COLORS[zone.status] || '#8B7D6B';
  const { varieties } = useInventory();
  const varietyCount = varieties.filter(v => v.zone_id === zone.id).reduce((acc, v) => acc + v.count, 0);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[1000] border-t border-fence transition-transform duration-300">
      
      {/* Drag handle style affordance */}
      <div className="w-12 h-1 bg-fence rounded-full mx-auto mt-3 mb-2" />
      
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-stone-c hover:text-root p-1"
      >
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
        
        <button className="w-full bg-soil text-white py-3 rounded-lg font-bold hover:bg-root transition-colors shadow-sm mt-2">
          View Detailed Inventory
        </button>
      </div>
    </div>
  );
}
