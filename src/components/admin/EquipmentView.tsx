"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Plus, Gauge, Wrench, AlertTriangle, CheckCircle2, Trash2, Pencil, Camera, X, Save } from "lucide-react";
import Link from "next/link";
import { useEquipment } from "@/hooks/useEquipment";
import type { Equipment } from "@/lib/types";
import type { ChecklistItem } from "@/lib/types";
import EquipmentMaintenanceModal from "@/components/admin/EquipmentMaintenanceModal";
import Checklist from "@/components/admin/Checklist";
import { useTasks } from "@/hooks/useTasks";
import { EQUIPMENT_CHECKLIST_DEFAULTS } from "@/lib/constants";
import { Timestamp } from "firebase/firestore";
import { cacheFileOffline, syncPendingFiles } from "@/lib/storage-sync";

export default function EquipmentView() {
  const { equipment, loading, saveEquipment, createEquipment, deleteEquipment, logMaintenance } = useEquipment();
  const { createTask } = useTasks();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newMakeModel, setNewMakeModel] = useState("");
  const [newHours, setNewHours] = useState("0");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editMakeModel, setEditMakeModel] = useState("");
  const [editHours, setEditHours] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploadId, setPhotoUploadId] = useState<string | null>(null);

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'ok': return 'bg-leaf';
      case 'due_soon': return 'bg-bloom';
      case 'overdue': return 'bg-frost';
      default: return 'bg-stone-c';
    }
  };

  const handleDelete = async (eq: Equipment) => {
    if (!window.confirm(`Delete "${eq.name}"? This cannot be undone.`)) return;
    await deleteEquipment(eq.id);
    setExpandedId(null);
  };

  const startEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setEditName(eq.name);
    setEditType(eq.type);
    setEditMakeModel(eq.make_model || "");
    setEditHours(eq.current_hours.toString());
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await saveEquipment(editingId, {
      name: editName.trim(),
      type: editType.trim(),
      make_model: editMakeModel.trim() || undefined,
      current_hours: parseFloat(editHours) || 0,
    } as any);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createEquipment({
      name: newName.trim(),
      type: newType.trim() || "Other",
      make_model: newMakeModel.trim() || undefined,
      current_hours: parseFloat(newHours) || 0,
      status: "ok",
      service_items: [],
    } as any);
    setShowCreate(false);
    setNewName(""); setNewType(""); setNewMakeModel(""); setNewHours("0");
  };

  const handlePhotoUpload = async (eqId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const pendingUrl = await cacheFileOffline(eqId, files[0], 'receipt');
    await saveEquipment(eqId, { photo_url: pendingUrl } as any);
    syncPendingFiles();
    setPhotoUploadId(null);
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
        {equipment.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-ash mx-auto mb-3" />
            <p className="font-bold text-root">No equipment yet</p>
            <p className="text-sm text-stone-c">Tap + to add your first machine</p>
          </div>
        )}

        {equipment.map(eq => {
          const isExpanded = expandedId === eq.id;
          const isEditing = editingId === eq.id;

          return (
            <div key={eq.id} className="bg-linen rounded-xl border border-fence-lt p-4 shadow-sm">
              {/* Header */}
              <div className="flex justify-between items-start mb-3 cursor-pointer" onClick={() => !isEditing && setExpandedId(isExpanded ? null : eq.id)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${getStatusColor(eq.status)}`}>
                      {eq.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-stone-c font-dm-sans font-bold flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-petal" /> {eq.current_hours} hrs
                    </span>
                  </div>
                  <h3 className="font-bold text-root text-lg leading-tight">{eq.name}</h3>
                  <p className="text-xs text-stone-c font-dm-sans">{eq.make_model || eq.type}</p>
                </div>
                {eq.photo_url && !eq.photo_url.startsWith('pending://') && (
                  <img src={eq.photo_url} alt={eq.name} className="w-16 h-16 rounded-lg object-cover border border-fence-lt" />
                )}
              </div>

              {/* Service progress bars */}
              <div className="space-y-2 mb-2" onClick={() => !isEditing && setExpandedId(isExpanded ? null : eq.id)}>
                {eq.service_items.map((svc, i) => {
                  const elapsed = eq.current_hours - (svc.last_completed_hours || 0);
                  const percentage = Math.min((elapsed / svc.interval_hours) * 100, 100);
                  const barColor = percentage > 90 ? 'bg-frost' : percentage > 75 ? 'bg-bloom' : 'bg-leaf';
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-stone-c uppercase tracking-widest">
                        <span>{svc.type}</span>
                        <span>{Math.round(elapsed)}/{svc.interval_hours}h</span>
                      </div>
                      <div className="h-1.5 w-full bg-clay rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} transition-all`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded view */}
              {isExpanded && !isEditing && (
                <div className="mt-4 pt-4 border-t border-fence-lt space-y-4">
                  {/* Checklist */}
                  <div>
                    <h4 className="font-bold text-xs uppercase text-stone-c tracking-widest mb-2">Checklist</h4>
                    <Checklist
                      items={eq.checklist || []}
                      presetItems={EQUIPMENT_CHECKLIST_DEFAULTS}
                      onChange={(items: ChecklistItem[]) => saveEquipment(eq.id, { checklist: items } as any)}
                    />
                  </div>

                  {/* Photo */}
                  <div>
                    <h4 className="font-bold text-xs uppercase text-stone-c tracking-widest mb-2">Photo</h4>
                    {eq.photo_url && !eq.photo_url.startsWith('pending://') ? (
                      <img src={eq.photo_url} alt={eq.name} className="w-full h-40 rounded-lg object-cover border border-fence-lt mb-2" />
                    ) : (
                      <p className="text-sm text-ash italic mb-2">No photo</p>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => photoUploadId && handlePhotoUpload(photoUploadId, e.target.files)} />
                    <button
                      onClick={() => { setPhotoUploadId(eq.id); setTimeout(() => fileInputRef.current?.click(), 50); }}
                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-fence rounded-lg text-sm text-stone-c hover:bg-clay transition-colors"
                    >
                      <Camera className="w-4 h-4" /> {eq.photo_url ? 'Replace Photo' : 'Add Photo'}
                    </button>
                  </div>

                  {/* Service log */}
                  <div>
                    <h4 className="font-bold text-xs uppercase text-stone-c tracking-widest mb-2">Service Log</h4>
                    {(!eq.maintenance_log || eq.maintenance_log.length === 0) ? (
                      <p className="text-sm text-ash italic">No service records.</p>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {[...eq.maintenance_log].reverse().map((log, i) => (
                          <div key={i} className="bg-cream p-3 rounded-lg border border-fence-lt text-xs">
                            <div className="flex justify-between font-bold text-root">
                              <span>{log.type}</span>
                              <span>{log.date?.seconds ? new Date(log.date.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            {log.notes && <p className="text-stone-c mt-1">{log.notes}</p>}
                            {log.cost != null && <p className="text-petal font-bold mt-1">${log.cost}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setLoggingId(eq.id)}
                      className="w-full mt-3 bg-soil text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-root transition-colors"
                    >
                      <Wrench className="w-4 h-4" /> Log Maintenance
                    </button>
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(eq)} className="flex-1 py-3 rounded-xl font-bold border border-fence text-stone-c hover:bg-clay transition-colors flex items-center justify-center gap-2">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(eq)} className="py-3 px-4 rounded-xl font-bold border border-frost-lt text-frost hover:bg-frost-lt transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Edit form inline */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-fence-lt space-y-3">
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Name</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Type</label>
                      <input value={editType} onChange={e => setEditType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Hours</label>
                      <input type="number" value={editHours} onChange={e => setEditHours(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Make/Model</label>
                    <input value={editMakeModel} onChange={e => setEditMakeModel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-lg font-bold border border-fence text-stone-c text-sm">Cancel</button>
                    <button onClick={saveEdit} className="flex-1 py-2 rounded-lg font-bold bg-soil text-white text-sm flex items-center justify-center gap-1"><Save className="w-4 h-4" /> Save</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAB — Create */}
      <button
        className="fixed bottom-24 right-6 w-14 h-14 bg-petal text-white rounded-full shadow-lg flex justify-center items-center hover:scale-105 active:scale-95 transition-all z-40"
        onClick={() => setShowCreate(true)}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
          <div className="absolute inset-0 bg-root/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-fence rounded-full mx-auto mt-3 mb-2" />
            <div className="px-6 pb-6">
              <h2 className="font-bitter text-xl font-bold text-root mb-4">New Equipment</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Name *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Kubota L2501" className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Type</label>
                    <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                      <option value="">Select...</option>
                      <option>Tractor</option>
                      <option>Implement</option>
                      <option>Generator</option>
                      <option>Truck</option>
                      <option>ATV</option>
                      <option>Tool</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Current Hours</label>
                    <input type="number" value={newHours} onChange={e => setNewHours(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Make/Model</label>
                  <input value={newMakeModel} onChange={e => setNewMakeModel(e.target.value)} placeholder="Brand and model" className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                </div>
                <button onClick={handleCreate} disabled={!newName.trim()} className="w-full py-3 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors disabled:opacity-50">
                  Create Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance modal */}
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
