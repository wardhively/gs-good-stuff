import { useState, useEffect } from "react";
import { onSnapshot, doc, setDoc, Timestamp, orderBy, query } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { JournalEntry } from "@/lib/types";
import { fetchWeather } from "@/lib/weather";
import { cacheFileOffline, syncPendingFiles } from "@/lib/storage-sync";
import { useAuth } from "@/lib/auth";

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Reverse chronological order for journal feed
    const q = query(collections.journalEntries, orderBy("created_at", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as JournalEntry));
        setEntries(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore journal error", err);
        setError(err);
        setLoading(false);
      }
    );

    // Initial sync sweep on mount in case we booted up online
    syncPendingFiles();

    return () => unsubscribe();
  }, []);

  const createJournalEntry = async (
    entryData: Omit<JournalEntry, "id" | "created_at" | "updated_at" | "weather_snapshot" | "author">,
    files: File[]
  ) => {
    const newRef = doc(collections.journalEntries);
    const entryId = newRef.id;

    // 1. Process files -- cache to IDB for offline safety, getting 'pending://' local references
    const photoUrls = await Promise.all(
      files.map((file) => cacheFileOffline(entryId, file, 'photo'))
    );

    // 2. Fetch the weather snapshot aggressively, swallowing failure locally if offline
    let weatherSnapshot = undefined;
    try {
      const w = await fetchWeather();
      weatherSnapshot = { temp_hi: w.hi, temp_lo: w.lo, conditions: w.conditions, precip: w.precip };
    } catch {
      console.warn("Offline: Weather snapshot could not be captured for Journal Entry.");
    }

    // 3. Save to Firestore (offline persistence will queue this up if disconnected)
    const newEntry: JournalEntry = {
      ...entryData,
      id: entryId,
      photo_urls: photoUrls,
      weather_snapshot: weatherSnapshot,
      author: user?.displayName || "Farmer",
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    await setDoc(newRef, newEntry);
    
    // 4. In case we ARE currently online, boldly trigger an immediate sync sweep
    syncPendingFiles();
    
    return entryId;
  };

  return { entries, loading, error, createJournalEntry };
}
