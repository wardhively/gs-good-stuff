"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useZones } from "@/hooks/useZones";
import { Plus, Check, MapPin, Wrench, Clock, BellRing, Sparkles, X } from "lucide-react";
import { PRIORITY_COLORS } from "@/lib/constants";
import TaskCreationModal from "@/components/admin/TaskCreationModal";
import type { Task } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import { isToday, isTomorrow, isThisWeek, addDays } from "date-fns";

export default function TasksPage() {
  const { tasks, loading, saveTask, createTask } = useTasks();
  const { zones } = useZones();
  
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Grouping logic
  const filtered = tasks.filter(t => t.status === "pending").filter(t => {
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
      </div>

      <div className="p-4 flex flex-col gap-6">
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

                    <h3 className="font-bold text-root text-lg leading-tight mb-2">{task.title}</h3>
                    
                    {isExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-stone-c font-dm-sans mb-3">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {zoneName && <span className="bg-white border border-fence-lt text-xs text-stone-c px-2 py-1 rounded-md flex items-center gap-1 font-bold"><MapPin className="w-3 h-3"/> {zoneName}</span>}
                          {task.equipment_id && <span className="bg-white border border-fence-lt text-xs text-stone-c px-2 py-1 rounded-md flex items-center gap-1 font-bold"><Wrench className="w-3 h-3"/> Linked Equipment</span>}
                        </div>

                        <div className="flex gap-2 font-dm-sans">
                          <button onClick={(e) => handleComplete(e, task.id)} className="flex-1 bg-soil text-white py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 shadow-sm">
                            <Check className="w-4 h-4"/> Complete
                          </button>
                          <button onClick={(e) => handleSnooze(e, task)} className="flex-1 bg-white border border-fence-lt text-stone-c py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2">
                            <Clock className="w-4 h-4"/> Snooze
                          </button>
                          <button onClick={(e) => handleDismiss(e, task.id)} className="px-3 bg-white border border-fence-lt text-stone-c py-2 rounded-lg font-bold text-sm flex justify-center items-center">
                            <X className="w-4 h-4"/>
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
