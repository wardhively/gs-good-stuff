import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: "2024-04-10" as any,
  });
  try {
    const body = await req.json();
    const { items, shipping } = body;

    // Optional: Re-validate inventory securely on backend before pushing into Stripe
    // If we wanted exact race-condition guards here, we could check AdminDB natively, 
    // but the final atomic transaction occurs during the Webhook execution anyway.
    
    // Construct Stripe Line Items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.photo_url ? [item.photo_url] : [],
          metadata: { variety_id: item.variety_id },
        },
        unit_amount: Math.round(item.unit_price * 100), // convert to cents natively
      },
      quantity: item.quantity,
    }));

    // Construct Shipping Cost dynamically
    const shippingOptions = shipping === 0 ? [] : [
      {
         shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Math.round(shipping * 100), currency: 'usd' },
            display_name: 'Flat Rate Shipping',
         }
      }
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      automatic_tax: { enabled: true },
      shipping_options: shippingOptions as any,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart?canceled=true`,
      metadata: {
        raw_items: JSON.stringify(items.map((i: any) => ({ id: i.variety_id, q: i.quantity, n: i.name, p: i.unit_price })))
      },
      shipping_address_collection: { allowed_countries: ['US'] }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Session Error", err);
    return NextResponse.json({ error: "Checkout error" }, { status: 500 });
  }
}
