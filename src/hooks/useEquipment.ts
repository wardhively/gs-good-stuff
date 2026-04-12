import { useState, useEffect } from "react";
import { onSnapshot, doc, setDoc, Timestamp, orderBy, query } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import type { Equipment } from "@/lib/types";

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collections.equipment, orderBy("name", "asc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Equipment));
        setEquipment(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore equipment error", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveEquipment = async (id: string, updates: Partial<Equipment>) => {
    const ref = doc(collections.equipment, id);
    await setDoc(ref, { ...updates, updated_at: Timestamp.now() }, { merge: true });
  };

  const createEquipment = async (data: Omit<Equipment, "id" | "updated_at">) => {
    const newRef = doc(collections.equipment);
    await setDoc(newRef, {
      ...data,
      id: newRef.id,
      updated_at: Timestamp.now(),
    });
    return newRef.id;
  };

  /**
   * Logs a maintenance entry, recalculates overall hours, calculates interval percentages,
   * establishes overdue statuses securely, and invokes createTask callback natively when shifting into alarming states.
   */
  const logMaintenance = async (
    equipmentId: string, 
    entry: NonNullable<Equipment['maintenance_log']>[number],
    createTaskCallback?: (payload: any) => Promise<string>,
    newCurrentHours?: number
  ) => {
    const target = equipment.find(e => e.id === equipmentId);
    if (!target) throw new Error("Equipment not found");

    const updatedCurrentHours = newCurrentHours ?? target.current_hours;
    
    // Process service intervals natively
    const updatedServiceItems = target.service_items.map(item => {
      if (item.type === entry.type) {
        return {
          ...item,
          last_completed_at: entry.date,
          last_cost: entry.cost
        };
      }
      return item;
    });

    // Evaluate health statuses cleanly evaluating interval maths
    let newStatus: Equipment['status'] = 'ok';
    
    for (const item of updatedServiceItems) {
      if (item.last_completed_hours === undefined) continue;

      const elapsed = updatedCurrentHours - item.last_completed_hours;
      const percentage = (elapsed / item.interval_hours) * 100;

      if (percentage >= 100) {
        newStatus = 'overdue';
      } else if (percentage >= 90 && newStatus !== 'overdue') {
        newStatus = 'due_soon';
      }
    }

    const updatedLog = [...(target.maintenance_log || []), entry];
    
    await saveEquipment(equipmentId, {
      current_hours: updatedCurrentHours,
      maintenance_log: updatedLog,
      service_items: updatedServiceItems,
      status: newStatus
    });

    if (newStatus === 'overdue' || newStatus === 'due_soon') {
      if (createTaskCallback) {
        await createTaskCallback({
          title: `Service ${target.name} — ${entry.type}`,
          description: `Automatically flagged based on interval exhaustion rules mapped safely into useEquipment log triggers.`,
          source: 'equipment',
          equipment_id: equipmentId,
          priority: newStatus === 'overdue' ? 'high' : 'medium',
          status: 'pending',
          due_date: Timestamp.now(), 
          assigned_to: 'Gary'
        });
      }
    }
  };

  return { equipment, loading, error, saveEquipment, createEquipment, logMaintenance };
}
