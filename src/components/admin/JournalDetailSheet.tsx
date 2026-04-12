import { X, Cloud, User, MapPin } from 'lucide-react';
import type { JournalEntry } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';
import { get } from 'idb-keyval';
import type { PendingPhoto } from '@/lib/storage-sync';

interface JournalDetailSheetProps {
  entry: JournalEntry;
  onClose: () => void;
}

// Subcomponent to reliably render either remote URLs or resolve local IndexedDB Blob URLs on-the-fly
function AttachedPhoto({ url }: { url: string }) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    let objectUrl = '';
    if (url.startsWith('pending://')) {
      const uuid = url.replace('pending://', '');
      get<PendingPhoto>(`photo_${uuid}`).then(payload => {
        if (payload?.blob) {
          objectUrl = URL.createObjectURL(payload.blob);
          setSrc(objectUrl);
        }
      });
    } else {
      setSrc(url);
    }
    
    return () => {
      // Memory cleanup for local object urls
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (!src) return <div className="h-48 w-full bg-clay animate-pulse rounded-lg flex items-center justify-center text-xs text-stone-c font-bold uppercase tracking-widest">Pending Image</div>;

  return <img src={src} className="w-full h-auto rounded-lg shadow-sm border border-fence-lt" alt="Attached" />;
}

export default function JournalDetailSheet({ entry, onClose }: JournalDetailSheetProps) {
  const isPublic = entry.is_public;

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-root/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sheet */}
      <div className="relative bg-linen h-[95vh] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] flex flex-col pt-1">
        
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-fence rounded-full mx-auto my-2" />

        <div className="sticky top-0 bg-linen/95 backdrop-blur z-10 border-b border-fence px-6 pt-2 pb-4 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="flex gap-2 items-center mb-1">
              <span className="px-2 py-0.5 rounded-full bg-creek text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {entry.category}
              </span>
              <span className="text-xs text-stone-c font-dm-sans">{new Date(entry.created_at.seconds * 1000).toLocaleDateString()}</span>
            </div>
            <h2 className="font-bitter text-3xl font-bold text-root leading-tight">{entry.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-xs font-dm-sans text-stone-c font-bold">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {entry.author}</span>
              {entry.zone_id && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-petal" /> Zone {entry.zone_id}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-clay rounded-full text-stone-c hover:text-root transition-colors shadow-smShrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {entry.weather_snapshot && (
            <div className="bg-creek-lt border border-creek/20 p-3 rounded-xl flex justify-between items-center text-sm font-dm-sans shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-creek" />
                <span className="text-root font-bold">{entry.weather_snapshot.conditions}</span>
              </div>
              <div className="text-stone-c flex gap-3 text-xs">
                <span>H: {entry.weather_snapshot.temp_hi}°</span>
                <span>L: {entry.weather_snapshot.temp_lo}°</span>
              </div>
            </div>
          )}

          <div className="prose prose-sm prose-stone mt-4 max-w-none text-root leading-relaxed font-dm-sans prose-img:rounded-md prose-headings:font-bitter">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.body}</ReactMarkdown>
          </div>

          {entry.photo_urls && entry.photo_urls.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-fence-lt">
              <h3 className="font-bold text-xs uppercase text-stone-c tracking-widest">Attached Field Photos</h3>
              <div className="grid grid-cols-2 gap-3">
                {entry.photo_urls.map((url, i) => (
                  <AttachedPhoto key={i} url={url} />
                ))}
              </div>
            </div>
          )}

          {isPublic && (
            <div className="mt-8 pt-6 border-t-2 border-dashed border-fence bg-petal-lt/30 p-5 rounded-xl border border-petal/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-petal text-white text-[10px] uppercase font-bold py-1 px-3 rounded-bl-lg">Growing Guide Blog</div>
              <h3 className="font-bitter text-xl font-bold text-root mb-2 mt-2">{entry.public_title}</h3>
              <div className="prose prose-sm prose-stone max-w-none text-root font-dm-sans">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.public_body || ''}</ReactMarkdown>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
