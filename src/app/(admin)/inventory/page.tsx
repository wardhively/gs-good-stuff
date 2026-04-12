"use client";

import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { useZones } from "@/hooks/useZones";
import { STATUS_COLORS, StatusEnum } from "@/lib/constants";
import { Search, Plus, ListChecks, Database } from "lucide-react";
import VarietyDetailSheet from "@/components/admin/VarietyDetailSheet";
import type { Variety } from "@/lib/types";
import { advanceVarietyStatus, getNextStatus } from "@/lib/inventory-utils";

export default function InventoryPage() {
  const { varieties, loading, saveVariety, bulkUpdateVarieties, createVariety } = useInventory();
  const { zones } = useZones();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusEnum | "">("");
  
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newVariety, setNewVariety] = useState({ name: '', count: 1, price: 0, zone_id: '', bloom_form: '', bloom_size: '', height: '', season: '', grade: '', status: 'stored' as const });

  // Filter varieties
  const filtered = varieties.filter(v => {
    if (statusFilter && v.status !== statusFilter) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelection = (id: string) => {
    setSelection(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const handleLongPress = (id: string) => {
    setIsBulkMode(true);
    setSelection(new Set([id]));
  };

  const handleRowTap = (v: Variety) => {
    if (isBulkMode) toggleSelection(v.id);
    else setSelectedVariety(v);
  };

  const executeBulkAdvance = async () => {
    if (selection.size === 0) return;
    const selectedVars = varieties.filter(v => selection.has(v.id));
    
    // Auto-advance each to its own next stage. 
    // In a real app we might only allow bulk selecting items of the same status.
    const updates = selectedVars.map(v => {
      const target = getNextStatus(v.status);
      return { id: v.id, updates: target ? advanceVarietyStatus(v, target, "Bulk advance") : v };
    });

    await bulkUpdateVarieties(updates);
    setSelection(new Set());
    setIsBulkMode(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-c animate-pulse font-bold">Loading inventory...</div>;
  }

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      {/* Header & Sticky Constraints */}
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <h1 className="font-bitter text-3xl font-bold text-root mb-4">Inventory</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-ash w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search varieties..." 
            className="w-full bg-white border border-fence rounded-xl pl-10 pr-4 py-2 font-dm-sans text-root focus:outline-none focus:border-soil focus:ring-1 focus:ring-soil"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button 
            onClick={() => setStatusFilter("")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${!statusFilter ? "bg-root text-white border-root" : "bg-white text-stone-c border-fence"}`}
          >
            All
          </button>
          {Object.values(StatusEnum).map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border capitalize transition-colors ${statusFilter === s ? "bg-soil text-white border-soil" : "bg-white text-stone-c border-fence"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 flex flex-col gap-3">
        {filtered.map(v => {
          const badgeColor = STATUS_COLORS[v.status] || '#8B7D6B';
          const isSelected = selection.has(v.id);

          return (
            <div 
              key={v.id}
              onClick={() => handleRowTap(v)}
              className={`bg-white rounded-xl p-4 border transition-all ${isSelected ? "border-soil shadow-md ring-1 ring-soil" : "border-fence-lt hover:border-fence shadow-sm"} relative`}
              onTouchStart={(e) => {
                // simple mobile long-press primitive map
                const timer = setTimeout(() => handleLongPress(v.id), 600);
                e.currentTarget.dataset.timer = timer.toString();
              }}
              onTouchEnd={(e) => clearTimeout(Number(e.currentTarget.dataset.timer))}
              onContextMenu={(e) => { e.preventDefault(); handleLongPress(v.id); }} // Right click on desktop simulates long press
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  {isBulkMode && (
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? "bg-soil border-soil" : "border-ash"}`}>
                      {isSelected && <ListChecks className="w-3 h-3 text-white" />}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-root text-lg">{v.name}</h3>
                    <p className="text-xs text-stone-c font-dm-sans">{v.zone_id || 'No Zone'} • {v.bloom_form || 'Form Unknown'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-root text-lg">{v.count}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-white tracking-widest" style={{backgroundColor: badgeColor}}>{v.status}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-stone-c">
            <Database className="w-12 h-12 mx-auto text-fence mb-3" />
            <p className="font-bold">No varieties found</p>
            <p className="text-sm">Adjust filters or create a new one.</p>
          </div>
        )}
      </div>

      {/* FAB - Create New */}
      {!isBulkMode && (
        <button 
          className="fixed bottom-24 right-6 w-14 h-14 bg-petal text-white rounded-full shadow-[0_4px_14px_rgba(193,127,78,0.5)] flex justify-center items-center hover:bg-petal-dk hover:scale-105 active:scale-95 transition-all z-40"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Bulk Action Bar */}
      {isBulkMode && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-root text-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-50 flex justify-between items-center animate-in slide-in-from-bottom">
          <div>
            <p className="font-bold">{selection.size} Selected</p>
            <button onClick={() => { setIsBulkMode(false); setSelection(new Set()); }} className="text-xs text-ash hover:text-white">Cancel</button>
          </div>
          <button 
            disabled={selection.size === 0}
            onClick={executeBulkAdvance}
            className="bg-soil px-4 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Advance Selected
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedVariety && (
        <VarietyDetailSheet
          variety={selectedVariety}
          onClose={() => setSelectedVariety(null)}
          onSave={saveVariety}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
          <div className="absolute inset-0 bg-root/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-fence rounded-full mx-auto mt-3 mb-2" />
            <div className="px-6 pb-6">
              <h2 className="font-bitter text-xl font-bold text-root mb-4">New Variety</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Name *</label>
                  <input value={newVariety.name} onChange={e => setNewVariety(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" placeholder="Café au Lait" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Count</label>
                    <input type="number" value={newVariety.count} onChange={e => setNewVariety(p => ({ ...p, count: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Price ($)</label>
                    <input type="number" step="0.01" value={newVariety.price} onChange={e => setNewVariety(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Bloom Form</label>
                    <input value={newVariety.bloom_form} onChange={e => setNewVariety(p => ({ ...p, bloom_form: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" placeholder="Dinnerplate" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Bloom Size</label>
                    <input value={newVariety.bloom_size} onChange={e => setNewVariety(p => ({ ...p, bloom_size: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" placeholder="AA" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Zone</label>
                  <select value={newVariety.zone_id} onChange={e => setNewVariety(p => ({ ...p, zone_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                    <option value="">Unassigned</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <button
                  disabled={!newVariety.name}
                  onClick={async () => {
                    await createVariety(newVariety as any);
                    setShowCreate(false);
                    setNewVariety({ name: '', count: 1, price: 0, zone_id: '', bloom_form: '', bloom_size: '', height: '', season: '', grade: '', status: 'stored' as const });
                  }}
                  className="w-full py-3 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors disabled:opacity-50 mt-2"
                >
                  Create Variety
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
