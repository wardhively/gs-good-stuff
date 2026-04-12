import { useState, useEffect } from "react";
import { onSnapshot, doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
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

  const createZone = async (data: Omit<Zone, "id" | "created_at" | "updated_at">) => {
    const newRef = doc(collections.zones);
    await setDoc(newRef, {
      ...data,
      id: newRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return newRef.id;
  };

  const saveZone = async (id: string, updates: Partial<Zone>) => {
    const ref = doc(collections.zones, id);
    await setDoc(ref, { ...updates, updated_at: Timestamp.now() }, { merge: true });
  };

  const deleteZone = async (id: string) => {
    await deleteDoc(doc(collections.zones, id));
  };

  return { zones, loading, error, createZone, saveZone, deleteZone };
}
