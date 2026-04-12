"use client";

import { useState } from "react";
import { ChevronLeft, Database, Save, Calendar as CalIcon, MapPin, Truck, Bell } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { getDocs, query } from "firebase/firestore";
import { collections } from "@/lib/firestore";

export default function SettingsView() {
  const { settings, loading, saveSettings } = useSettings();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const snapObj: any = {};
      const targets: Array<{ k: string, ref: any }> = [
        { k: 'zones', ref: collections.zones },
        { k: 'varieties', ref: collections.varieties },
        { k: 'tasks', ref: collections.tasks },
        { k: 'journal', ref: collections.journalEntries },
        { k: 'equipment', ref: collections.equipment },
        { k: 'orders', ref: collections.orders },
        { k: 'weather', ref: collections.weatherLog },
        { k: 'business', ref: collections.businessPlan }
      ];

      for (const t of targets) {
         const snap = await getDocs(query(t.ref));
         snapObj[t.k] = snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
      }

      const blob = new Blob([JSON.stringify(snapObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `gsgoodstuff_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error generating full payload map natively.");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !settings) return <div className="p-8 text-center text-stone-c font-bold animate-pulse">Loading system mappings...</div>;

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bitter text-3xl font-bold text-root">Settings</h1>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6 max-w-3xl mx-auto">
         
         {/* Farm Profile */}
         <div className="bg-white rounded-xl border border-fence-lt shadow-sm overflow-hidden">
            <div className="bg-linen p-4 border-b border-fence-lt flex items-center gap-2">
               <MapPin className="w-5 h-5 text-root" />
               <h2 className="font-bold text-root">Farm Environment</h2>
            </div>
            <div className="p-4 space-y-4 font-dm-sans">
               <div>
                  <label className="text-xs font-bold text-stone-c uppercase tracking-widest block mb-1">Last Frost Date (Spring)</label>
                  <input
                     type="date"
                     className="w-full p-3 bg-white border border-fence rounded-lg font-bold text-root"
                     value={settings.last_frost_date ? `2026-${settings.last_frost_date}` : ''}
                     onChange={e => { const v = e.target.value; if (v) saveSettings({ last_frost_date: v.substring(5) }); }}
                  />
                  <p className="text-[10px] text-ash mt-1">Currently: {settings.last_frost_date || 'Not set'}</p>
               </div>
               <div>
                  <label className="text-xs font-bold text-stone-c uppercase tracking-widest block mb-1">First Frost Date (Fall)</label>
                  <input
                     type="date"
                     className="w-full p-3 bg-white border border-fence rounded-lg font-bold text-root"
                     value={settings.first_frost_date ? `2026-${settings.first_frost_date}` : ''}
                     onChange={e => { const v = e.target.value; if (v) saveSettings({ first_frost_date: v.substring(5) }); }}
                  />
                  <p className="text-[10px] text-ash mt-1">Currently: {settings.first_frost_date || 'Not set'}</p>
               </div>
            </div>
         </div>

         {/* Shipping Configuration */}
         <div className="bg-white rounded-xl border border-fence-lt shadow-sm overflow-hidden">
            <div className="bg-linen p-4 border-b border-fence-lt flex items-center gap-2">
               <Truck className="w-5 h-5 text-root" />
               <h2 className="font-bold text-root">Shipping Constraints</h2>
            </div>
            <div className="p-4 space-y-4 font-dm-sans">
               <div>
                  <label className="text-xs font-bold text-stone-c uppercase tracking-widest block mb-1">Flat Rate ($)</label>
                  <input 
                     type="number" 
                     className="w-full p-3 bg-white border border-fence rounded-lg font-bold text-root"
                     value={settings.shipping_flat_rate || 9.45}
                     onChange={e => saveSettings({ shipping_flat_rate: parseFloat(e.target.value) })}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-stone-c uppercase tracking-widest block mb-1">Free Shipping Threshold ($)</label>
                  <input 
                     type="number" 
                     className="w-full p-3 bg-white border border-fence rounded-lg font-bold text-root"
                     value={settings.free_shipping_threshold || 150}
                     onChange={e => saveSettings({ free_shipping_threshold: parseFloat(e.target.value) })}
                  />
               </div>
            </div>
         </div>

         {/* Notification Limits */}
         <div className="bg-white rounded-xl border border-fence-lt shadow-sm overflow-hidden">
            <div className="bg-linen p-4 border-b border-fence-lt flex items-center gap-2">
               <Bell className="w-5 h-5 text-root" />
               <h2 className="font-bold text-root">Notification Routing (Gary)</h2>
            </div>
            <div className="p-4 space-y-4 font-dm-sans">
               {Object.entries({
                  "Frost Alerts": "frost_alerts",
                  "Morning Briefs": "morning_brief",
                  "New Orders": "orders",
                  "Overdue Equipment": "equipment",
               }).map(([label, key]) => {
                  const prefs: Record<string, boolean> = (settings.notification_prefs?.Gary as unknown as Record<string, boolean>) || {};
                  const isActive = prefs[key] !== false; // default true if missing
                  
                  return (
                     <div key={key} className="flex justify-between items-center border-b border-fence-lt pb-3 last:border-0 last:pb-0">
                        <span className="font-bold text-root">{label}</span>
                        <button 
                           onClick={() => {
                              const newPrefs = { ...prefs, [key]: !isActive };
                              saveSettings({ notification_prefs: { ...settings.notification_prefs, Gary: newPrefs as any } });
                           }}
                           className={`w-12 h-6 rounded-full relative transition-colors ${isActive ? 'bg-leaf' : 'bg-fence'}`}
                        >
                           <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Export Data Module */}
         <div className="bg-gradient-to-r from-clay to-linen border border-fence-lt p-6 rounded-2xl shadow-sm text-root">
            <div className="flex items-center gap-3 mb-2">
               <Database className="w-6 h-6 text-petal" />
               <h3 className="font-bold text-xl">Archive & Database Export</h3>
            </div>
            <p className="text-sm text-stone-c font-dm-sans mb-4">
               Pull a literal JSON snapshot natively iterating over 100% of collection documents. This bypasses Cloud limits explicitly creating an offline Blob array directly through the native memory context.
            </p>
            <button 
               onClick={handleExport} disabled={exporting}
               className="flex items-center gap-2 bg-root text-white shadow-sm px-6 py-3 rounded-lg font-bold hover:bg-soil transition-colors disabled:opacity-50"
            >
               <Save className="w-4 h-4"/> {exporting ? 'Processing Architecture...' : 'Export Native Payload'}
            </button>
         </div>

      </div>
    </div>
  );
}
