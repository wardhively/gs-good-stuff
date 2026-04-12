import { useState, useEffect } from "react";
import { onSnapshot, doc, setDoc, query, orderBy } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { BusinessPlan } from "@/lib/types";

export function useBusinessPlan() {
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collections.businessPlan, orderBy("year", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as BusinessPlan));
        setPlans(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore businessPlan error", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const savePlan = async (id: string, updates: Partial<BusinessPlan>) => {
    const ref = doc(collections.businessPlan, id);
    await setDoc(ref, updates, { merge: true });
  };

  return { plans, loading, error, savePlan };
}
