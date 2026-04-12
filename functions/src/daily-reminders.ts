import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { broadcastAlert } from "./notifications";

const db = admin.firestore();

/**
 * Daily reminders at 7 AM Eastern.
 * Scans tasks, checklist items, variety milestones, and low stock.
 */
export const dailyReminders = onSchedule("0 7 * * *", async () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const sevenDaysOut = new Date(today);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

  const alerts: string[] = [];

  // 1. Tasks due today
  try {
    const tasksSnap = await db.collection('tasks')
      .where('status', '==', 'pending')
      .get();

    let tasksDueToday = 0;
    tasksSnap.docs.forEach(doc => {
      const task = doc.data();
      if (task.due_date) {
        const dueDate = new Date(task.due_date.seconds * 1000);
        if (dueDate.toISOString().split('T')[0] === todayStr) {
          tasksDueToday++;
        }
      }
    });
    if (tasksDueToday > 0) {
      alerts.push(`${tasksDueToday} task${tasksDueToday > 1 ? 's' : ''} due today`);
    }
  } catch {}

  // 2. Checklist items due today (from zones, varieties, equipment)
  let checklistDue = 0;
  for (const collection of ['zones', 'varieties', 'equipment']) {
    try {
      const snap = await db.collection(collection).get();
      snap.docs.forEach(doc => {
        const checklist = doc.data().checklist || [];
        checklist.forEach((item: any) => {
          if (!item.completed && item.due_date === todayStr) {
            checklistDue++;
          }
        });
      });
    } catch {}
  }
  if (checklistDue > 0) {
    alerts.push(`${checklistDue} checklist item${checklistDue > 1 ? 's' : ''} due`);
  }

  // 3. Varieties approaching dig date (within 7 days)
  try {
    const varietiesSnap = await db.collection('varieties')
      .where('status', '==', 'growing')
      .get();

    let approachingDig = 0;
    varietiesSnap.docs.forEach(doc => {
      const v = doc.data();
      if (v.expected_dig_date) {
        const digDate = new Date(v.expected_dig_date.seconds * 1000);
        if (digDate >= today && digDate <= sevenDaysOut) {
          approachingDig++;
        }
      }
    });
    if (approachingDig > 0) {
      alerts.push(`${approachingDig} variet${approachingDig > 1 ? 'ies' : 'y'} approaching dig date`);
    }
  } catch {}

  // 4. Low stock alerts (listed varieties with count <= 3)
  try {
    const listedSnap = await db.collection('varieties')
      .where('status', '==', 'listed')
      .get();

    let lowStock = 0;
    const lowNames: string[] = [];
    listedSnap.docs.forEach(doc => {
      const v = doc.data();
      if (v.count <= 3 && v.count > 0) {
        lowStock++;
        lowNames.push(`${v.name} (${v.count})`);
      }
    });
    if (lowStock > 0) {
      alerts.push(`Low stock: ${lowNames.slice(0, 3).join(', ')}${lowStock > 3 ? ` +${lowStock - 3} more` : ''}`);
    }
  } catch {}

  // 5. Equipment due soon or overdue
  try {
    const equipSnap = await db.collection('equipment').get();
    let equipIssues = 0;
    equipSnap.docs.forEach(doc => {
      const e = doc.data();
      if (e.status === 'overdue' || e.status === 'due_soon') {
        equipIssues++;
      }
    });
    if (equipIssues > 0) {
      alerts.push(`${equipIssues} equipment item${equipIssues > 1 ? 's' : ''} need${equipIssues === 1 ? 's' : ''} service`);
    }
  } catch {}

  // Send combined notification if there are any alerts
  if (alerts.length > 0) {
    const body = alerts.join(' · ');
    await broadcastAlert("Daily Reminder", body, false);
    console.log("Daily reminders sent:", body);
  } else {
    console.log("No daily reminders to send.");
  }
});
