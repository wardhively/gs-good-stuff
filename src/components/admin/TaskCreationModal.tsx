import { useState } from 'react';
import { X, Calendar, MapPin, Wrench } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface TaskCreationModalProps {
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  zones: {id: string, name: string}[];
}

export default function TaskCreationModal({ onClose, onSubmit, zones }: TaskCreationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'|'urgent'>('medium');
  const [dueDateStr, setDueDateStr] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [assignedTo, setAssignedTo] = useState('Gary');
  const [estHours, setEstHours] = useState('');

  const [isDeploying, setIsDeploying] = useState(false);

  const handleSave = async () => {
    setIsDeploying(true);
    let due_date = Timestamp.now();
    if (dueDateStr) {
      due_date = Timestamp.fromDate(new Date(dueDateStr));
    }

    await onSubmit({
      title,
      description,
      priority,
      status: 'pending',
      source: 'manual',
      due_date,
      zone_id: zoneId || undefined,
      equipment_id: equipmentId || undefined,
      assigned_to: assignedTo,
      estimated_hours: estHours ? parseFloat(estHours) : undefined,
    });
    
    setIsDeploying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-root/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-cream h-[85vh] rounded-t-2xl shadow-xl flex flex-col pt-1">
        <div className="w-12 h-1.5 bg-fence rounded-full mx-auto my-2" />
        
        <div className="flex justify-between items-center px-6 py-3 border-b border-fence">
          <h2 className="font-bitter text-2xl font-bold text-root">New Task</h2>
          <button onClick={onClose} className="p-2 text-stone-c hover:bg-clay rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-dm-sans">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Task Title <span className="text-frost">*</span></label>
            <input 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-fence rounded-lg px-4 py-3 font-bold text-root shadow-sm focus:outline-none focus:border-soil focus:ring-1 focus:ring-soil"
              placeholder="e.g. Inspect cold storage temperatures"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-2">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                <button 
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${priority === p ? 'bg-root text-white border-root scale-105 shadow-md' : 'bg-white border-fence text-stone-c'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Details</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white border border-fence rounded-lg px-4 py-3 text-root shadow-sm focus:outline-none focus:border-soil focus:ring-1 focus:ring-soil"
              placeholder="Any specific tools needed, warnings, or context..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Due Date</label>
              <input 
                type="date"
                value={dueDateStr} onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full bg-white border border-fence rounded-lg px-3 py-2 text-sm text-root shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Est. Hours</label>
              <input 
                type="number" step="0.5"
                value={estHours} onChange={(e) => setEstHours(e.target.value)}
                className="w-full bg-white border border-fence rounded-lg px-3 py-2 text-sm text-root shadow-sm"
                placeholder="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Link Zone</label>
              <select 
                value={zoneId} onChange={(e) => setZoneId(e.target.value)}
                className="w-full bg-white border border-fence rounded-lg px-3 py-2 text-sm text-root shadow-sm"
              >
                <option value="">None</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1 flex items-center gap-1"><Wrench className="w-3 h-3"/> Link Equip.</label>
              <input 
                value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="Tractor ID..."
                className="w-full bg-white border border-fence rounded-lg px-3 py-2 text-sm text-root shadow-sm"
              />
            </div>
          </div>

          <div className="bg-linen p-3 rounded-xl border border-fence-lt">
             <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-2">Assign To</label>
             <div className="flex gap-2">
                {['Gary', 'Suzy'].map(name => (
                  <button 
                    key={name} onClick={() => setAssignedTo(name)}
                    className={`flex-1 py-1.5 rounded-md text-sm font-bold border transition-colors ${assignedTo === name ? 'bg-soil text-white border-soil' : 'bg-white text-stone-c border-fence-lt'}`}
                  >
                    {name}
                  </button>
                ))}
             </div>
          </div>

        </div>

        <div className="p-4 border-t border-fence bg-white">
          <button 
            disabled={!title || isDeploying}
            onClick={handleSave}
            className="w-full py-4 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center disabled:cursor-not-allowed"
          >
            {isDeploying ? 'Saving...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
