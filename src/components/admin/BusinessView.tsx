"use client";

import { useState } from "react";
import { ChevronLeft, Target, TrendingUp, CheckSquare, Banknote, DollarSign } from "lucide-react";
import Link from "next/link";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
import { FIVE_YEAR_PLAN } from "@/lib/constants";
import { Timestamp } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function BusinessView() {
  const { plans, loading, savePlan } = useBusinessPlan();
  
  if (loading) return <div className="p-8 text-center text-stone-c font-bold animate-pulse">Loading strategy...</div>;

  const currentYear = new Date().getFullYear();
  const activePlan = plans.find(p => p.year === currentYear) || plans[0]; // fallback defensively
  
  if (!activePlan) {
    return <div className="p-8 text-center text-stone-c">No active business plan detected for {currentYear}.</div>;
  }

  const handleMilestoneToggle = async (idx: number) => {
    const fresh = [...activePlan.milestones];
    fresh[idx].completed = !fresh[idx].completed;
    fresh[idx].completed_at = fresh[idx].completed ? Timestamp.now() : undefined;
    await savePlan(activePlan.id, { milestones: fresh });
  };

  const getProgressColor = (actual: number, target: number) => {
    // Basic progression logic - highly simplified
    // Standard rule: < 25% = frost. 25-80% = bloom, > 80% = leaf.
    if (target === 0) return 'bg-stone-c';
    const percent = (actual / target) * 100;
    if (percent < 25) return 'bg-frost';
    if (percent < 80) return 'bg-bloom';
    return 'bg-leaf';
  };

  const budgetData = activePlan.budget.map(b => ({
    name: b.category,
    Budgeted: b.budgeted,
    Actual: b.actual
  }));

  const fiveYearData = Object.entries(FIVE_YEAR_PLAN).map(([year, targets]) => {
     // If history naturally caught up, map actuals, otherwise plan limits
     const isHistorical = parseInt(year) <= currentYear && parseInt(year) === activePlan.year;
     return {
        year,
        Production: isHistorical ? activePlan.actuals.production : targets.production,
        Target: targets.production
     };
  });

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bitter text-3xl font-bold text-root">Strategy Hub</h1>
        </div>
        <p className="font-dm-sans text-xs font-bold text-stone-c tracking-widest uppercase">
          {activePlan.year} — Year {activePlan.year - 2025} of 5 · Target: 82,432 by 2030
        </p>
      </div>

      <div className="p-4 flex flex-col gap-6">
        
        {/* Dash HUD */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-linen border border-fence-lt p-4 rounded-xl shadow-sm">
             <div className="flex justify-between items-start mb-2">
               <DollarSign className="w-5 h-5 text-bloom" />
             </div>
             <p className="text-[10px] text-stone-c font-bold uppercase tracking-widest">Revenue</p>
             <p className="font-bold text-xl text-root">${activePlan.actuals.revenue.toLocaleString()}</p>
             <p className="text-xs text-stone-c font-bold">of ${activePlan.targets.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-linen border border-fence-lt p-4 rounded-xl shadow-sm">
             <div className="flex justify-between items-start mb-2">
               <Target className="w-5 h-5 text-leaf" />
             </div>
             <p className="text-[10px] text-stone-c font-bold uppercase tracking-widest">Planted</p>
             <p className="font-bold text-xl text-root">{activePlan.actuals.planted.toLocaleString()}</p>
             <p className="text-xs text-stone-c font-bold">of {activePlan.targets.planted.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-fence-lt rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-root mb-4">Core Progression</h3>
          {['production', 'sold', 'revenue', 'varieties'].map(metric => {
            const actual = activePlan.actuals[metric as keyof typeof activePlan.actuals];
            const target = activePlan.targets[metric as keyof typeof activePlan.targets];
            const p = Math.min(100, (actual / target) * 100);
            
            return (
              <div key={metric} className="mb-3">
                 <div className="flex justify-between text-xs font-bold text-stone-c mb-1 uppercase tracking-wider">
                   <span>{metric}</span>
                   <span>{actual.toLocaleString()} / {target.toLocaleString()}</span>
                 </div>
                 <div className="h-1.5 w-full bg-clay rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(actual, target)}`} style={{ width: `${p}%` }} />
                 </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-fence-lt rounded-xl p-4 shadow-sm">
           <h3 className="font-bold text-root mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Key Milestones</h3>
           <div className="space-y-3">
              {activePlan.milestones.map((m, i) => (
                <div key={i} className="flex flex-row items-center gap-3 py-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMilestoneToggle(i); }}
                    className={`w-7 h-7 rounded-md border-2 flex justify-center items-center cursor-pointer transition-colors active:scale-90 ${m.completed ? 'bg-leaf border-leaf text-white' : 'border-fence-lt bg-transparent hover:border-stone-c active:border-leaf'}`}
                  >
                     {m.completed && <CheckSquare className="w-4 h-4" />}
                  </button>
                  <span
                    onClick={() => handleMilestoneToggle(i)}
                    className={`text-sm font-bold font-dm-sans cursor-pointer select-none ${m.completed ? 'text-stone-c line-through' : 'text-root'}`}
                  >{m.title}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Budget Trajectory Chart */}
        <div className="bg-white border border-fence-lt rounded-xl p-4 shadow-sm">
           <h3 className="font-bold text-root mb-4">Budget Control</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={budgetData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE8E3" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} tickFormatter={(val) => `$${val}`} />
                 <Tooltip cursor={{ fill: '#F5F5E9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                 <Bar dataKey="Budgeted" fill="#8B7D6B" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="Actual" fill="#E2725B" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* 5-Year Horizon Chart */}
        <div className="bg-white border border-fence-lt rounded-xl p-4 shadow-sm mb-6">
           <h3 className="font-bold text-root mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-leaf"/> 5-Year Horizon</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={fiveYearData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE8E3" />
                 <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B', fontWeight: 'bold' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} />
                 <Tooltip cursor={{ fill: '#F5F5E9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="Target" fill="#5B7C4F" radius={[4, 4, 0, 0]} opacity={0.3} />
                 <Bar dataKey="Production" fill="#5B7C4F" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}
