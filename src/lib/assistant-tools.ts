/**
 * Tool definitions and executors for Borden AI assistant.
 * Runs server-side via firebase-admin.
 */

import { adminDb } from './firebase-admin';
import * as admin from 'firebase-admin';

const Timestamp = admin.firestore.Timestamp;
const FieldValue = admin.firestore.FieldValue;

// ─── Tool Definitions (for Claude API) ────────────────────────────

export const BORDEN_TOOLS = [
  {
    name: "create_task",
    description: "Create a new task for Gary or Suzy. Use this when something needs to be done on the farm.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Short task title" },
        description: { type: "string", description: "Task details" },
        priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
        due_date: { type: "string", description: "ISO date string YYYY-MM-DD" },
        zone_id: { type: "string", description: "Optional zone ID" },
        assigned_to: { type: "string", description: "Gary or Suzy", default: "Gary" },
      },
      required: ["title", "description", "priority"],
    },
  },
  {
    name: "update_variety_status",
    description: "Advance a variety to a new lifecycle stage. Stages: stored, jugged, planted, growing, attention, dug, divided, listed, sold.",
    input_schema: {
      type: "object" as const,
      properties: {
        variety_id: { type: "string", description: "The variety document ID" },
        new_status: { type: "string", enum: ["stored", "jugged", "planted", "growing", "attention", "dug", "divided", "listed", "sold"] },
        note: { type: "string", description: "Reason for status change" },
      },
      required: ["variety_id", "new_status"],
    },
  },
  {
    name: "add_checklist_item",
    description: "Add a checklist item to a zone, variety, or equipment.",
    input_schema: {
      type: "object" as const,
      properties: {
        parent_type: { type: "string", enum: ["zone", "variety", "equipment"] },
        parent_id: { type: "string", description: "Document ID of the parent" },
        label: { type: "string", description: "Checklist item text" },
        due_date: { type: "string", description: "Optional due date YYYY-MM-DD" },
      },
      required: ["parent_type", "parent_id", "label"],
    },
  },
  {
    name: "create_journal_entry",
    description: "Log a journal entry about farm activity, observations, or decisions.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        category: { type: "string", enum: ["observation", "planting", "harvest", "maintenance", "business", "personal"] },
        zone_id: { type: "string", description: "Optional zone ID" },
        is_public: { type: "boolean", description: "Publish to Growing Guide blog", default: false },
      },
      required: ["title", "body", "category"],
    },
  },
  {
    name: "update_variety_count",
    description: "Update the count (quantity) of a variety. Use when tubers are added, divided, or damaged.",
    input_schema: {
      type: "object" as const,
      properties: {
        variety_id: { type: "string" },
        new_count: { type: "number", description: "New total count" },
        reason: { type: "string", description: "Why the count changed" },
      },
      required: ["variety_id", "new_count"],
    },
  },
  {
    name: "get_weather_forecast",
    description: "Get current weather and 7-day forecast for the farm.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// ─── Tool Executors ───────────────────────────────────────────────

export async function executeTool(name: string, input: any): Promise<string> {
  try {
    switch (name) {
      case "create_task": {
        const ref = adminDb.collection('tasks').doc();
        const data: any = {
          id: ref.id,
          title: input.title,
          description: input.description,
          source: 'ai',
          priority: input.priority || 'medium',
          status: 'pending',
          assigned_to: input.assigned_to || 'Gary',
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        };
        if (input.due_date) data.due_date = Timestamp.fromDate(new Date(input.due_date));
        if (input.zone_id) data.zone_id = input.zone_id;
        await ref.set(data);
        return `Created task: "${input.title}" (${input.priority} priority${input.due_date ? `, due ${input.due_date}` : ''})`;
      }

      case "update_variety_status": {
        const vRef = adminDb.collection('varieties').doc(input.variety_id);
        const vSnap = await vRef.get();
        if (!vSnap.exists) return `Error: Variety ${input.variety_id} not found`;
        const vData = vSnap.data()!;
        const update: any = {
          status: input.new_status,
          updated_at: Timestamp.now(),
          status_history: [...(vData.status_history || []), {
            status: input.new_status,
            timestamp: Timestamp.now(),
            note: input.note || `Updated by Borden`,
          }],
        };
        if (input.new_status === 'planted') {
          update.planted_date = Timestamp.now();
          const dig = new Date();
          dig.setDate(dig.getDate() + 140);
          update.expected_dig_date = Timestamp.fromDate(dig);
        }
        await vRef.update(update);
        return `Updated "${vData.name}" status to ${input.new_status}${input.note ? `: ${input.note}` : ''}`;
      }

      case "add_checklist_item": {
        const collection = input.parent_type === 'zone' ? 'zones'
          : input.parent_type === 'variety' ? 'varieties' : 'equipment';
        const docRef = adminDb.collection(collection).doc(input.parent_id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return `Error: ${input.parent_type} ${input.parent_id} not found`;
        const existing = docSnap.data()!.checklist || [];
        const newItem: any = {
          id: `borden-${Date.now()}`,
          label: input.label,
          completed: false,
        };
        if (input.due_date) newItem.due_date = input.due_date;
        await docRef.update({ checklist: [...existing, newItem], updated_at: Timestamp.now() });
        return `Added checklist item "${input.label}" to ${input.parent_type} ${docSnap.data()!.name || input.parent_id}`;
      }

      case "create_journal_entry": {
        const ref = adminDb.collection('journal_entries').doc();
        await ref.set({
          id: ref.id,
          title: input.title,
          body: input.body,
          category: input.category,
          author: 'Borden',
          is_public: input.is_public || false,
          photo_urls: [],
          variety_ids: [],
          ...(input.zone_id ? { zone_id: input.zone_id } : {}),
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
        return `Created journal entry: "${input.title}"`;
      }

      case "update_variety_count": {
        const vRef = adminDb.collection('varieties').doc(input.variety_id);
        const vSnap = await vRef.get();
        if (!vSnap.exists) return `Error: Variety ${input.variety_id} not found`;
        const name = vSnap.data()!.name;
        const update: any = { count: input.new_count, updated_at: Timestamp.now() };
        if (input.new_count <= 0) update.status = 'sold';
        await vRef.update(update);
        return `Updated "${name}" count to ${input.new_count}${input.reason ? ` (${input.reason})` : ''}`;
      }

      case "get_weather_forecast": {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=42.0446&longitude=-77.3280&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/New_York'
        );
        if (!res.ok) return 'Weather fetch failed';
        const data = await res.json();
        const current = data.current;
        const daily = data.daily;
        let forecast = `Current: ${Math.round(current.temperature_2m)}°F\n`;
        for (let i = 0; i < Math.min(7, daily.time.length); i++) {
          forecast += `${daily.time[i]}: H ${Math.round(daily.temperature_2m_max[i])}° L ${Math.round(daily.temperature_2m_min[i])}° Precip ${daily.precipitation_sum[i]}"\n`;
        }
        return forecast;
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err: any) {
    return `Error executing ${name}: ${err.message}`;
  }
}
