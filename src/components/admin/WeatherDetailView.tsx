"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Cloud, Navigation, AlertTriangle, Droplets } from "lucide-react";
import Link from "next/link";
import { useWeatherLog } from "@/hooks/useWeatherLog";
import { fetchExtendedForecast } from "@/lib/weather";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

export default function WeatherDetailView() {
  const { logs, loading } = useWeatherLog();
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    fetchExtendedForecast().then(res => setForecast(res)).catch(console.error);
  }, []);

  if (loading || !forecast) return <div className="p-8 text-center text-stone-c font-bold animate-pulse">Gathering atmospheric data...</div>;

  // Extract soil_temp gauge bounds safely
  const latestSoil = logs.length > 0 ? logs[0].soil_temp_est : 55;
  const soilColor = latestSoil < 50 ? 'bg-creek text-white' : latestSoil < 60 ? 'bg-bloom text-white' : 'bg-leaf text-white';

  const chartData = [...logs].reverse().slice(-30).map(l => ({
    date: l.date.substring(5), // MM-DD
    High: l.actual_high,
    Low: l.actual_low,
    Precip: l.precip_inches
  }));

  // Helper formatting for 7-Day row
  const dayName = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bitter text-3xl font-bold text-root">Weather Intel</h1>
        </div>
        <p className="font-dm-sans text-xs font-bold text-creek flex items-center gap-1">
           <Navigation className="w-3 h-3" /> Addison, NY (42.10°N, -77.23°W)
        </p>
      </div>

      <div className="p-4 flex flex-col gap-6">
        
        {/* Conditions Head */}
        <div className="flex flex-col items-center bg-gradient-to-b from-[#3E7A8C] to-[#114B5F] text-white p-6 rounded-2xl shadow-xl border border-creek-dk">
           <Cloud className="w-12 h-12 mb-2 opacity-80" />
           <p className="text-sm font-bold uppercase tracking-widest opacity-80">{forecast.current.conditions}</p>
           <h2 className="text-6xl font-bitter font-bold my-2">{forecast.current.temp}°</h2>
           <div className="flex gap-4 text-sm font-bold opacity-90 mt-2">
              <span>H: {forecast.current.hi}°</span>
              <span>L: {forecast.current.lo}°</span>
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3"/> {forecast.current.precip}"</span>
           </div>
        </div>

        {/* 7-DAY FORECAST */}
        <div className="bg-white rounded-xl border border-fence-lt p-4 shadow-sm overflow-x-auto no-scrollbar">
           <div className="flex gap-3">
              {forecast.daily.map((d: any, idx: number) => (
                 <div key={idx} className="flex flex-col items-center min-w-[70px] p-2 bg-linen rounded-lg border border-transparent hover:border-soil transition-colors">
                    <p className="text-xs font-bold text-stone-c uppercase mb-2">{idx === 0 ? 'Today' : dayName(d.date)}</p>
                    <Cloud className="w-5 h-5 text-creek mb-2" />
                    <p className="text-[10px] font-bold text-root leading-tight">{d.hi}°</p>
                    <p className="text-[10px] text-stone-c font-bold">{d.lo}°</p>
                    {d.precip > 0 && <p className="text-[9px] text-creek mt-1">{d.precip}"</p>}
                 </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {/* Soil Temp Monitor */}
           <div className={`p-4 rounded-xl shadow-sm border border-fence-lt ${soilColor}`}>
              <h3 className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Soil Temp Est</h3>
              <p className="text-3xl font-bitter font-bold mb-2">{latestSoil}°</p>
              <p className="text-[10px] font-bold opacity-90 leading-snug">
                 {latestSoil < 60 ? 'Soil must reach 60°F before planting dahlias in field.' : 'Soil safe for tuber planting operations.'}
              </p>
           </div>
           
           {/* Frost Monitor */}
           <div className="bg-linen p-4 rounded-xl shadow-sm border border-fence-lt">
              <h3 className="text-xs uppercase font-bold tracking-widest text-stone-c mb-2">Frost Index</h3>
              <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle className={`w-5 h-5 ${logs.some(l => l.frost_alert) ? 'text-frost' : 'text-stone-c'}`} />
                 <span className="font-bold text-root text-sm">Zone 5b</span>
              </div>
              <p className="text-[10px] text-stone-c font-bold leading-snug">Last frost: May 15<br/>First frost: Oct 1</p>
           </div>
        </div>

        {/* 30 Day Historical Logging Chart */}
        <div className="bg-white border border-fence-lt rounded-xl p-4 shadow-sm mb-6 mt-2">
           <h3 className="font-bold text-root mb-4">Historical Temperature (30D)</h3>
           <div className="h-[200px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE8E3" />
                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} tickMargin={10} minTickGap={20} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B7D6B' }} domain={['dataMin - 5', 'dataMax + 5']} />
                 <Tooltip cursor={{ fill: '#F5F5E9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Line type="monotone" dataKey="High" stroke="#E2725B" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                 <Line type="monotone" dataKey="Low" stroke="#3E7A8C" strokeWidth={3} dot={false} />
               </LineChart>
             </ResponsiveContainer>
           </div>
           
           <h3 className="font-bold text-root mt-6 mb-4">Historical Precipitation (30D)</h3>
           <div className="h-[120px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <XAxis dataKey="date" hide />
                 <YAxis hide />
                 <Tooltip cursor={{ fill: '#F5F5E9' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                 <Bar dataKey="Precip" fill="#3E7A8C" radius={[2, 2, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}
