"use client";

import { useState } from "react";
import { useJournal } from "@/hooks/useJournal";
import { useZones } from "@/hooks/useZones";
import { Plus, WifiOff, Cloud } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
import JournalDetailSheet from "@/components/admin/JournalDetailSheet";
import JournalEntryModal from "@/components/admin/JournalEntryModal";

export default function JournalPage() {
  const { entries, loading, createJournalEntry } = useJournal();
  const { zones } = useZones();
  
  const [catFilter, setCatFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filtered = entries.filter(e => {
    if (catFilter && e.category !== catFilter) return false;
    if (authorFilter && e.author !== authorFilter) return false;
    return true;
  });

  const getBadgeColor = (cat: string) => {
    switch (cat) {
      case 'observation': return 'bg-creek';
      case 'planting': return 'bg-leaf';
      case 'harvest': return 'bg-bloom';
      case 'maintenance': return 'bg-petal';
      case 'business': return 'bg-soil';
      default: return 'bg-stone-c';
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-c animate-pulse font-bold">Loading field notes...</div>;

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <h1 className="font-bitter text-3xl font-bold text-root mb-4">Field Journal</h1>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button 
            onClick={() => setCatFilter("")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${!catFilter ? "bg-root text-white border-root" : "bg-white text-stone-c border-fence"}`}
          >
            All
          </button>
          {['observation', 'planting', 'harvest', 'maintenance', 'business'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border capitalize transition-colors ${catFilter === cat ? "bg-soil text-white border-soil" : "bg-white text-stone-c border-fence"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {filtered.map(entry => {
          const hasPending = entry.photo_urls?.some(u => u.startsWith('pending://'));

          return (
            <div 
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="bg-white rounded-xl p-5 border border-fence-lt shadow-sm hover:border-soil hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${getBadgeColor(entry.category)}`}>
                  {entry.category}
                </span>
                <span className="text-xs text-stone-c font-dm-sans">{new Date(entry.created_at.seconds * 1000).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-root text-lg leading-tight mb-1">{entry.title}</h3>
              <p className="text-sm text-stone-c font-dm-sans line-clamp-2 leading-relaxed mb-3">{entry.body}</p>
              
              <div className="flex justify-between items-center mt-2 border-t border-fence-lt pt-3">
                <div className="flex items-center gap-3 text-xs text-stone-c font-dm-sans font-bold">
                  <span>{entry.author}</span>
                  {entry.photo_urls && entry.photo_urls.length > 0 && (
                    <span className="text-petal flex items-center gap-1">• {entry.photo_urls.length} Photos</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {entry.weather_snapshot && <Cloud className="w-4 h-4 text-creek" />}
                  {hasPending && <span title="Sync pending offline"><WifiOff className="w-4 h-4 text-bloom animate-pulse" /></span>}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-stone-c">
            <p className="font-bold">No entries found</p>
          </div>
        )}
      </div>

      <button 
        className="fixed bottom-24 right-6 w-14 h-14 bg-petal text-white rounded-full shadow-lg flex justify-center items-center hover:bg-petal-dk hover:scale-105 active:scale-95 transition-all z-40"
        onClick={() => setIsCreating(true)}
      >
        <Plus className="w-6 h-6" />
      </button>

      {selectedEntry && (
        <JournalDetailSheet entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      {isCreating && (
        <JournalEntryModal 
          onClose={() => setIsCreating(false)} 
          onSubmit={createJournalEntry}
          zones={zones}
          varieties={[]}
        />
      )}
    </div>
  );
}
