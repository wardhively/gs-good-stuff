/**
 * Builds a concise farm context snapshot for Borden (Claude).
 * Uses Firestore REST API with the web API key to avoid admin SDK credential issues.
 */

import { format } from 'date-fns';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gs-good-stuff';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function fetchCollection(collection: string, limit?: number): Promise<any[]> {
  try {
    let url = `${FIRESTORE_BASE}/${collection}`;
    if (limit) url += `?pageSize=${limit}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents || []).map(parseDoc);
  } catch {
    return [];
  }
}

function parseDoc(doc: any): any {
  const id = doc.name.split('/').pop();
  const fields = doc.fields || {};
  const parsed: any = { id };
  for (const [key, val] of Object.entries(fields)) {
    parsed[key] = parseValue(val as any);
  }
  return parsed;
}

function parseValue(val: any): any {
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.timestampValue !== undefined) return val.timestampValue;
  if (val.nullValue !== undefined) return null;
  if (val.arrayValue) return (val.arrayValue.values || []).map(parseValue);
  if (val.mapValue) {
    const obj: any = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseValue(v as any);
    }
    return obj;
  }
  return null;
}

export async function buildFarmContext(): Promise<string> {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');

  const [zones, varieties, tasks, equip, orders, weather, journal] = await Promise.all([
    fetchCollection('zones'),
    fetchCollection('varieties'),
    fetchCollection('tasks'),
    fetchCollection('equipment'),
    fetchCollection('orders', 10),
    fetchCollection('weather_log', 7),
    fetchCollection('journal_entries', 5),
  ]);

  // Also fetch business plan
  let plan: any = null;
  try {
    const res = await fetch(`${FIRESTORE_BASE}/business_plan/2026`, { cache: 'no-store' });
    if (res.ok) plan = parseDoc(await res.json());
  } catch {}

  // Zones
  const zoneLines = zones.map(z =>
    `${z.name || z.id}: status=${z.status || '?'}, elevation=${z.elevation || '?'}ft, drainage=${z.drainage || '?'}, frost_risk=${z.frost_risk || '?'}`
  );

  // Varieties with counts
  const varietyLines = varieties.map(v =>
    `${v.name || v.id}: count=${v.count || 0}, status=${v.status || '?'}, zone=${v.zone_id || 'unassigned'}, price=$${v.price || 0}, bloom=${v.bloom_form || '?'}`
  );

  // Status summary
  const statusCounts: Record<string, number> = {};
  varieties.forEach(v => {
    const s = v.status || 'unknown';
    statusCounts[s] = (statusCounts[s] || 0) + (v.count || 0);
  });

  // Pending tasks
  const pendingTasks = tasks.filter(t => t.status === 'pending').map(t =>
    `[${t.priority || 'medium'}] ${t.title} (source: ${t.source || 'manual'})`
  );

  // Equipment
  const equipLines = equip.map(e =>
    `${e.name}: ${e.current_hours || 0}hrs, status=${e.status || 'ok'}`
  );

  // Orders
  const orderLines = orders.map(o =>
    `$${o.total || 0} from ${o.customer_name || '?'} (${o.status || '?'}, source: ${o.source || 'online'})`
  );

  // Seasonal context
  const month = now.getMonth() + 1;
  let seasonNote = '';
  if (month >= 1 && month <= 3) seasonNote = 'SEASON: Winter — division time, cooler management, ordering stock.';
  else if (month === 4) seasonNote = 'SEASON: Early spring — bed prep, soil testing, jugging starts.';
  else if (month === 5) seasonNote = 'SEASON: Late spring — harden off jugged tubers, plant AFTER May 15 last frost.';
  else if (month >= 6 && month <= 8) seasonNote = 'SEASON: Growing season — pest watch, watering, staking, pinching.';
  else if (month === 9) seasonNote = 'SEASON: Bloom season — photos, store listing, cut flowers.';
  else if (month === 10) seasonNote = 'SEASON: Dig season — dig BEFORE Oct 1 first frost, divide, store.';
  else seasonNote = 'SEASON: Late fall — inventory, planning, equipment maintenance.';

  // Business plan
  const planLine = plan
    ? `Year ${plan.year || 2026}: Revenue $${plan.actuals?.revenue || 0}/$${plan.targets?.revenue || 0} target, Sold ${plan.actuals?.sold || 0}/${plan.targets?.sold || 0}`
    : 'No plan data';

  return `FARM STATUS as of ${today}:
${seasonNote}
Location: Addison, NY. Zone 5b. Last frost May 15, first frost Oct 1. 138-day season.

ZONES (${zones.length}):
${zoneLines.join('\n') || 'None'}

VARIETIES (${varieties.length} records, ${Object.entries(statusCounts).map(([s, c]) => `${c} ${s}`).join(', ')}):
${varietyLines.join('\n') || 'None'}

PENDING TASKS (${pendingTasks.length}):
${pendingTasks.join('\n') || 'None'}

EQUIPMENT (${equip.length}):
${equipLines.join('\n') || 'None'}

RECENT ORDERS (${orders.length}):
${orderLines.join('\n') || 'None'}

BUSINESS PLAN:
${planLine}`;
}
