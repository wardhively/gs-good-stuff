import { useState, useRef } from 'react';
import { Camera, X, Globe, MapPin, Database } from 'lucide-react';

interface JournalEntryModalProps {
  onClose: () => void;
  onSubmit: (data: any, files: File[]) => Promise<string | void>;
  zones: {id: string, name: string}[];
  varieties: {id: string, name: string}[];
}

export default function JournalEntryModal({ onClose, onSubmit, zones, varieties }: JournalEntryModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<'observation' | 'planting' | 'harvest' | 'maintenance' | 'business' | 'personal'>('observation');
  const [isPublic, setIsPublic] = useState(false);
  const [publicTitle, setPublicTitle] = useState('');
  const [publicBody, setPublicBody] = useState('');
  const [zoneId, setZoneId] = useState('');
  
  const [files, setFiles] = useState<File[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleSave = async () => {
    setIsDeploying(true);
    await onSubmit({
      title,
      body,
      category,
      is_public: isPublic,
      public_title: isPublic ? publicTitle : '',
      public_body: isPublic ? publicBody : '',
      zone_id: zoneId || null,
      variety_ids: [], // Skipping variety picker complexity for brevity
    }, files);
    setIsDeploying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-root/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-cream h-[90vh] rounded-t-2xl shadow-xl flex flex-col pt-1">
        <div className="w-12 h-1.5 bg-fence rounded-full mx-auto my-2" />
        
        <div className="flex justify-between items-center px-6 py-3 border-b border-fence">
          <h2 className="font-bitter text-2xl font-bold text-root">New Journal</h2>
          <button onClick={onClose} className="p-2 text-stone-c hover:bg-clay rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-dm-sans">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Title</label>
            <input 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-fence rounded-lg px-4 py-3 font-bold text-root shadow-sm focus:outline-none focus:border-soil focus:ring-1 focus:ring-soil"
              placeholder="E.g., Cafe au Lait showing early buds..."
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {['observation', 'planting', 'harvest', 'maintenance', 'business', 'personal'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${category === cat ? 'bg-creek border-creek text-white shadow-md' : 'bg-white border-fence text-stone-c'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Observation Details (Markdown)</label>
            <textarea 
              value={body} onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full bg-white border border-fence rounded-lg px-4 py-3 text-root shadow-sm focus:outline-none focus:border-soil focus:ring-1 focus:ring-soil"
              placeholder="Record field notes here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Zone</label>
              <select 
                value={zoneId} onChange={(e) => setZoneId(e.target.value)}
                className="w-full bg-white border border-fence rounded-lg px-3 py-2 text-sm text-root shadow-sm"
              >
                <option value="">Any</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-fence-lt shadow-sm">
            <label className="flex justify-between items-center cursor-pointer">
              <span className="flex items-center gap-2 font-bold text-root"><Globe className="w-5 h-5 text-petal"/> Publish to Growing Guide</span>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-petal' : 'bg-clay shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'}`} onClick={() => setIsPublic(!isPublic)}>
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublic ? 'left-7' : 'left-1'}`} />
              </div>
            </label>
            {isPublic && (
              <div className="mt-4 pt-4 border-t border-fence-lt space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Tidy Public Title</label>
                  <input value={publicTitle} onChange={(e) => setPublicTitle(e.target.value)} className="w-full bg-clay border border-fence-lt rounded-lg px-3 py-2 text-sm" placeholder="A Lesson in Early Topping..." />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-c tracking-widest mb-1">Edited Public Guide Body</label>
                  <textarea value={publicBody} onChange={(e) => setPublicBody(e.target.value)} rows={3} className="w-full bg-clay border border-fence-lt rounded-lg px-3 py-2 text-sm" placeholder="Write advice clearly for storefront visitors..." />
                </div>
              </div>
            )}
          </div>

          <div>
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} multiple />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-creek text-creek rounded-xl font-bold bg-creek-lt/30 hover:bg-creek-lt transition-colors flex justify-center items-center gap-2"
            >
              <Camera className="w-5 h-5" /> Capture Field Photo
            </button>
            {files.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {files.map((f, i) => (
                  <div key={i} className="w-16 h-16 rounded-md bg-stone-c/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-fence">
                    <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>

        <div className="p-4 border-t border-fence bg-white">
          <button 
            disabled={!title || isDeploying}
            onClick={handleSave}
            className="w-full py-4 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center disabled:cursor-not-allowed"
          >
            {isDeploying ? 'Saving locally...' : 'Save & Sync Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
