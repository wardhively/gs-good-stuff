import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { broadcastAlert } from "./notifications";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Weather analyzer running periodically.
 * Fetches Open-Meteo, calculates soil_temp est, detects frost drops dynamically.
 */
export const syncWeatherAndAnalyze = onSchedule("every 6 hours", async (event) => {
  const db = admin.firestore();
  
  const lat = 42.10;
  const lng = -77.23;
  const tz = "America/New_York";
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=${tz}&forecast_days=7`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed fetching forecast");
    
    const data = (await res.json()) as any;
    
    // Evaluate soil est: 7-day rolling average of (high + low) / 2 * 0.85
    const highs = data.daily.temperature_2m_max as number[];
    const lows = data.daily.temperature_2m_min as number[];
    
    let totalTemps = 0;
    for (let i = 0; i < highs.length; i++) {
        totalTemps += (highs[i] + lows[i]) / 2;
    }
    const rollingAvg = totalTemps / highs.length;
    const soil_temp_est = Math.round(rollingAvg * 0.85);

    // Frost risk logic mapping directly
    // Look at hourly blocks immediately incoming
    const hourlyTemps = data.hourly.temperature_2m as number[];
    const frostImminent = hourlyTemps.slice(0, 48).some(t => t <= 32); 

    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    // Active season: May 15 - Oct 1
    const inSeason = (month === 5 && day >= 15) || (month > 5 && month < 10) || (month === 10 && day === 1);

    const docId = now.toISOString().split("T")[0]; // YYYY-MM-DD
    
    await db.collection("weather_log").doc(docId).set({
        soil_temp_est,
        frost_alert: frostImminent && inSeason,
        forecast_high: highs[0],
        forecast_low: lows[0],
        updated_at: admin.firestore.Timestamp.now()
    }, { merge: true });

    if (frostImminent && inSeason) {
        await broadcastAlert("FROST ALERT", "Temperatures projected ≤ 32°F within 48h. Deploy covers.", true);
    }
    
    console.log("Weather sync and alert evaluations succeeded.", docId);
  } catch (err) {
    console.error("Critical Weather Cron Exception", err);
  }
});
