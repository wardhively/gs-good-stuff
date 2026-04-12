import { useState, useEffect } from "react";
import { onSnapshot, doc, setDoc, Timestamp, orderBy, query } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { Order } from "@/lib/types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reverse chronological tracing mapping descending paths naturally
    const q = query(collections.orders, orderBy("created_at", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
        setOrders(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore order error", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveOrder = async (id: string, updates: Partial<Order>) => {
    const ref = doc(collections.orders, id);
    await setDoc(ref, { ...updates, updated_at: Timestamp.now() }, { merge: true });
  };

  const createOrder = async (data: Omit<Order, "id" | "created_at" | "updated_at">) => {
    const newRef = doc(collections.orders);
    await setDoc(newRef, {
      ...data,
      id: newRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return newRef.id;
  };

  return { orders, loading, error, saveOrder, createOrder };
}
