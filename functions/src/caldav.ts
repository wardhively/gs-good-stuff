import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { format } from "date-fns";

export const generateCalDAV = onRequest(async (req, res) => {
  try {
    const db = admin.firestore();

    // Fetch accepted tasks inherently tracking bounds
    const tasksSnap = await db.collection("tasks")
       .where("status", "==", "accepted")
       .get();
    
    // Fetch Settings explicitly parsing exact bounds
    const settingsSnap = await db.collection("settings").doc("store_config").get();
    const settings = settingsSnap.exists ? settingsSnap.data() : null;

    // CalDAV Initialization Header required perfectly parsing boundaries natively
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//G&S Good Stuff//Farm OS//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:G&S Farm Tasks",
      "X-WR-TIMEZONE:America/New_York"
    ];

    // Construct Task Events
    const nowStamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
    
    tasksSnap.forEach(doc => {
       const task = doc.data();
       if (!task.due_date) return;
       
       const dtStart = format(new Date(task.due_date.seconds * 1000), "yyyyMMdd'T'HHmmss'Z'");
       // Assume 1 hour duration strictly defining limits mapping arrays
       const dtEnd = format(new Date(task.due_date.seconds * 1000 + 3600000), "yyyyMMdd'T'HHmmss'Z'");

       const vEvent = [
         "BEGIN:VEVENT",
         `UID:${doc.id}@gsgoodstuff.com`,
         `DTSTAMP:${nowStamp}`,
         `DTSTART:${dtStart}`,
         `DTEND:${dtEnd}`,
         `SUMMARY:${task.title}`,
         `DESCRIPTION:${task.description}`,
         "BEGIN:VALARM",
         "TRIGGER:-PT1H",
         "ACTION:DISPLAY",
         "DESCRIPTION:Farm Task Reminder",
         "END:VALARM",
         "END:VEVENT"
       ];
       icsContent = icsContent.concat(vEvent);
    });

    // Environment Native Frost Markers
    if (settings) {
       const currentYear = new Date().getFullYear();
       if (settings.last_frost_date) {
         icsContent = icsContent.concat([
           "BEGIN:VEVENT",
           `UID:last-frost-${currentYear}@gsgoodstuff.com`,
           `DTSTAMP:${nowStamp}`,
           `DTSTART;VALUE=DATE:${currentYear}${settings.last_frost_date.replace(/-/g, '')}`,
           `SUMMARY:🌱 Last Spring Frost (Zone 5b)`,
           "END:VEVENT"
         ]);
       }
       if (settings.first_frost_date) {
         icsContent = icsContent.concat([
           "BEGIN:VEVENT",
           `UID:first-frost-${currentYear}@gsgoodstuff.com`,
           `DTSTAMP:${nowStamp}`,
           `DTSTART;VALUE=DATE:${currentYear}${settings.first_frost_date.replace(/-/g, '')}`,
           `SUMMARY:❄️ First Fall Frost (Zone 5b)`,
           "END:VEVENT"
         ]);
       }
    }

    icsContent.push("END:VCALENDAR");
    const outputString = icsContent.join("\r\n");

    res.set({
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=gsgoodstuff.ics"
    });
    
    res.status(200).send(outputString);

  } catch (err) {
    console.error("Generational error mapping CalDAV objects strictly:", err);
    res.status(500).send("Internal Error");
  }
});
