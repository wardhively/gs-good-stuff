import { useState, useEffect } from "react";
import { onSnapshot, setDoc, doc } from "firebase/firestore";
import { collections, getSettingsDoc } from "@/lib/firestore";
import type { Settings } from "@/lib/types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      getSettingsDoc(),
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as Settings);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to map Settings Singleton arrays bounds:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const saveSettings = async (updates: Partial<Settings>) => {
    await setDoc(getSettingsDoc(), updates, { merge: true });
  };

  return { settings, loading, error, saveSettings };
}
