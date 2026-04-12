import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { WeatherLog } from "@/lib/types";

export function useWeatherLog() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // We order descending by date to track historical logs chronologically visually backwards
    const q = query(collections.weatherLog, orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as WeatherLog));
        setLogs(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore weatherLog error", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { logs, loading, error };
}
