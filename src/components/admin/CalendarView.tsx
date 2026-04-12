"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Copy, MapPin, Flower2, Check } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay,
  eachDayOfInterval, eachWeekOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, addDays, subDays, addQuarters, subQuarters,
  startOfQuarter, endOfQuarter, isToday, getDay, parseISO,
} from "date-fns";
import { useTasks } from "@/hooks/useTasks";
import { useInventory } from "@/hooks/useInventory";
import { useZones } from "@/hooks/useZones";
import { PRIORITY_COLORS, STATUS_COLORS } from "@/lib/constants";
import type { ChecklistItem } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

type ViewMode = 'day' | 'week' | 'month' | 'quarter';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'task' | 'checklist' | 'dig_date' | 'frost';
  color: string;
  parentName?: string;
  // For editing
  checklistItemId?: string;
  parentType?: 'zone' | 'variety';
  parentDocId?: string;
  taskDocId?: string;
  completed?: boolean;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const { tasks, saveTask } = useTasks();
  const { varieties, saveVariety } = useInventory();
  const { zones, saveZone } = useZones();

  // Gather all calendar events
  const events = useMemo(() => {
    const evts: CalendarEvent[] = [];

    // Tasks with due dates
    tasks.forEach(t => {
      if (t.due_date) {
        const d = new Date(t.due_date.seconds * 1000);
        evts.push({
          id: `task-${t.id}`,
          title: t.title,
          date: format(d, 'yyyy-MM-dd'),
          type: 'task',
          color: PRIORITY_COLORS[t.priority] || '#8B7D6B',
          taskDocId: t.id,
          completed: t.status === 'completed',
        });
      }
    });

    // Variety expected dig dates
    varieties.forEach(v => {
      if (v.expected_dig_date) {
        const d = new Date((v.expected_dig_date as any).seconds * 1000);
        evts.push({
          id: `dig-${v.id}`,
          title: `Dig: ${v.name}`,
          date: format(d, 'yyyy-MM-dd'),
          type: 'dig_date',
          color: '#8B7D6B',
          parentName: v.name,
        });
      }
    });

    // Checklist items with due dates from zones
    zones.forEach(z => {
      (z.checklist || []).filter(c => c.due_date).forEach(c => {
        evts.push({
          id: `cl-${c.id}`,
          title: c.label,
          date: c.due_date!,
          type: 'checklist',
          color: '#3E7A8C',
          parentName: z.name,
          checklistItemId: c.id,
          parentType: 'zone',
          parentDocId: z.id,
          completed: c.completed,
        });
      });
    });

    // Checklist items with due dates from varieties
    varieties.forEach(v => {
      (v.checklist || []).filter(c => c.due_date).forEach(c => {
        evts.push({
          id: `cl-${c.id}`,
          title: c.label,
          date: c.due_date!,
          type: 'checklist',
          color: '#C17F4E',
          parentName: v.name,
          checklistItemId: c.id,
          parentType: 'variety',
          parentDocId: v.id,
          completed: c.completed,
        });
      });
    });

    // Key farm dates
    const year = currentDate.getFullYear();
    evts.push({ id: 'last-frost', title: 'Last Frost Date', date: `${year}-05-15`, type: 'frost', color: '#5B7C4F' });
    evts.push({ id: 'first-frost', title: 'First Frost Date', date: `${year}-10-01`, type: 'frost', color: '#B94A42' });

    return evts;
  }, [tasks, varieties, zones, currentDate]);

  const getEventsForDate = (date: Date) => events.filter(e => e.date === format(date, 'yyyy-MM-dd'));

  // Edit handlers
  const toggleChecklistItem = async (evt: CalendarEvent) => {
    if (!evt.checklistItemId || !evt.parentDocId || !evt.parentType) return;
    const collection = evt.parentType === 'zone' ? zones : varieties;
    const parent = collection.find((p: any) => p.id === evt.parentDocId);
    if (!parent) return;
    const checklist = ((parent as any).checklist || []) as ChecklistItem[];
    const updated = checklist.map(c =>
      c.id === evt.checklistItemId
        ? { ...c, completed: !c.completed, completed_at: !c.completed ? Timestamp.now() : undefined }
        : c
    );
    if (evt.parentType === 'zone') await saveZone(evt.parentDocId, { checklist: updated } as any);
    else await saveVariety(evt.parentDocId, { checklist: updated } as any);
  };

  const rescheduleChecklistItem = async (evt: CalendarEvent, newDate: string) => {
    if (!evt.checklistItemId || !evt.parentDocId || !evt.parentType) return;
    const collection = evt.parentType === 'zone' ? zones : varieties;
    const parent = collection.find((p: any) => p.id === evt.parentDocId);
    if (!parent) return;
    const checklist = ((parent as any).checklist || []) as ChecklistItem[];
    const updated = checklist.map(c =>
      c.id === evt.checklistItemId ? { ...c, due_date: newDate || undefined } : c
    );
    if (evt.parentType === 'zone') await saveZone(evt.parentDocId, { checklist: updated } as any);
    else await saveVariety(evt.parentDocId, { checklist: updated } as any);
  };

  const toggleTask = async (evt: CalendarEvent) => {
    if (!evt.taskDocId) return;
    const newStatus = evt.completed ? 'pending' : 'completed';
    await saveTask(evt.taskDocId, { status: newStatus });
  };

  const rescheduleTask = async (evt: CalendarEvent, newDate: string) => {
    if (!evt.taskDocId) return;
    await saveTask(evt.taskDocId, { due_date: Timestamp.fromDate(new Date(newDate)) });
  };

  const editHandlers = { toggleChecklistItem, rescheduleChecklistItem, toggleTask, rescheduleTask };

  const handleCopyProxy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/api/calendar`);
      alert("Calendar URL copied! Add it as a subscribed calendar on your iPhone.");
    } catch { /* ignore */ }
  };

  // Navigation
  const navigate = (dir: 1 | -1) => {
    if (viewMode === 'day') setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1));
    else if (viewMode === 'week') setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else if (viewMode === 'month') setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
    else setCurrentDate(d => dir === 1 ? addQuarters(d, 1) : subQuarters(d, 1));
  };

  const headerLabel = () => {
    if (viewMode === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy');
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    }
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy');
    const qs = startOfQuarter(currentDate);
    const qe = endOfQuarter(currentDate);
    return `Q${Math.ceil((currentDate.getMonth() + 1) / 3)} · ${format(qs, 'MMM')} – ${format(qe, 'MMM yyyy')}`;
  };

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-clay"><ChevronLeft className="w-5 h-5 text-root" /></button>
        <div className="text-center">
          <h2 className="font-bitter text-lg font-bold text-root">{headerLabel()}</h2>
          <button onClick={() => setCurrentDate(new Date())} className="text-[10px] uppercase text-creek font-bold tracking-wider hover:underline">Today</button>
        </div>
        <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-clay"><ChevronRight className="w-5 h-5 text-root" /></button>
      </div>

      {/* View mode tabs */}
      <div className="flex gap-1 mb-4 bg-clay rounded-lg p-1">
        {(['day', 'week', 'month', 'quarter'] as ViewMode[]).map(v => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${
              viewMode === v ? 'bg-soil text-white shadow-sm' : 'text-stone-c hover:text-root'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* DAY VIEW */}
      {viewMode === 'day' && <DayView date={currentDate} events={getEventsForDate(currentDate)} handlers={editHandlers} />}

      {/* WEEK VIEW */}
      {viewMode === 'week' && <WeekView currentDate={currentDate} getEventsForDate={getEventsForDate} onSelectDate={d => { setCurrentDate(d); setViewMode('day'); }} />}

      {/* MONTH VIEW */}
      {viewMode === 'month' && <MonthView currentDate={currentDate} getEventsForDate={getEventsForDate} onSelectDate={d => { setCurrentDate(d); setViewMode('day'); }} />}

      {/* QUARTER VIEW */}
      {viewMode === 'quarter' && <QuarterView currentDate={currentDate} getEventsForDate={getEventsForDate} onSelectDate={d => { setCurrentDate(d); setViewMode('month'); }} />}

      {/* CalDAV subscribe card */}
      <div className="mt-6 bg-creek-lt rounded-xl p-4 border border-creek/20">
        <div className="flex items-center gap-2 mb-2">
          <CalIcon className="w-5 h-5 text-creek" />
          <h3 className="font-bold text-root text-sm">Subscribe on iPhone</h3>
        </div>
        <p className="text-xs text-stone-c mb-3">Settings → Accounts → Add Subscribed Calendar → paste the URL below</p>
        <button onClick={handleCopyProxy} className="flex items-center gap-2 px-3 py-2 bg-creek text-white rounded-lg text-sm font-bold hover:bg-creek/80 transition-colors">
          <Copy className="w-4 h-4" /> Copy Calendar URL
        </button>
      </div>
    </div>
  );
}

// ─── DAY VIEW ────────────────────────────────────────────────────────
interface EditHandlers {
  toggleChecklistItem: (evt: CalendarEvent) => Promise<void>;
  rescheduleChecklistItem: (evt: CalendarEvent, newDate: string) => Promise<void>;
  toggleTask: (evt: CalendarEvent) => Promise<void>;
  rescheduleTask: (evt: CalendarEvent, newDate: string) => Promise<void>;
}

function DayView({ date, events, handlers }: { date: Date; events: CalendarEvent[]; handlers: EditHandlers }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");

  const handleToggle = async (evt: CalendarEvent) => {
    if (evt.type === 'checklist') await handlers.toggleChecklistItem(evt);
    else if (evt.type === 'task') await handlers.toggleTask(evt);
  };

  const handleReschedule = async (evt: CalendarEvent) => {
    if (!newDate) return;
    if (evt.type === 'checklist') await handlers.rescheduleChecklistItem(evt, newDate);
    else if (evt.type === 'task') await handlers.rescheduleTask(evt, newDate);
    setRescheduling(null);
    setNewDate("");
  };

  return (
    <div>
      {events.length === 0 ? (
        <div className="text-center py-12 text-stone-c">
          <CalIcon className="w-10 h-10 mx-auto mb-2 text-ash" />
          <p className="font-bold text-root">No events</p>
          <p className="text-sm">Nothing scheduled for {format(date, 'MMMM d')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map(evt => {
            const isEditable = evt.type === 'checklist' || evt.type === 'task';
            const isExpanded = expandedId === evt.id;

            return (
              <div key={evt.id} className={`bg-linen rounded-xl border p-3 transition-colors ${evt.completed ? 'border-leaf/30 opacity-60' : 'border-fence-lt'}`}>
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => isEditable && setExpandedId(isExpanded ? null : evt.id)}
                >
                  {/* Complete checkbox for editable items */}
                  {isEditable ? (
                    <button
                      onClick={e => { e.stopPropagation(); handleToggle(evt); }}
                      className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors mt-0.5 ${
                        evt.completed ? "bg-leaf border-leaf text-white" : "border-fence bg-linen hover:border-stone-c"
                      }`}
                    >
                      {evt.completed && <Check className="w-3 h-3" />}
                    </button>
                  ) : (
                    <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: evt.color }} />
                  )}

                  <div className="flex-1">
                    <p className={`text-sm font-bold ${evt.completed ? 'line-through text-ash' : 'text-root'}`}>{evt.title}</p>
                    {evt.parentName && <p className="text-[11px] text-stone-c">{evt.parentName}</p>}
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                      evt.type === 'task' ? 'bg-petal-lt text-petal' :
                      evt.type === 'checklist' ? 'bg-creek-lt text-creek' :
                      evt.type === 'dig_date' ? 'bg-clay text-stone-c' :
                      'bg-frost-lt text-frost'
                    }`}>
                      {evt.type === 'dig_date' ? 'Harvest' : evt.type}
                    </span>
                  </div>

                  {isEditable && (
                    <ChevronRight className={`w-4 h-4 text-ash transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </div>

                {/* Expanded edit actions */}
                {isExpanded && isEditable && (
                  <div className="mt-3 pt-3 border-t border-fence-lt flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(evt)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                          evt.completed
                            ? 'bg-bloom-lt text-bloom border border-bloom/20'
                            : 'bg-leaf text-white'
                        }`}
                      >
                        {evt.completed ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                      <button
                        onClick={() => { setRescheduling(rescheduling === evt.id ? null : evt.id); setNewDate(evt.date); }}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-creek-lt text-creek border border-creek/20 transition-colors"
                      >
                        Reschedule
                      </button>
                    </div>
                    {rescheduling === evt.id && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-fence bg-cream text-root focus:outline-none focus:ring-2 focus:ring-petal"
                        />
                        <button
                          onClick={() => handleReschedule(evt)}
                          disabled={!newDate}
                          className="px-3 py-1.5 bg-soil text-white text-xs font-bold rounded-lg disabled:opacity-30"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── WEEK VIEW ───────────────────────────────────────────────────────
function WeekView({ currentDate, getEventsForDate, onSelectDate }: { currentDate: Date; getEventsForDate: (d: Date) => CalendarEvent[]; onSelectDate: (d: Date) => void }) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate, { weekStartsOn: 0 }) });

  return (
    <div className="flex flex-col gap-2">
      {days.map(day => {
        const dayEvents = getEventsForDate(day);
        const today = isToday(day);
        return (
          <div
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={`rounded-xl border p-3 cursor-pointer transition-colors ${
              today ? 'border-soil bg-petal-lt/30' : 'border-fence-lt bg-linen hover:bg-cream'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-bold ${today ? 'text-soil' : 'text-root'}`}>
                {format(day, 'EEE, MMM d')}
              </span>
              {dayEvents.length > 0 && (
                <span className="text-[10px] font-bold text-stone-c">{dayEvents.length} item{dayEvents.length > 1 ? 's' : ''}</span>
              )}
            </div>
            {dayEvents.length > 0 && (
              <div className="flex flex-col gap-1">
                {dayEvents.slice(0, 3).map(evt => (
                  <div key={evt.id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: evt.color }} />
                    <span className="text-root truncate">{evt.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && <span className="text-[10px] text-ash ml-4">+{dayEvents.length - 3} more</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MONTH VIEW ──────────────────────────────────────────────────────
function MonthView({ currentDate, getEventsForDate, onSelectDate }: { currentDate: Date; getEventsForDate: (d: Date) => CalendarEvent[]; onSelectDate: (d: Date) => void }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div>
      <div className="grid grid-cols-7 gap-px mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] font-bold text-stone-c text-center uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-fence-lt rounded-lg overflow-hidden">
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`min-h-[60px] p-1 cursor-pointer transition-colors ${
                !inMonth ? 'bg-clay/50' : today ? 'bg-petal-lt/50' : 'bg-linen hover:bg-cream'
              }`}
            >
              <span className={`text-[11px] font-bold block ${
                today ? 'text-soil' : inMonth ? 'text-root' : 'text-ash'
              }`}>
                {format(day, 'd')}
              </span>
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {dayEvents.slice(0, 3).map(evt => (
                  <div key={evt.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: evt.color }} title={evt.title} />
                ))}
              </div>
              {dayEvents.length > 3 && <span className="text-[8px] text-ash">+{dayEvents.length - 3}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── QUARTER VIEW ────────────────────────────────────────────────────
function QuarterView({ currentDate, getEventsForDate, onSelectDate }: { currentDate: Date; getEventsForDate: (d: Date) => CalendarEvent[]; onSelectDate: (d: Date) => void }) {
  const qs = startOfQuarter(currentDate);
  const months = [qs, addMonths(qs, 1), addMonths(qs, 2)];

  return (
    <div className="flex flex-col gap-6">
      {months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start: calStart, end: calEnd });

        // Count events per day for the month
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const totalEvents = monthDays.reduce((sum, d) => sum + getEventsForDate(d).length, 0);

        return (
          <div key={month.toISOString()}>
            <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => onSelectDate(monthStart)}>
              <h3 className="font-bitter font-bold text-root">{format(month, 'MMMM')}</h3>
              {totalEvents > 0 && <span className="text-[10px] font-bold text-creek bg-creek-lt px-2 py-0.5 rounded-full">{totalEvents} events</span>}
            </div>
            <div className="grid grid-cols-7 gap-px bg-fence-lt rounded-lg overflow-hidden">
              {days.map(day => {
                const dayEvents = getEventsForDate(day);
                const inMonth = isSameMonth(day, month);
                const today = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => onSelectDate(day)}
                    className={`h-7 flex items-center justify-center cursor-pointer text-[10px] relative ${
                      !inMonth ? 'bg-clay/30 text-ash' : today ? 'bg-petal-lt font-bold text-soil' : 'bg-linen text-root hover:bg-cream'
                    }`}
                  >
                    {format(day, 'd')}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: dayEvents[0].color }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
