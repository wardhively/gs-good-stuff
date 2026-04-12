/**
 * Firestore REST API helper for server components.
 * Avoids firebase-admin SDK credential requirements.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gs-good-stuff';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) obj[k] = parseValue(v as any);
    return obj;
  }
  return null;
}

export async function getDocRest(collection: string, docId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BASE}/${collection}/${docId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const doc = await res.json();
    const parsed: any = { id: doc.name.split('/').pop() };
    for (const [k, v] of Object.entries(doc.fields || {})) parsed[k] = parseValue(v as any);
    return parsed;
  } catch {
    return null;
  }
}
