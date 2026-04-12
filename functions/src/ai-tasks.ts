import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import Anthropic from "@anthropic-ai/sdk";
import { broadcastAlert } from "./notifications";

if (!admin.apps.length) {
  admin.initializeApp();
}

const SYSTEM_PROMPT = `
You are an AI farm advisor for a dahlia tuber operation in Addison, NY (Zone 5b, 42.10°N 77.23°W, 1020ft elevation, Canisteo River valley). Last frost May 15, first frost Oct 1. 138-day growing season.

Generate a prioritized daily task list based on weather, inventory, and equipment state.

Return ONLY a JSON array of task objects with fields:
- title: string (short, actionable)
- description: string (1-2 sentences with specific details)
- priority: "urgent" | "high" | "medium" | "low"
- due_date: ISO date string
- source: "ai" | "weather" | "equipment"
- zone_id: string (optional, only if task relates to a specific zone)
- equipment_id: string (optional, only if task relates to equipment)
- estimated_hours: number

Priority rules:
- urgent: frost warning, cooler alarm, pest emergency
- high: time-sensitive planting/digging windows, equipment overdue
- medium: routine maintenance, planned planting
- low: optimization, future planning, nice-to-have

Seasonal awareness:
- Jan-Mar: Division season, cooler management, ordering stock
- Apr: Bed prep, soil testing, jugging starts
- May: Harden off, plant after May 15
- Jun-Aug: Growing season, pest/disease watch, watering
- Sep: Bloom season, photo documentation, store listing
- Oct: Dig before Oct 1 frost, divide, store
- Nov-Dec: Inventory, planning, equipment maintenance

Never hallucinate zones, varieties, or equipment that aren't in the provided data.
`;

export const generateDailyTasks = onSchedule({
    schedule: "0 6 * * *",
    timeZone: "America/New_York"
}, async (event) => {
    const db = admin.firestore();
    
    try {
        // 1. Fetch 7-day Forecase
        const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=42.10&longitude=-77.23&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America%2FNew_York");
        const weatherJson = await weatherRes.json();

        // 2. Fetch context from Firestore arrays securely
        const [zonesSnap, varietiesSnap, equipSnap, journalSnap] = await Promise.all([
            db.collection("zones").get(),
            db.collection("varieties").get(),
            db.collection("equipment").get(),
            db.collection("journal_entries").orderBy("created_at", "desc").limit(5).get()
        ]);

        const zones = zonesSnap.docs.map(d => d.data());
        const varieties = varietiesSnap.docs.map(d => d.data());
        const equipment = equipSnap.docs.map(d => d.data());
        const journals = journalSnap.docs.map(d => d.data());

        // 3. Merge contexts properly formatted
        const compiledZones = zones.map(z => ({
            ...z,
            varieties: varieties.filter(v => v.zone_id === z.id)
        }));

        const userPrompt = `
Today is ${new Date().toISOString()}.

WEATHER (7-day forecast):
${JSON.stringify(weatherJson)}

ZONES (with varieties):
${JSON.stringify(compiledZones)}

EQUIPMENT:
${JSON.stringify(equipment)}

RECENT JOURNAL (last 5 entries):
${JSON.stringify(journals)}

Generate tasks for today and the next 7 days.
`;

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("ANTHROPIC_API_KEY secretly missing.");

        const client = new Anthropic({ apiKey });

        const msg = await client.messages.create({
            model: "claude-3-sonnet-20240229", // Claude 3 Sonnet mapped standard
            max_tokens: 2000,
            temperature: 0.3,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }]
        });

        // 4. Parse Responses
        // Note: SDK returns arrays for content.
        const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '';
        
        // Clean JSON parsing explicitly grabbing chunks
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("JSON generation failure off Anthropics model. Match missing arrays.");

        const newTasks = JSON.parse(jsonMatch[0]);

        // 5. Array insertions into Firestore securely mapping generated elements
        const batch = db.batch();
        const now = admin.firestore.Timestamp.now();

        for (const task of newTasks) {
            const docRef = db.collection("tasks").doc();
            batch.set(docRef, {
                ...task,
                due_date: task.due_date ? admin.firestore.Timestamp.fromDate(new Date(task.due_date)) : now,
                source: "ai",
                status: "pending",
                created_at: now,
                updated_at: now,
                assigned_to: "Gary" // Defaults assignments broadly
            });
        }

        await batch.commit();

        // 6. Broadcast successful AI generation hook to admins
        await broadcastAlert("Morning Tasks Ready", `Good morning, Gary. ${newTasks.length} tasks scheduled today context-aware.`);

        console.log(`Executed Sonnet Model correctly inserting ${newTasks.length} elements.`);

    } catch (err) {
        console.error("AI Generation Critical Stop", err);
    }
});
