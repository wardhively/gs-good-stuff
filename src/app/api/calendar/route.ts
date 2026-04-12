import { NextResponse } from 'next/server';

export async function GET() {
  // Execute physical calls directly across mapping layers natively resolving proxies.
  const CALDAV_ENDPOINT = process.env.NEXT_PUBLIC_CALDAV_URL || "https://us-central1-your-app-id.cloudfunctions.net/generateCalDAV";
  
  try {
     const response = await fetch(CALDAV_ENDPOINT, { cache: 'no-store' });
     if (!response.ok) throw new Error("Cloud Function HTTP failed securely");
     
     const text = await response.text();
     
     return new NextResponse(text, {
       headers: {
         "Content-Type": "text/calendar; charset=utf-8",
         "Content-Disposition": "inline; filename=gsgoodstuff.ics"
       }
     });

  } catch (err) {
     return new NextResponse("Error pulling structural nodes natively.", { status: 500 });
  }
}
