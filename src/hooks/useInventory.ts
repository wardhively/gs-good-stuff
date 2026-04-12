import { useState, useEffect } from "react";
import { onSnapshot, doc, writeBatch, setDoc, Timestamp } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import type { Variety } from "@/lib/types";

export function useInventory() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collections.varieties,
      (snapshot) => {
        const results: Variety[] = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Variety));
        setVarieties(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore variety error", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveVariety = async (varietyId: string, updates: Partial<Variety>) => {
    const vRef = doc(collections.varieties, varietyId);
    await setDoc(vRef, { ...updates, updated_at: Timestamp.now() }, { merge: true });
  };

  const createVariety = async (variety: Omit<Variety, "id" | "created_at" | "updated_at">) => {
    const newRef = doc(collections.varieties);
    await setDoc(newRef, {
      ...variety,
      id: newRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return newRef.id;
  };

  const bulkUpdateVarieties = async (varietyUpdates: { id: string, updates: Partial<Variety> }[]) => {
    const batch = writeBatch(db);
    varietyUpdates.forEach(({ id, updates }) => {
      const vRef = doc(collections.varieties, id);
      batch.set(vRef, { ...updates, updated_at: Timestamp.now() }, { merge: true });
    });
    await batch.commit();
  };

  return { varieties, loading, error, saveVariety, createVariety, bulkUpdateVarieties };
}
