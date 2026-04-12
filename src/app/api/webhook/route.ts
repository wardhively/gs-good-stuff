import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: "2024-04-10" as any,
  });
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const rawItems = session.metadata?.raw_items;
    if (!rawItems) return NextResponse.json({ error: "Missing metadata" }, { status: 400 });

    const itemsParsed = JSON.parse(rawItems);
    
    // Address extraction natively avoiding undefined crashes
    const addr = (session as any).shipping_details?.address;
    
    try {
      // 1. Transactional Write to decrement varieties securely avoiding race collisions
      await adminDb.runTransaction(async (t) => {
         // Gather all refs
         const docRefs = itemsParsed.map((i: any) => adminDb.collection("varieties").doc(i.id));
         const docSnaps = await Promise.all(docRefs.map((r: any) => t.get(r)));
         
         // Decrement mathematically natively 
         docSnaps.forEach((snap, idx) => {
            if (snap.exists) {
               const currentCount = snap.data()?.count || 0;
               const deduct = itemsParsed[idx].q;
               const newCount = Math.max(0, currentCount - deduct);
               t.update(snap.ref, { 
                 count: newCount, 
                 status: newCount <= 0 ? 'sold' : snap.data()?.status 
               });
            }
         });

         // Create the explicit Order Doc with full delivery info
         const meta = session.metadata || {};
         const customFields = (session as any).custom_fields || [];
         const cardMessage = customFields.find((f: any) => f.key === 'card_message')?.text?.value || '';

         const orderRef = adminDb.collection("orders").doc();
         t.set(orderRef, {
            stripe_session_id: session.id,
            source: 'online',
            customer_name: session.customer_details?.name || 'Unknown',
            customer_email: session.customer_details?.email || '',
            customer_phone: (session as any).customer_details?.phone || session.customer_details?.phone || '',
            shipping_address: addr ? {
               line1: addr.line1 || '',
               line2: addr.line2 || '',
               city: addr.city || '',
               state: addr.state || '',
               zip: addr.postal_code || '',
               country: addr.country || 'US',
            } : null,
            delivery_method: meta.delivery_method || 'ship',
            delivery_notes: meta.delivery_notes || '',
            card_message: cardMessage,
            is_business: meta.is_business === 'true',
            business_name: meta.business_name || '',
            occasion: meta.occasion || '',
            items: itemsParsed.map((i: any) => ({
              variety_id: i.id, name: i.n, quantity: i.q, unit_price: i.p
            })),
            subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
            shipping_cost: session.total_details?.amount_shipping ? session.total_details.amount_shipping / 100 : 0,
            tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
            total: session.amount_total ? session.amount_total / 100 : 0,
            status: 'pending',
            created_at: admin.firestore.FieldValue.serverTimestamp()
         });
      });

      // 2. Alert Admins 
      // Execute Cloud Messaging payload or logging internally
      console.log(`Successfully mapped checkout ${session.id} resolving order atomically.`);

    } catch (txnErr) {
       console.error("Transaction collision or missing bounds:", txnErr);
       return NextResponse.json({ error: "Failed to decrement bounds atomically." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
