import { X, Calendar, Database, Hash, Leaf, DollarSign } from 'lucide-react';
import type { Variety } from '@/lib/types';
import { STATUS_COLORS, StatusEnum } from '@/lib/constants';
import { advanceVarietyStatus, getNextStatus } from '@/lib/inventory-utils';

interface VarietyDetailSheetProps {
  variety: Variety;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Variety>) => Promise<void>;
}

export default function VarietyDetailSheet({ variety, onClose, onSave }: VarietyDetailSheetProps) {
  const badgeColor = STATUS_COLORS[variety.status] || '#8B7D6B';
  const nextStatus = getNextStatus(variety.status);

  const handleAdvance = async () => {
    if (!nextStatus) return;
    const updated = advanceVarietyStatus(variety, nextStatus, "Advanced via Detail view");
    await onSave(variety.id, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-root/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sheet */}
      <div className="relative bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-linen/95 backdrop-blur z-10 border-b border-fence px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-bitter text-2xl font-bold text-root">{variety.name}</h2>
            <div className="flex gap-2 items-center mt-1">
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                style={{ backgroundColor: badgeColor }}
              >
                {variety.status}
              </span>
              <span className="text-xs text-stone-c font-dm-sans">{variety.id.substring(0, 8)}...</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-clay rounded-full text-stone-c hover:text-root transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-cream p-4 rounded-xl border border-fence-lt flex flex-col items-center justify-center">
              <Hash className="w-5 h-5 text-ash mb-1" />
              <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold">Count</p>
              <p className="text-2xl font-bold text-root">{variety.count}</p>
            </div>
            
            <div className="bg-cream p-4 rounded-xl border border-fence-lt flex flex-col items-center justify-center">
              <Database className="w-5 h-5 text-ash mb-1" />
              <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold">Zone</p>
              <p className="text-lg font-bold text-root truncate w-full text-center">{variety.zone_id || 'Unassigned'}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-bold text-root text-sm uppercase tracking-wider border-b border-fence pb-1">Details</h3>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-dm-sans">
              <div><strong className="text-stone-c block text-[10px] uppercase">Bloom Form</strong> {variety.bloom_form || '-'}</div>
              <div><strong className="text-stone-c block text-[10px] uppercase">Bloom Size</strong> {variety.bloom_size || '-'}</div>
              <div><strong className="text-stone-c block text-[10px] uppercase">Height</strong> {variety.height || '-'}</div>
              <div><strong className="text-stone-c block text-[10px] uppercase">Season</strong> {variety.season || '-'}</div>
              <div><strong className="text-stone-c block text-[10px] uppercase">Grade</strong> {variety.grade || '-'}</div>
              <div>
                <strong className="text-stone-c block text-[10px] uppercase flex items-center gap-1">
                  Price <DollarSign className="w-3 h-3" />
                </strong> 
                {variety.price ? `$${variety.price.toFixed(2)}` : '-'}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-bold text-root text-sm uppercase tracking-wider border-b border-fence pb-1">Milestones</h3>
            <div className="flex flex-col gap-2 font-dm-sans text-sm">
              <div className="flex justify-between">
                <span className="text-stone-c flex items-center gap-2"><Calendar className="w-4 h-4"/> Jugged</span>
                <span className="font-bold">{variety.jugged_date ? new Date(variety.jugged_date.seconds * 1000).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-c flex items-center gap-2"><Leaf className="w-4 h-4"/> Planted</span>
                <span className="font-bold">{variety.planted_date ? new Date(variety.planted_date.seconds * 1000).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between bg-bloom-lt/50 -mx-2 px-2 py-1 rounded">
                <span className="text-bloom-dk font-bold flex items-center gap-2">Expected Dig</span>
                <span className="font-bold text-bloom-dk">{variety.expected_dig_date ? new Date(variety.expected_dig_date.seconds * 1000).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>

          {nextStatus && (
            <button 
              onClick={handleAdvance}
              className="w-full py-4 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors shadow-lg flex justify-center items-center gap-2"
            >
              Advance to {nextStatus}
            </button>
          )}

          <button className="w-full py-3 mt-3 rounded-xl font-bold border border-fence text-stone-c hover:bg-clay transition-colors">
            Edit Variety
          </button>
        </div>
      </div>
    </div>
  );
}
