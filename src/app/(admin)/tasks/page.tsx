"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useZones } from "@/hooks/useZones";
import { useInventory } from "@/hooks/useInventory";
import { Plus, Check, MapPin, Wrench, Clock, BellRing, Sparkles, X, ListChecks, Calendar, Pencil, Trash2 } from "lucide-react";
import { PRIORITY_COLORS } from "@/lib/constants";
import TaskCreationModal from "@/components/admin/TaskCreationModal";
import type { Task, ChecklistItem } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import { isToday, isTomorrow, isThisWeek, addDays, format } from "date-fns";

interface ChecklistTaskItem {
  id: string;
  label: string;
  parentType: 'zone' | 'variety';
  parentId: string;
  parentName: string;
  status: string;
  due_date?: string;
  completed: boolean;
}

export default function TasksPage() {
  const { tasks, loading, saveTask, createTask, deleteTask } = useTasks();
  const { zones, saveZone } = useZones();
  const { varieties, saveVariety } = useInventory();

  const [priorityFilter, setPriorityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [isCreating, setIsCreating] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState<string | null>(null);
  const [dueDateInput, setDueDateInput] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [viewMode, setViewMode] = useState<'tasks' | 'checklists'>('tasks');

  // Gather all incomplete checklist items from zones and varieties
  const checklistTasks: ChecklistTaskItem[] = [];
  zones.forEach(z => {
    (z.checklist || []).filter(c => !c.completed).forEach(c => {
      checklistTasks.push({ id: c.id, label: c.label, parentType: 'zone', parentId: z.id, parentName: z.name, status: z.status, due_date: c.due_date, completed: c.completed });
    });
  });
  varieties.forEach(v => {
    (v.checklist || []).filter(c => !c.completed).forEach(c => {
      checklistTasks.push({ id: c.id, label: c.label, parentType: 'variety', parentId: v.id, parentName: v.name, status: v.status, due_date: c.due_date, completed: c.completed });
    });
  });

  // Grouping logic for main tasks
  const filtered = tasks.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (sourceFilter && t.source !== sourceFilter) return false;
    return true;
  });

  const getGroup = (due: Timestamp | null) => {
    if (!due) return "Later";
    const d = new Date(due.seconds * 1000);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    if (isThisWeek(d)) return "This Week";
    return "Later";
  };

  const groupedTasks: Record<string, Task[]> = {
    "Today": [],
    "Tomorrow": [],
    "This Week": [],
    "Later": []
  };

  filtered.forEach(t => groupedTasks[getGroup(t.due_date)].push(t));

  const handleComplete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await saveTask(id, { status: "completed" });
  };

  const handleSnooze = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const d = task.due_date ? new Date(task.due_date.seconds * 1000) : new Date();
    await saveTask(task.id, { due_date: Timestamp.fromDate(addDays(d, 1)) });
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await saveTask(id, { status: "dismissed" });
  };

  if (loading) return <div className="p-8 text-center text-stone-c animate-pulse font-bold">Loading tasks...</div>;

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <h1 className="font-bitter text-3xl font-bold text-root mb-4">Task Engine</h1>
        
        {/* View toggle */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setViewMode('tasks')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'tasks' ? 'bg-soil text-white' : 'bg-clay text-stone-c'}`}>
            Tasks
          </button>
          <button onClick={() => setViewMode('checklists')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${viewMode === 'checklists' ? 'bg-soil text-white' : 'bg-clay text-stone-c'}`}>
            <ListChecks className="w-4 h-4" /> Checklists {checklistTasks.length > 0 && <span className="bg-frost text-white text-[10px] px-1.5 rounded-full">{checklistTasks.length}</span>}
          </button>
        </div>

        {viewMode === 'tasks' && (
          <>
            {/* Status filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 mb-2 border-b border-fence-lt pb-3">
              <span className="text-[10px] uppercase font-bold text-stone-c self-center mr-1 tracking-widest">Status:</span>
              {['all', 'pending', 'accepted', 'completed', 'dismissed', 'snoozed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s === 'all' ? "" : s)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors border ${
                    (s === 'all' && !statusFilter) || statusFilter === s ? "bg-root text-white border-root" : "bg-white text-stone-c border-fence"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Source filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 mb-2 border-b border-fence-lt pb-3">
              <span className="text-[10px] uppercase font-bold text-stone-c self-center mr-1 tracking-widest">Source:</span>
              {['all', 'ai', 'manual', 'weather', 'equipment'].map(src => (
                <button
                  key={src}
                  onClick={() => setSourceFilter(src === 'all' ? "" : src)}
                  className={`whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors border ${
                    (src === 'all' && !sourceFilter) || sourceFilter === src ? "bg-root text-white border-root" : "bg-white text-stone-c border-fence"
                  }`}
                >
                  {src === 'ai' && <Sparkles className="w-3 h-3" />}
                  {src}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Checklists view */}
      {viewMode === 'checklists' && (
        <div className="p-4">
          {checklistTasks.length === 0 ? (
            <div className="text-center py-12">
              <ListChecks className="w-12 h-12 text-ash mx-auto mb-3" />
              <p className="font-bold text-root">All caught up!</p>
              <p className="text-sm text-stone-c">No outstanding checklist items from zones or varieties.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {checklistTasks.map(ct => {
                const toggleChecklistItem = async () => {
                  const collection = ct.parentType === 'zone' ? zones : varieties;
                  const parent = collection.find((p: any) => p.id === ct.parentId);
                  if (!parent) return;
                  const checklist = ((parent as any).checklist || []).map((c: any) =>
                    c.id === ct.id ? { ...c, completed: !c.completed } : c
                  );
                  if (ct.parentType === 'zone') await saveZone(ct.parentId, { checklist } as any);
                  else await saveVariety(ct.parentId, { checklist } as any);
                };

                const setChecklistDueDate = async (newDate: string) => {
                  const collection = ct.parentType === 'zone' ? zones : varieties;
                  const parent = collection.find((p: any) => p.id === ct.parentId);
                  if (!parent) return;
                  const checklist = ((parent as any).checklist || []).map((c: any) => {
                    if (c.id !== ct.id) return c;
                    const updated = { ...c };
                    if (newDate) updated.due_date = newDate;
                    else delete updated.due_date;
                    return updated;
                  });
                  if (ct.parentType === 'zone') await saveZone(ct.parentId, { checklist } as any);
                  else await saveVariety(ct.parentId, { checklist } as any);
                };

                const deleteChecklistItem = async () => {
                  if (!window.confirm(`Delete "${ct.label}"?`)) return;
                  const collection = ct.parentType === 'zone' ? zones : varieties;
                  const parent = collection.find((p: any) => p.id === ct.parentId);
                  if (!parent) return;
                  const checklist = ((parent as any).checklist || []).filter((c: any) => c.id !== ct.id);
                  if (ct.parentType === 'zone') await saveZone(ct.parentId, { checklist } as any);
                  else await saveVariety(ct.parentId, { checklist } as any);
                };

                const isExpanded = expandedTask === `cl-${ct.id}`;

                return (
                  <div key={ct.id} className={`bg-linen rounded-xl border p-3 transition-colors ${ct.completed ? 'border-leaf/30 opacity-60' : 'border-fence-lt'}`}>
                    <div className="flex items-start gap-3" onClick={() => setExpandedTask(isExpanded ? null : `cl-${ct.id}`)}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleChecklistItem(); }}
                        className={`w-6 h-6 rounded-md flex-shrink-0 border-2 flex items-center justify-center mt-0.5 active:scale-90 transition-colors ${
                          ct.completed ? 'bg-leaf border-leaf text-white' : 'border-fence bg-linen hover:border-stone-c'
                        }`}
                      >
                        {ct.completed && <Check className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${ct.completed ? 'line-through text-ash' : 'text-root'}`}>{ct.label}</p>
                        <p className="text-[11px] text-stone-c mt-0.5">
                          {ct.parentType === 'zone' ? <MapPin className="w-3 h-3 inline mr-1" /> : null}
                          {ct.parentName} <span className="text-ash">· {ct.status}</span>
                          {ct.due_date && <span className="text-creek ml-2">· {ct.due_date}</span>}
                        </p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-fence-lt space-y-2" onClick={e => e.stopPropagation()}>
                        {/* Due date */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-c" />
                          <input
                            type="date"
                            value={ct.due_date || ''}
                            onChange={e => setChecklistDueDate(e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-fence bg-cream text-root focus:outline-none focus:ring-2 focus:ring-petal"
                          />
                          {ct.due_date && <button onClick={() => setChecklistDueDate('')} className="text-[10px] text-frost font-bold">Clear</button>}
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2">
                          <button onClick={toggleChecklistItem} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${ct.completed ? 'bg-bloom-lt text-bloom' : 'bg-leaf text-white'}`}>
                            {ct.completed ? 'Reopen' : 'Complete'}
                          </button>
                          <button onClick={deleteChecklistItem} className="py-2 px-3 rounded-lg text-xs font-bold border border-frost-lt text-frost hover:bg-frost-lt transition-colors flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tasks view */}
      <div className={`p-4 flex flex-col gap-6 ${viewMode !== 'tasks' ? 'hidden' : ''}`}>
        {Object.entries(groupedTasks).map(([group, groupTasks]) => {
          if (groupTasks.length === 0) return null;
          
          return (
            <div key={group} className="space-y-3">
              <h2 className="font-bitter font-bold text-xl text-stone-c">{group}</h2>
              {groupTasks.map(task => {
                const isExpanded = expandedTask === task.id;
                const pColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS["medium"];
                const zoneName = task.zone_id ? zones.find(z => z.id === task.zone_id)?.name || `Zone ${task.zone_id}` : null;

                return (
                  <div 
                    key={task.id}
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                    className="bg-linen rounded-xl border border-fence-lt p-4 shadow-sm hover:border-soil transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                          style={{ backgroundColor: pColor }}
                       >
                          {task.priority}
                       </span>
                       {task.source === 'ai' && <Sparkles className="w-4 h-4 text-petal" />}
                       {task.source === 'weather' && <BellRing className="w-4 h-4 text-frost" />}
                    </div>

                    {/* Title — editable on tap */}
                    {editingTitle === task.id ? (
                      <input
                        value={titleInput}
                        onChange={e => setTitleInput(e.target.value)}
                        onBlur={async () => { if (titleInput.trim()) await saveTask(task.id, { title: titleInput.trim() }); setEditingTitle(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        className="font-bold text-root text-lg w-full px-2 py-1 mb-2 rounded border border-petal bg-petal-lt focus:outline-none"
                      />
                    ) : (
                      <h3 className={`font-bold text-lg leading-tight mb-1 ${task.status === 'completed' ? 'line-through text-ash' : 'text-root'}`}>{task.title}</h3>
                    )}

                    {/* Due date display */}
                    {task.due_date && !isExpanded && (
                      <p className="text-[11px] text-stone-c mb-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.due_date.seconds * 1000), 'MMM d, yyyy')}
                        {task.assigned_to && <span className="ml-2">· {task.assigned_to}</span>}
                      </p>
                    )}

                    {isExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-stone-c font-dm-sans mb-3">{task.description}</p>

                        {/* Due date editor */}
                        <div className="mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-c" />
                          {editingDueDate === task.id ? (
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                              <input
                                type="date"
                                value={dueDateInput}
                                onChange={e => setDueDateInput(e.target.value)}
                                className="px-2 py-1 text-xs rounded border border-fence bg-cream text-root focus:outline-none focus:ring-2 focus:ring-petal"
                              />
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (dueDateInput) await saveTask(task.id, { due_date: Timestamp.fromDate(new Date(dueDateInput)) });
                                  setEditingDueDate(null);
                                }}
                                className="text-xs font-bold text-leaf"
                              >Save</button>
                              {task.due_date && (
                                <button
                                  onClick={async (e) => { e.stopPropagation(); setEditingDueDate(null); }}
                                  className="text-xs font-bold text-ash"
                                >Cancel</button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDueDate(task.id);
                                setDueDateInput(task.due_date ? format(new Date(task.due_date.seconds * 1000), 'yyyy-MM-dd') : '');
                              }}
                              className="text-xs font-bold text-creek hover:text-creek-dk transition-colors"
                            >
                              {task.due_date ? format(new Date(task.due_date.seconds * 1000), 'MMM d, yyyy') : 'Set due date'}
                            </button>
                          )}
                        </div>

                        {/* Assigned to + metadata */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {zoneName && <span className="bg-white border border-fence-lt text-xs text-stone-c px-2 py-1 rounded-md flex items-center gap-1 font-bold"><MapPin className="w-3 h-3"/> {zoneName}</span>}
                          {task.equipment_id && <span className="bg-white border border-fence-lt text-xs text-stone-c px-2 py-1 rounded-md flex items-center gap-1 font-bold"><Wrench className="w-3 h-3"/> Linked Equipment</span>}
                          {task.assigned_to && <span className="bg-white border border-fence-lt text-xs text-stone-c px-2 py-1 rounded-md font-bold">{task.assigned_to}</span>}
                          {task.source && <span className="bg-white border border-fence-lt text-xs text-stone-c px-2 py-1 rounded-md font-bold capitalize">{task.source}</span>}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 font-dm-sans mb-2">
                          {task.status === 'completed' ? (
                            <button onClick={(e) => { e.stopPropagation(); saveTask(task.id, { status: 'pending', completed_at: null } as any); }} className="flex-1 bg-bloom text-white py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 shadow-sm">
                              Reopen
                            </button>
                          ) : (
                            <button onClick={(e) => handleComplete(e, task.id)} className="flex-1 bg-leaf text-white py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 shadow-sm">
                              <Check className="w-4 h-4"/> Complete
                            </button>
                          )}
                          <button onClick={(e) => handleSnooze(e, task)} className="flex-1 bg-white border border-fence-lt text-stone-c py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2">
                            <Clock className="w-4 h-4"/> +1 Day
                          </button>
                          <button onClick={(e) => handleDismiss(e, task.id)} className="px-3 bg-white border border-frost-lt text-frost py-2 rounded-lg font-bold text-sm flex justify-center items-center">
                            <X className="w-4 h-4"/>
                          </button>
                        </div>

                        {/* Edit title + Delete */}
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingTitle(task.id); setTitleInput(task.title); }}
                            className="flex-1 py-2 rounded-lg font-bold text-xs border border-fence text-stone-c hover:bg-clay transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Pencil className="w-3 h-3" /> Edit Title
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete "${task.title}"?`)) {
                                await deleteTask(task.id);
                                setExpandedTask(null);
                              }
                            }}
                            className="py-2 px-4 rounded-lg font-bold text-xs border border-frost-lt text-frost hover:bg-frost-lt transition-colors flex items-center justify-center gap-1"
                          >
                            <X className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {!isExpanded && (
                      <div className="flex gap-2 text-xs text-stone-c font-bold font-dm-sans items-center mt-2">
                        <span>{task.assigned_to}</span>
                        {task.estimated_hours && <span>• {task.estimated_hours}h</span>}
                        {zoneName && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {zoneName}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-stone-c">
            <Check className="w-12 h-12 mx-auto text-fence mb-3" />
            <p className="font-bold text-lg text-root">You're all caught up!</p>
            <p className="text-sm">Enjoy the farm or create a manual task.</p>
          </div>
        )}
      </div>

      <button 
        className="fixed bottom-24 right-6 w-14 h-14 bg-petal text-white rounded-full shadow-[0_4px_14px_rgba(193,127,78,0.5)] flex justify-center items-center hover:bg-petal-dk hover:scale-105 active:scale-95 transition-all z-40"
        onClick={() => setIsCreating(true)}
      >
        <Plus className="w-6 h-6" />
      </button>

      {isCreating && (
        <TaskCreationModal 
          onClose={() => setIsCreating(false)} 
          onSubmit={createTask}
          zones={zones}
        />
      )}
    </div>
  );
}
