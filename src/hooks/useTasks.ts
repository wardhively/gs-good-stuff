import { useState, useEffect } from "react";
import { onSnapshot, doc, setDoc, deleteDoc, Timestamp, orderBy, query } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { Task } from "@/lib/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Order by due_date ascending implicitly handles prioritization logic mapped to time
    const q = query(collections.tasks, orderBy("due_date", "asc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Task));
        setTasks(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore tasks error", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveTask = async (taskId: string, updates: Partial<Task>) => {
    const tRef = doc(collections.tasks, taskId);
    await setDoc(tRef, { ...updates, updated_at: Timestamp.now() }, { merge: true });
  };

  const createTask = async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const newRef = doc(collections.tasks);
    await setDoc(newRef, {
      ...task,
      id: newRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return newRef.id;
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(collections.tasks, id));
  };

  return { tasks, loading, error, saveTask, createTask, deleteTask };
}
