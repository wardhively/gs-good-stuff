import { useState, useEffect } from "react";
import { onSnapshot, doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { SiteFeature } from "@/lib/types";

export function useSiteFeatures() {
  const [features, setFeatures] = useState<SiteFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collections.siteFeatures,
      (snapshot) => {
        const results: SiteFeature[] = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as SiteFeature));
        setFeatures(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore site features error", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const createFeature = async (data: Omit<SiteFeature, "id" | "created_at" | "updated_at">) => {
    const newRef = doc(collections.siteFeatures);
    await setDoc(newRef, {
      ...data,
      id: newRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return newRef.id;
  };

  const saveFeature = async (id: string, updates: Partial<SiteFeature>) => {
    const ref = doc(collections.siteFeatures, id);
    await setDoc(ref, { ...updates, updated_at: Timestamp.now() }, { merge: true });
  };

  const deleteFeature = async (id: string) => {
    await deleteDoc(doc(collections.siteFeatures, id));
  };

  return { features, loading, error, createFeature, saveFeature, deleteFeature };
}
