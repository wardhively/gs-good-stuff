import { useState } from "react";
import { ChevronLeft, Plus, Gauge, Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEquipment } from "@/hooks/useEquipment";
import type { Equipment } from "@/lib/types";
import EquipmentMaintenanceModal from "@/components/admin/EquipmentMaintenanceModal";
import { useTasks } from "@/hooks/useTasks";
import { Timestamp } from "firebase/firestore";

export default function EquipmentView() {
  const { equipment, loading, logMaintenance } = useEquipment();
  const { createTask } = useTasks();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'ok': return 'bg-leaf';
      case 'due_soon': return 'bg-bloom';
      case 'overdue': return 'bg-frost';
      default: return 'bg-stone-c';
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-c font-bold animate-pulse">Loading machines...</div>;

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm flex items-center gap-3">
        <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-bitter text-3xl font-bold text-root">Fleet Manager</h1>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {equipment.map(eq => {
          const isExpanded = expandedId === eq.id;
          const statusColors = getStatusColor(eq.status);

          return (
            <div key={eq.id} className="bg-linen rounded-xl border border-fence-lt p-4 shadow-sm relative transition-all">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4" onClick={() => setExpandedId(isExpanded ? null : eq.id)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${statusColors}`}>
                      {eq.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-stone-c font-dm-sans font-bold flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-petal" /> {eq.current_hours} hrs
                    </span>
                  </div>
                  <h3 className="font-bold text-root text-lg leading-tight">{eq.name}</h3>
                  <p className="text-xs text-stone-c font-dm-sans">{eq.make_model || eq.type}</p>
                </div>
              </div>

              {/* Progress Bars (Mini) */}
              <div className="space-y-3 mb-2" onClick={() => setExpandedId(isExpanded ? null : eq.id)}>
                {eq.service_items.map((svc, i) => {
                  // Stubbed percentage logic. Real app calculates currentHours - hoursAtService.
                  const percentage = Math.min(65, 100); 
                  const barColor = percentage > 90 ? 'bg-frost' : percentage > 75 ? 'bg-bloom' : 'bg-leaf';

                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-stone-c uppercase tracking-widest">
                        <span>{svc.type}</span>
                        <span>{svc.interval_hours}h</span>
                      </div>
                      <div className="h-1.5 w-full bg-clay rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div className="mt-6 pt-4 border-t border-fence-lt animate-in fade-in slide-in-from-top-2">
                  <h4 className="font-bold text-xs uppercase text-stone-c tracking-widest mb-3">Service Log</h4>
                  
                  <div className="space-y-3 font-dm-sans max-h-[300px] overflow-y-auto pr-1">
                    {(!eq.maintenance_log || eq.maintenance_log.length === 0) ? (
                      <p className="text-sm text-stone-c italic">No service records found.</p>
                    ) : (
                      [...eq.maintenance_log].reverse().map((log, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-fence shadow-sm flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-bold text-root">
                            <span>{log.type}</span>
                            <span>{new Date(log.date.seconds * 1000).toLocaleDateString()}</span>
                          </div>
                          {log.notes && <p className="text-xs text-stone-c">{log.notes}</p>}
                          {log.cost && <p className="text-xs text-petal font-bold">${log.cost}</p>}
                          {log.receipt_url && (
                             <a href={log.receipt_url} className="text-[10px] uppercase font-bold text-creek mt-1 flex items-center gap-1">
                               View Receipt
                             </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <button 
                    onClick={() => setLoggingId(eq.id)}
                    className="w-full mt-4 bg-soil text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-root transition-colors shadow-sm"
                  >
                    <Wrench className="w-4 h-4" /> Log Maintenance
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        className="fixed bottom-24 right-6 w-14 h-14 bg-petal text-white rounded-full shadow-lg flex justify-center items-center hover:bg-petal-dk hover:scale-105 active:scale-95 transition-all z-40"
        onClick={() => {}}
      >
        <Plus className="w-6 h-6" />
      </button>

      {loggingId && (
        <EquipmentMaintenanceModal 
          equipment={equipment.find(e => e.id === loggingId)!}
          onClose={() => setLoggingId(null)}
          onSave={async (entry) => {
            await logMaintenance(loggingId, entry, createTask);
            setLoggingId(null);
          }}
        />
      )}
    </div>
  );
}
