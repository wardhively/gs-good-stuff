import { Timestamp } from "firebase/firestore";
import type { Variety } from "./types";
import { StatusEnum } from "./constants";
import { addDays } from "date-fns";

export const STATUS_LIFECYCLE_PATH: StatusEnum[] = [
  StatusEnum.STORED,
  StatusEnum.JUGGED,
  StatusEnum.PLANTED,
  StatusEnum.GROWING,
  StatusEnum.DUG,
  StatusEnum.DIVIDED,
  StatusEnum.LISTED,
  StatusEnum.SOLD
];

export function getNextStatus(current: StatusEnum): StatusEnum | null {
  if (current === StatusEnum.ATTENTION) return null; // Needs manual resolution out of attention
  const currentIndex = STATUS_LIFECYCLE_PATH.indexOf(current);
  if (currentIndex >= 0 && currentIndex < STATUS_LIFECYCLE_PATH.length - 1) {
    return STATUS_LIFECYCLE_PATH[currentIndex + 1];
  }
  return null;
}

export function advanceVarietyStatus(variety: Variety, targetStatus?: StatusEnum, note?: string): Variety {
  const nextStatus = targetStatus || getNextStatus(variety.status);
  if (!nextStatus) return variety;

  const now = Timestamp.now();
  const updatedHistory = [...(variety.status_history || []), { status: nextStatus, timestamp: now, note }];
  
  let updates = {
    status: nextStatus,
    status_history: updatedHistory,
    updated_at: now,
  } as Partial<Variety>;

  // Specific side effects based on rules
  if (nextStatus === StatusEnum.JUGGED) {
    updates.jugged_date = now;
  }
  
  if (nextStatus === StatusEnum.PLANTED) {
    updates.planted_date = now;
    // Auto-set expected_dig_date = planted_date + 140 days
    updates.expected_dig_date = Timestamp.fromDate(addDays(now.toDate(), 140));
  }
  
  if (nextStatus === StatusEnum.SOLD && variety.count > 0) {
    // A bulk trigger might bypass order hook - just in case safety handling. Usually webhook handles this.
  }

  return { ...variety, ...updates };
}
