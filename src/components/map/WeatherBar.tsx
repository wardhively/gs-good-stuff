import { useWeather } from '@/hooks/useWeather';
import { CloudRain, Sun, Cloud, Snowflake, AlertTriangle, Wind } from 'lucide-react';

export default function WeatherBar() {
  const { data, loading, error } = useWeather();

  if (loading) {
    return (
      <div className="bg-creek-lt border-b border-fence text-creek text-xs p-2 flex justify-center shadow-md animate-pulse">
        Fetching current conditions...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-fence-lt border-b border-fence text-stone-c text-xs p-2 flex justify-between shadow-md">
        <span>Offline Mode</span>
        <span className="italic">Weather unavailable</span>
      </div>
    );
  }

  // Choose icon based loosely on conditions
  const Icon = data.conditions.includes('Rain') || data.conditions.includes('Showers') ? CloudRain
    : data.conditions.includes('Snow') ? Snowflake
    : data.conditions.includes('Cloud') ? Cloud
    : data.conditions.includes('Thunderstorm') ? AlertTriangle
    : Sun;

  return (
    <div className="bg-creek-lt/95 backdrop-blur border-b border-creek/20 text-root text-sm px-4 py-2 flex justify-between items-center shadow-sm z-[1000] relative">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-creek" />
        <span className="font-bold">{data.temp}°F</span>
        <span className="text-xs text-stone-c hidden sm:inline ml-1">{data.conditions}</span>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-dm-sans">
        <span title="High">H: {data.hi}°</span>
        <span title="Low">L: {data.lo}°</span>
        {data.precip > 0 && (
          <span title="Precipitation" className="text-creek-dk flex items-center gap-1">
            <CloudRain className="w-3 h-3" /> {data.precip}"
          </span>
        )}
      </div>
    </div>
  );
}
