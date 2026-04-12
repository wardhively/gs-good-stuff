"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Plus, X, Calendar } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import type { ChecklistItem } from "@/lib/types";
import { format, isPast, isToday as isDateToday } from "date-fns";

interface ChecklistProps {
  items: ChecklistItem[];
  presetItems?: string[];
  onChange: (items: ChecklistItem[]) => void;
}

export default function Checklist({ items: externalItems, presetItems, onChange }: ChecklistProps) {
  // Local state for immediate UI updates — syncs from external on external changes
  const [items, setItems] = useState<ChecklistItem[]>(externalItems);
  const [newItem, setNewItem] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const pendingSave = useRef(false);

  // Sync from external when Firestore updates (but not when we just saved)
  useEffect(() => {
    if (!pendingSave.current) {
      setItems(externalItems);
    }
    pendingSave.current = false;
  }, [externalItems]);

  // Strip undefined values — Firestore rejects them
  const clean = (item: ChecklistItem): ChecklistItem => {
    const cleaned: any = {};
    for (const [k, v] of Object.entries(item)) {
      if (v !== undefined) cleaned[k] = v;
    }
    return cleaned;
  };

  const save = (updated: ChecklistItem[]) => {
    const cleaned = updated.map(clean);
    setItems(cleaned);
    pendingSave.current = true;
    onChange(cleaned);
  };

  const availablePresets = (presetItems || []).filter(
    p => !items.some(i => i.label === p)
  );

  const toggleItem = (id: string) => {
    save(items.map(i => {
      if (i.id !== id) return i;
      const toggled = { ...i, completed: !i.completed };
      if (toggled.completed) toggled.completed_at = Timestamp.now();
      else delete (toggled as any).completed_at;
      return toggled;
    }));
  };

  const removeItem = (id: string) => {
    save(items.filter(i => i.id !== id));
  };

  const setDueDate = (id: string, date: string) => {
    save(items.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i };
      if (date) updated.due_date = date;
      else delete (updated as any).due_date;
      return updated;
    }));
    setEditingDateId(null);
  };

  const addItem = (label: string, dueDate?: string) => {
    if (!label.trim()) return;
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      label: label.trim(),
      completed: false,
    };
    if (dueDate) item.due_date = dueDate;
    save([...items, item]);
    setNewItem("");
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1.5 bg-clay rounded-full overflow-hidden">
            <div
              className="h-full bg-leaf rounded-full transition-all"
              style={{ width: `${items.length ? (completedCount / items.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-stone-c">{completedCount}/{items.length}</span>
        </div>
      )}

      {/* Checklist items */}
      {items.map(item => {
        const isOverdue = item.due_date && !item.completed && isPast(new Date(item.due_date + "T23:59:59")) && !isDateToday(new Date(item.due_date));
        const isDueToday = item.due_date && !item.completed && isDateToday(new Date(item.due_date));

        return (
          <div key={item.id} className="group py-1">
            <div className="flex items-center gap-3">
              {/* Checkbox — large touch target */}
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleItem(item.id); }}
                className={`w-7 h-7 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-colors active:scale-90 ${
                  item.completed
                    ? "bg-leaf border-leaf text-white"
                    : "border-fence bg-linen hover:border-stone-c active:border-leaf"
                }`}
              >
                {item.completed && <Check className="w-4 h-4" />}
              </button>
              <span
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleItem(item.id); }}
                className={`flex-1 text-sm font-dm-sans cursor-pointer select-none ${item.completed ? "line-through text-ash" : "text-root"}`}
              >
                {item.label}
              </span>
              {/* Due date button */}
              <button
                onClick={(e) => { e.stopPropagation(); setEditingDateId(editingDateId === item.id ? null : item.id); }}
                className={`p-2 rounded-md transition-colors ${
                  item.due_date
                    ? isOverdue ? "text-frost bg-frost-lt/50" : isDueToday ? "text-bloom bg-bloom-lt/50" : "text-creek bg-creek-lt/50"
                    : "text-ash hover:text-stone-c hover:bg-clay"
                }`}
                title={item.due_date ? `Due: ${item.due_date}` : "Set due date"}
              >
                <Calendar className="w-4 h-4" />
              </button>
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                className="p-2 text-ash hover:text-frost hover:bg-frost-lt/50 rounded-md transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Due date display */}
            {item.due_date && editingDateId !== item.id && (
              <div className={`ml-7 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                isOverdue ? "text-frost" : isDueToday ? "text-bloom" : "text-creek"
              }`}>
                {isOverdue ? "OVERDUE · " : isDueToday ? "TODAY · " : ""}
                {format(new Date(item.due_date), "MMM d, yyyy")}
              </div>
            )}

            {/* Date picker inline */}
            {editingDateId === item.id && (
              <div className="ml-7 mt-1 flex items-center gap-2">
                <input
                  type="date"
                  value={item.due_date || ""}
                  onChange={e => setDueDate(item.id, e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-fence bg-cream text-root focus:outline-none focus:ring-2 focus:ring-petal"
                />
                {item.due_date && (
                  <button onClick={() => setDueDate(item.id, "")} className="text-[10px] text-frost font-bold">Clear</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add custom item with due date */}
      <div className="mt-2 space-y-1.5">
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && newItem.trim() && (addItem(newItem, newDueDate || undefined), setNewDueDate(""))}
            placeholder="Add task..."
            className="flex-1 px-2 py-1.5 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal"
          />
          <button
            onClick={() => { addItem(newItem, newDueDate || undefined); setNewDueDate(""); }}
            disabled={!newItem.trim()}
            className="px-2 py-1.5 bg-soil text-white rounded-lg disabled:opacity-30 hover:bg-root transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-stone-c" />
          <input
            type="date"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-fence bg-cream text-root focus:outline-none focus:ring-2 focus:ring-petal"
          />
          <span className="text-[10px] text-ash">Optional due date</span>
        </div>
      </div>

      {/* Preset suggestions */}
      {availablePresets.length > 0 && (
        <div>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="text-[10px] uppercase tracking-wider font-bold text-creek hover:text-creek-dk transition-colors"
          >
            {showPresets ? "Hide suggestions" : `+ ${availablePresets.length} suggested tasks`}
          </button>
          {showPresets && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {availablePresets.map(preset => (
                <button
                  key={preset}
                  onClick={() => addItem(preset)}
                  className="px-2 py-1 bg-creek-lt text-creek text-[11px] font-bold rounded-full hover:bg-creek hover:text-white transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
