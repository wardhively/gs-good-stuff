"use client";

import { ChevronLeft, TrendingUp, DollarSign, Package } from "lucide-react";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ReferenceLine } from "recharts";

export default function RevenueView() {
  const { orders, loading: ordersLoading } = useOrders();
  const { varieties, loading: invLoading } = useInventory();
  const { plans, loading: plansLoading } = useBusinessPlan();

  if (ordersLoading || invLoading || plansLoading) {
    return <div className="p-8 text-center text-stone-c font-bold animate-pulse">Calculating revenue maps...</div>;
  }

  const currentYear = new Date().getFullYear();
  const activePlan = plans.find(p => p.year === currentYear);
  const annualTarget = activePlan?.targets.revenue || 120000;
  const monthlyTarget = annualTarget / 12;

  // 1. Data Processing
  // Only count orders that are not refunded for actual revenue
  const validOrders = orders.filter(o => o.status !== 'refunded');

  const totalRevenue = validOrders.reduce((sum, o) => sum + o.subtotal, 0); // using subtotal to avoid shipping inflating tuber ROI
  const totalOrders = validOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalTubersSold = validOrders.reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0);

  // 2. Monthly Revenue Mapping
  const monthlyBuckets = Array.from({length: 12}, (_, i) => ({
    month: new Date(2026, i, 1).toLocaleString('default', { month: 'short' }),
    Revenue: 0,
    monthIdx: i
  }));

  validOrders.forEach(o => {
    if (o.created_at) {
      const d = new Date(o.created_at.seconds * 1000);
      if (d.getFullYear() === currentYear) {
         monthlyBuckets[d.getMonth()].Revenue += o.subtotal;
      }
    }
  });

  // 3. Cumulative Revenue
  let runningTotal = 0;
  const cumulativeData = monthlyBuckets.map(b => {
     runningTotal += b.Revenue;
     return { month: b.month, Cumulative: runningTotal, Target: (b.monthIdx + 1) * monthlyTarget };
  });

  // 4. Variety ROI Engine
  const varietyImpact: Record<string, { qty: number, rev: number, name: string }> = {};
  validOrders.forEach(o => o.items.forEach(i => {
     if (!varietyImpact[i.variety_id]) varietyImpact[i.variety_id] = { qty: 0, rev: 0, name: i.name };
     varietyImpact[i.variety_id].qty += i.quantity;
     varietyImpact[i.variety_id].rev += (i.quantity * i.unit_price);
  }));

  const rankArr = Object.values(varietyImpact).sort((a, b) => b.rev - a.rev);
  const top10 = rankArr.slice(0, 10);

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bitter text-3xl font-bold text-root">Revenue Intel</h1>
        </div>
        <p className="font-dm-sans text-xs font-bold text-stone-c uppercase tracking-widest">{currentYear} FY Target: ${annualTarget.toLocaleString()}</p>
      </div>

      <div className="p-4 flex flex-col gap-6">

        {/* HUD CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-leaf text-white border border-leaf-dk p-4 rounded-xl shadow-sm">
             <div className="flex justify-between items-start mb-2 opacity-80"><DollarSign className="w-5 h-5" /></div>
             <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">Total Gross</p>
             <p className="font-bold text-xl">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-linen border border-fence-lt p-4 rounded-xl shadow-sm text-root">
             <div className="flex justify-between items-start mb-2"><TrendingUp className="w-5 h-5 text-leaf" /></div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-stone-c">AOV</p>
             <p className="font-bold text-xl">${averageOrderValue.toFixed(2)}</p>
          </div>
          <div className="bg-linen border border-fence-lt p-4 rounded-xl shadow-sm text-root">
             <div className="flex justify-between items-start mb-2"><Package className="w-5 h-5 text-petal" /></div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-stone-c">Orders</p>
             <p className="font-bold text-xl">{totalOrders.toLocaleString()}</p>
          </div>
          <div className="bg-linen border border-fence-lt p-4 rounded-xl shadow-sm text-root">
             <div className="flex justify-between items-start mb-2"><TrendingUp className="w-5 h-5 text-bloom" /></div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-stone-c">Tubers Moved</p>
             <p className="font-bold text-xl">{totalTubersSold.toLocaleString()}</p>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white border border-fence-lt rounded-xl p-4 shadow-sm">
           <h3 className="font-bold text-root mb-4">Monthly Trajectory</h3>
           <div className="h-[200px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={monthlyBuckets.filter((_, i) => i <= new Date().getMonth() + 1)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE8E3" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} tickFormatter={(val) => `$${val/1000}k`} />
                 <Tooltip cursor={{ fill: '#F5F5E9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => `$${val}`} />
                 <ReferenceLine y={monthlyTarget} stroke="#5B7C4F" strokeDasharray="3 3" opacity={0.5} />
                 <Bar dataKey="Revenue" fill="#8B7D6B" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Cumulative Line Chart */}
        <div className="bg-white border border-fence-lt rounded-xl p-4 shadow-sm">
           <h3 className="font-bold text-root mb-4">Cumulative vs Plan</h3>
           <div className="h-[200px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={cumulativeData.filter((_, i) => i <= new Date().getMonth() + 1)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE8E3" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} tickFormatter={(val) => `$${val/1000}k`} />
                 <Tooltip cursor={{ fill: '#F5F5E9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => `$${val}`} />
                 <Line type="monotone" dataKey="Target" stroke="#5B7C4F" strokeDasharray="5 5" strokeWidth={2} dot={false} opacity={0.5} />
                 <Line type="monotone" dataKey="Cumulative" stroke="#3E7A8C" strokeWidth={3} dot={{ r: 3, fill: '#3E7A8C' }} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Variety ROI Ranking */}
        <div className="bg-white border border-fence-lt rounded-xl shadow-sm overflow-hidden mb-6">
           <div className="p-4 border-b border-fence-lt bg-linen">
              <h3 className="font-bold text-root">Top Performing Inventory</h3>
              <p className="text-[10px] uppercase font-bold text-stone-c tracking-widest mt-1">Ranked by Total Yield</p>
           </div>
           
           <table className="w-full text-left text-sm font-dm-sans">
              <thead className="text-stone-c text-[10px] uppercase tracking-widest bg-clay/20 border-b border-fence">
                 <tr>
                    <th className="px-4 py-2">Variety</th>
                    <th className="px-4 py-2 text-right">Sold</th>
                    <th className="px-4 py-2 text-right">Yield</th>
                 </tr>
              </thead>
              <tbody>
                 {top10.map((v, idx) => (
                    <tr key={idx} className="border-b border-fence last:border-0 hover:bg-linen/50 transition-colors">
                       <td className="px-4 py-3 font-bold text-root max-w-[120px] truncate" title={v.name}>{v.name}</td>
                       <td className="px-4 py-3 text-right">{v.qty}</td>
                       <td className="px-4 py-3 text-right text-leaf font-bold">${v.rev.toFixed(2)}</td>
                    </tr>
                 ))}
                 {top10.length === 0 && (
                    <tr>
                       <td colSpan={3} className="px-4 py-8 text-center text-stone-c">Awaiting initial sales velocity curves.</td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

      </div>
    </div>
  );
}
