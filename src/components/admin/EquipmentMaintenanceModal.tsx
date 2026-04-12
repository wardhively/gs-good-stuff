import { useState, useRef } from 'react';
import { Camera, X, DollarSign, Clock } from 'lucide-react';
import type { Equipment } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { cacheFileOffline } from '@/lib/storage-sync';

interface EquipmentMaintenanceModalProps {
  equipment: Equipment;
  onClose: () => void;
  onSave: (entry: any) => Promise<void>;
}

export default function EquipmentMaintenanceModal({ equipment, onClose, onSave }: EquipmentMaintenanceModalProps) {
  const [type, setType] = useState(equipment.service_items[0]?.type || '');
  const [hours, setHours] = useState(equipment.current_hours.toString());
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsDeploying(true);
    let receiptUrl = undefined;
    
    // We execute cache off-line IDB logic cleanly to support 80% rules natively
    if (file) {
      receiptUrl = await cacheFileOffline(equipment.id, file, 'receipt');
    }

    const payload = {
      date: Timestamp.now(),
      type,
      notes,
      machine_hours: hours ? parseFloat(hours) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      receipt_url: receiptUrl
    };

    await onSave(payload);
    setIsDeploying(false);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-root/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-cream h-[85vh] rounded-t-2xl shadow-xl flex flex-col pt-1">
        <div className="w-12 h-1.5 bg-fence rounded-full mx-auto my-2" />
        
        <div className="flex justify-between items-center px-6 py-3 border-b border-fence">
          <h2 className="font-bitter text-2xl font-bold text-root">Log Service</h2>
          <button onClick={onClose} className="p-2 text-stone-c hover:bg-clay rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-dm-sans">
          
          <div className="bg-linen p-3 rounded-xl border border-fence-lt mb-4">
             <p className="text-xs uppercase font-bold tracking-widest text-stone-c">Target</p>
             <p className="font-bold text-root">{equipment.name}</p>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1 flex items-center gap-1">Service Type <span className="text-frost">*</span></label>
            <select 
              value={type} onChange={(e) => setType(e.target.value)}
              className="w-full bg-white border border-fence rounded-lg px-3 py-3 text-root font-bold shadow-sm"
            >
              {equipment.service_items.map(s => <option key={s.type} value={s.type}>{s.type}</option>)}
              <option value="General Repair">General Repair</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Machine Hours</label>
              <input 
                type="number"
                value={hours} onChange={(e) => setHours(e.target.value)}
                className="w-full bg-white border border-fence rounded-lg px-3 py-3 text-root font-bold shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Cost</label>
              <input 
                type="number" step="0.01"
                value={cost} onChange={(e) => setCost(e.target.value)}
                className="w-full bg-white border border-fence rounded-lg px-3 py-3 text-root font-bold shadow-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Details & Part Numbers</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-white border border-fence rounded-lg px-4 py-3 text-root shadow-sm focus:outline-none focus:border-soil focus:ring-1 focus:ring-soil"
              placeholder="e.g. Swapped filter #XYZ..."
            />
          </div>

          <div>
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={(e) => { if(e.target.files) setFile(e.target.files[0])}} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-petal text-petal rounded-xl font-bold bg-petal-lt/30 hover:bg-petal-lt transition-colors flex justify-center items-center gap-2"
            >
              <Camera className="w-5 h-5" /> {file ? "Receipt Captured" : "Attach Receipt Photo"}
            </button>
            {file && <p className="text-xs text-center text-stone-c mt-2 font-bold">Image loaded and ready for sync.</p>}
          </div>

        </div>

        <div className="p-4 border-t border-fence bg-white">
          <button 
            disabled={!type || isDeploying}
            onClick={handleSave}
            className="w-full py-4 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center disabled:cursor-not-allowed"
          >
            {isDeploying ? 'Processing locally...' : 'Save Maintenance Log'}
          </button>
        </div>
      </div>
    </div>
  );
}
