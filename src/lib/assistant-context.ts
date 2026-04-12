/**
 * Builds a concise farm context snapshot for Borden (Claude).
 * Runs server-side via firebase-admin.
 */

import { adminDb } from './firebase-admin';
import { format } from 'date-fns';

export async function buildFarmContext(): Promise<string> {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);

  // Parallel fetches
  const [zonesSnap, varietiesSnap, tasksSnap, equipSnap, ordersSnap, weatherSnap, planSnap, journalSnap] = await Promise.all([
    adminDb.collection('zones').get(),
    adminDb.collection('varieties').get(),
    adminDb.collection('tasks').where('status', '==', 'pending').get(),
    adminDb.collection('equipment').get(),
    adminDb.collection('orders').orderBy('created_at', 'desc').limit(10).get(),
    adminDb.collection('weather_log').orderBy('date', 'desc').limit(7).get(),
    adminDb.collection('business_plan').doc('2026').get(),
    adminDb.collection('journal_entries').orderBy('created_at', 'desc').limit(5).get(),
  ]);

  // Zones
  const zones = zonesSnap.docs.map(d => {
    const z = d.data();
    return `${z.name} (${d.id}): status=${z.status}, elevation=${z.elevation || '?'}ft, drainage=${z.drainage || '?'}, frost_risk=${z.frost_risk || '?'}`;
  });

  // Varieties with counts
  const varieties = varietiesSnap.docs.map(d => {
    const v = d.data();
    const digDate = v.expected_dig_date ? format(new Date(v.expected_dig_date.seconds * 1000), 'MMM d') : 'N/A';
    return `${v.name} (${d.id}): count=${v.count}, status=${v.status}, zone=${v.zone_id || 'unassigned'}, price=$${v.price || 0}, bloom=${v.bloom_form || '?'}, dig_date=${digDate}`;
  });

  // Status summary
  const statusCounts: Record<string, number> = {};
  varietiesSnap.docs.forEach(d => {
    const s = d.data().status;
    statusCounts[s] = (statusCounts[s] || 0) + d.data().count;
  });

  // Pending tasks
  const pendingTasks = tasksSnap.docs.map(d => {
    const t = d.data();
    const due = t.due_date ? format(new Date(t.due_date.seconds * 1000), 'MMM d') : 'no date';
    return `[${t.priority}] ${t.title} (due: ${due}, source: ${t.source})`;
  });

  // Equipment
  const equip = equipSnap.docs.map(d => {
    const e = d.data();
    const overdue = e.service_items?.filter((s: any) => {
      const elapsed = e.current_hours - (s.last_completed_hours || 0);
      return elapsed >= s.interval_hours;
    }) || [];
    return `${e.name} (${d.id}): ${e.current_hours}hrs, status=${e.status}${overdue.length ? `, OVERDUE: ${overdue.map((s: any) => s.type).join(', ')}` : ''}`;
  });

  // Recent orders
  const orders = ordersSnap.docs.map(d => {
    const o = d.data();
    const date = o.created_at ? format(new Date(o.created_at.seconds * 1000), 'MMM d') : '?';
    return `$${o.total} from ${o.customer_name} on ${date} (${o.status}, source: ${o.source || 'online'})`;
  });

  // Weather
  const weather = weatherSnap.docs.map(d => {
    const w = d.data();
    return `${w.date}: hi=${w.actual_high}°F lo=${w.actual_low}°F precip=${w.precip_inches}" soil=${w.soil_temp_est}°F${w.frost_alert ? ' FROST!' : ''}`;
  });

  // Business plan
  const plan = planSnap.exists ? planSnap.data() : null;
  const planSummary = plan ? `Year ${plan.year}: Revenue $${plan.actuals?.revenue || 0}/$${plan.targets?.revenue || 0} target, Sold ${plan.actuals?.sold || 0}/${plan.targets?.sold || 0}, Planted ${plan.actuals?.planted || 0}/${plan.targets?.planted || 0}` : 'No plan data';

  // Recent journal
  const journal = journalSnap.docs.map(d => {
    const j = d.data();
    const date = j.created_at ? format(new Date(j.created_at.seconds * 1000), 'MMM d') : '?';
    return `[${date}] ${j.title} (${j.category}) by ${j.author}`;
  });

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

  return `FARM STATUS as of ${today}:
${seasonNote}
Location: Addison, NY. Zone 5b. Last frost May 15, first frost Oct 1. 138-day season.

ZONES (${zones.length}):
${zones.join('\n') || 'None'}

VARIETIES (${varieties.length} records, ${Object.entries(statusCounts).map(([s, c]) => `${c} ${s}`).join(', ')}):
${varieties.join('\n') || 'None'}

PENDING TASKS (${pendingTasks.length}):
${pendingTasks.join('\n') || 'None'}

EQUIPMENT (${equip.length}):
${equip.join('\n') || 'None'}

RECENT ORDERS (last 10):
${orders.join('\n') || 'None'}

WEATHER (last 7 days):
${weather.join('\n') || 'No data'}

BUSINESS PLAN:
${planSummary}

RECENT JOURNAL:
${journal.join('\n') || 'None'}`;
}
