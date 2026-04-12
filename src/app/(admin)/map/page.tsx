"use client";

import dynamic from 'next/dynamic';
import WeatherBar from '@/components/map/WeatherBar';

// Disable SSR for the map component
const FarmMap = dynamic(() => import('@/components/map/FarmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-120px)] bg-clay flex items-center justify-center">
      <div className="flex flex-col items-center opacity-50">
        <div className="w-10 h-10 border-4 border-root border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-dm-sans font-bold text-root tracking-wide">INITIALIZING FARM MAP...</span>
      </div>
    </div>
  )
});

export default function MapPage() {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <WeatherBar />
      <FarmMap />
    </div>
  );
}
