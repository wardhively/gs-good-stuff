/**
 * Tool definitions and executors for Borden AI assistant.
 * Uses Firestore REST API to avoid admin SDK credential issues.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gs-good-stuff';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── Firestore REST helpers ───────────────────────────────────────

async function createDoc(collection: string, data: Record<string, any>): Promise<string> {
  const res = await fetch(`${FIRESTORE_BASE}/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!res.ok) throw new Error(`Firestore create failed: ${await res.text()}`);
  const doc = await res.json();
  return doc.name.split('/').pop();
}

async function updateDoc(collection: string, docId: string, data: Record<string, any>): Promise<void> {
  const fieldPaths = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}?${fieldPaths}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!res.ok) throw new Error(`Firestore update failed: ${await res.text()}`);
}

async function getDoc(collection: string, docId: string): Promise<any> {
  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`);
  if (!res.ok) return null;
  const doc = await res.json();
  const parsed: any = { id: doc.name.split('/').pop() };
  for (const [k, v] of Object.entries(doc.fields || {})) {
    parsed[k] = fromField(v as any);
  }
  return parsed;
}

function toFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    fields[k] = toValue(v);
  }
  return fields;
}

function toValue(v: any): any {
  if (v === null) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'object') return { mapValue: { fields: toFields(v) } };
  return { stringValue: String(v) };
}

function fromField(v: any): any {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.nullValue !== undefined) return null;
  if (v.arrayValue) return (v.arrayValue.values || []).map(fromField);
  if (v.mapValue) {
    const obj: any = {};
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) obj[k] = fromField(val as any);
    return obj;
  }
  return null;
}

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
    description: "Update the count (quantity) of a variety.",
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
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
];

// ─── Tool Executors ───────────────────────────────────────────────

export async function executeTool(name: string, input: any): Promise<string> {
  try {
    switch (name) {
      case "create_task": {
        const data: any = {
          title: input.title,
          description: input.description,
          source: 'ai',
          priority: input.priority || 'medium',
          status: 'pending',
          assigned_to: input.assigned_to || 'Gary',
          created_at: new Date(),
          updated_at: new Date(),
        };
        if (input.due_date) data.due_date = new Date(input.due_date);
        if (input.zone_id) data.zone_id = input.zone_id;
        const id = await createDoc('tasks', data);
        return `Created task: "${input.title}" (${input.priority} priority${input.due_date ? `, due ${input.due_date}` : ''})`;
      }

      case "update_variety_status": {
        const v = await getDoc('varieties', input.variety_id);
        if (!v) return `Error: Variety ${input.variety_id} not found`;
        const history = v.status_history || [];
        history.push({ status: input.new_status, timestamp: new Date(), note: input.note || 'Updated by Borden' });
        const update: any = { status: input.new_status, updated_at: new Date(), status_history: history };
        if (input.new_status === 'planted') {
          update.planted_date = new Date();
          const dig = new Date(); dig.setDate(dig.getDate() + 140);
          update.expected_dig_date = dig;
        }
        await updateDoc('varieties', input.variety_id, update);
        return `Updated "${v.name}" status to ${input.new_status}`;
      }

      case "add_checklist_item": {
        const collection = input.parent_type === 'zone' ? 'zones'
          : input.parent_type === 'variety' ? 'varieties' : 'equipment';
        const doc = await getDoc(collection, input.parent_id);
        if (!doc) return `Error: ${input.parent_type} ${input.parent_id} not found`;
        const existing = doc.checklist || [];
        const newItem: any = { id: `borden-${Date.now()}`, label: input.label, completed: false };
        if (input.due_date) newItem.due_date = input.due_date;
        existing.push(newItem);
        await updateDoc(collection, input.parent_id, { checklist: existing, updated_at: new Date() });
        return `Added checklist item "${input.label}" to ${doc.name || input.parent_id}`;
      }

      case "create_journal_entry": {
        const data: any = {
          title: input.title,
          body: input.body,
          category: input.category,
          author: 'Borden',
          is_public: input.is_public || false,
          photo_urls: [],
          variety_ids: [],
          created_at: new Date(),
          updated_at: new Date(),
        };
        if (input.zone_id) data.zone_id = input.zone_id;
        await createDoc('journal_entries', data);
        return `Created journal entry: "${input.title}"`;
      }

      case "update_variety_count": {
        const v = await getDoc('varieties', input.variety_id);
        if (!v) return `Error: Variety ${input.variety_id} not found`;
        const update: any = { count: input.new_count, updated_at: new Date() };
        if (input.new_count <= 0) update.status = 'sold';
        await updateDoc('varieties', input.variety_id, update);
        return `Updated "${v.name}" count to ${input.new_count}${input.reason ? ` (${input.reason})` : ''}`;
      }

      case "get_weather_forecast": {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=42.0446&longitude=-77.3280&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/New_York'
        );
        if (!res.ok) return 'Weather fetch failed';
        const data = await res.json();
        let forecast = `Current: ${Math.round(data.current.temperature_2m)}°F\n`;
        for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
          forecast += `${data.daily.time[i]}: H ${Math.round(data.daily.temperature_2m_max[i])}° L ${Math.round(data.daily.temperature_2m_min[i])}° Precip ${data.daily.precipitation_sum[i]}"\n`;
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
