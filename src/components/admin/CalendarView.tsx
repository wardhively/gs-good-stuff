"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Copy, Leaf, AlertTriangle, Snowflake } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { useTasks } from "@/hooks/useTasks";
import { useInventory } from "@/hooks/useInventory";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { tasks } = useTasks();
  const { varieties } = useInventory();

  const handleCopyProxy = async () => {
     try {
        const url = `${window.location.origin}/api/calendar`;
        await navigator.clipboard.writeText(url);
        alert("Subscription URL Copied successfully. Add this to your iPhone Settings -> Calendar -> Subscribed Calendars.");
     } catch (e) {
        alert("Failed to copy URL automatically.");
     }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine grid bounds natively
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Map Tasks natively by day
  const dailyTasks = (d: Date) => tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date.seconds * 1000), d));
  const dailyDigs = (d: Date) => varieties.filter(v => v.expected_dig_date && isSameDay(new Date(v.expected_dig_date.seconds * 1000), d));

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bitter text-3xl font-bold text-root">Calendar</h1>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">

         {/* CalDAV Sync Card */}
         <div className="bg-gradient-to-r from-clay to-linen border border-fence-lt p-6 rounded-2xl shadow-sm text-root">
            <div className="flex items-center gap-3 mb-2">
               <CalIcon className="w-6 h-6 text-creek" />
               <h3 className="font-bold text-xl">Cloud Sync (CalDAV)</h3>
            </div>
            <p className="text-sm text-stone-c font-dm-sans mb-4">
              Subscribe to G&S Tasks directly on your iPhone or Apple device natively securely pulling background updates seamlessly bounding exactly mapping limits.
            </p>
            <button onClick={handleCopyProxy} className="flex items-center gap-2 bg-white border border-fence-lt shadow-sm px-4 py-2 rounded-lg font-bold text-sm hover:border-soil transition-colors">
               <Copy className="w-4 h-4"/> Copy Subscription URL
            </button>
         </div>

         {/* Calendar UI Component Engine */}
         <div className="bg-white rounded-2xl shadow-sm border border-fence-lt overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-fence bg-linen flex justify-between items-center">
               <button onClick={prevMonth} className="p-2 text-stone-c hover:text-root hover:bg-clay rounded-lg transition-colors"><ChevronLeft className="w-5 h-5"/></button>
               <h2 className="font-bitter font-bold text-root text-xl">{format(currentDate, 'MMMM yyyy')}</h2>
               <button onClick={nextMonth} className="p-2 text-stone-c hover:text-root hover:bg-clay rounded-lg transition-colors"><ChevronRight className="w-5 h-5"/></button>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 border-b border-fence-lt bg-clay/30 text-stone-c text-[10px] uppercase font-bold tracking-widest text-center py-2">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 border-b border-fence-lt text-sm font-dm-sans">
               {days.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, selectedDate);
                  const dTasks = dailyTasks(day);
                  const dDigs = dailyDigs(day);

                  // Evaluate if it's a fixed environmental marker (Addison bounds)
                  const mn = day.getMonth(); // 0 is jan
                  const dt = day.getDate();
                  const isLastFrost = (mn === 4 && dt === 15); // May 15
                  const isFirstFrost = (mn === 9 && dt === 1); // Oct 1

                  let priorityColor = "bg-fence";
                  if (dTasks.some(t => t.priority === 'urgent')) priorityColor = "bg-frost";
                  else if (dTasks.some(t => t.priority === 'high')) priorityColor = "bg-petal";
                  else if (dTasks.length > 0) priorityColor = "bg-creek";

                  return (
                     <div 
                        key={idx} 
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-[80px] p-1 border-r border-b border-fence-lt last:border-r-0 cursor-pointer overflow-hidden relative ${!isCurrentMonth ? 'bg-cream/50 text-stone-c/50' : 'bg-white hover:bg-linen'} ${isSelected ? 'ring-2 ring-inset ring-soil' : ''}`}
                     >
                        <span className={`inline-block w-6 h-6 text-center leading-6 rounded-full font-bold ${isSelected ? 'bg-soil text-white' : ''}`}>
                           {format(day, 'd')}
                        </span>

                        <div className="flex flex-col gap-1 mt-1">
                           {dTasks.length > 0 && <div className={`w-2 h-2 rounded-full absolute top-2 right-2 ${priorityColor}`} />}
                           
                           {isLastFrost && <div className="text-[9px] bg-leaf-lt text-leaf px-1 rounded flex items-center gap-1 font-bold"><Leaf className="w-2 h-2"/> Last Frost</div>}
                           {isFirstFrost && <div className="text-[9px] bg-frost-lt text-frost px-1 rounded flex items-center gap-1 font-bold"><Snowflake className="w-2 h-2"/> First Frost</div>}
                           
                           {dDigs.length > 0 && <div className="text-[9px] bg-petal-lt text-root px-1 rounded font-bold truncate">Dig: {dDigs.length}</div>}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Selected Date Output Engine */}
         <div className="bg-linen p-4 rounded-xl border border-fence-lt">
            <h3 className="font-bold text-root mb-4 uppercase tracking-widest text-xs border-b border-fence pb-2">
               Events for {format(selectedDate, 'MMM d, yyyy')}
            </h3>
            
            {dailyTasks(selectedDate).length === 0 && dailyDigs(selectedDate).length === 0 ? (
               <p className="text-sm text-stone-c italic">No tasks explicitly scheduled for this day natively.</p>
            ) : (
               <div className="space-y-3">
                  {dailyTasks(selectedDate).map(t => (
                     <div key={t.id} className="flex flex-col bg-white p-3 rounded-lg border border-fence shadow-sm">
                        <span className="text-[10px] font-bold uppercase text-stone-c">{t.source} Task</span>
                        <span className="font-bold text-root text-sm">{t.title}</span>
                     </div>
                  ))}
                  {dailyDigs(selectedDate).map(v => (
                     <div key={v.id} className="flex items-center gap-2 bg-leaf-lt border border-leaf-dk text-leaf-dk p-3 rounded-lg shadow-sm">
                        <AlertTriangle className="w-4 h-4"/>
                        <span className="font-bold text-sm">Harvest Expected: {v.name} Tubers</span>
                     </div>
                  ))}
               </div>
            )}
         </div>

      </div>
    </div>
  );
}
