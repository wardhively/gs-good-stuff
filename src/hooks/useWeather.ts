import { useState, useEffect } from 'react';
import { fetchWeather, WeatherData } from '../lib/weather';

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      try {
        const result = await fetchWeather();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Weather fetch fail'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    // Refresh every 15 minutes
    const interval = setInterval(load, 15 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}
