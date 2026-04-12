import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { Zone } from "@/lib/types";

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // onSnapshot acts as our real-time channel + offline cache trigger
    const unsubscribe = onSnapshot(
      collections.zones,
      (snapshot) => {
        const results: Zone[] = snapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id } as Zone;
        });
        setZones(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore zones error", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { zones, loading, error };
}
