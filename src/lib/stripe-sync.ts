/**
 * Syncs varieties to the Stripe products collection in Firestore.
 * The Firebase Stripe Extension reads from the `products` collection
 * and automatically creates/updates Stripe products and prices.
 */

import { doc, setDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Variety } from "./types";

/**
 * Sync a variety to the Stripe products collection.
 * Call this when a variety is listed (status === 'listed') or updated.
 */
export async function syncVarietyToStripe(variety: Variety) {
  if (variety.status !== 'listed' || variety.count <= 0) {
    // Remove from Stripe products if not listed or out of stock
    await removeVarietyFromStripe(variety.id);
    return;
  }

  const productRef = doc(db, 'products', variety.id);

  // Create/update the product doc (Stripe Extension reads this)
  await setDoc(productRef, {
    name: variety.name,
    description: [
      variety.bloom_form,
      variety.bloom_size,
      variety.height,
      variety.season ? `${variety.season} season` : null,
    ].filter(Boolean).join(' · '),
    active: true,
    metadata: {
      variety_id: variety.id,
      zone_id: variety.zone_id || '',
      bloom_form: variety.bloom_form || '',
      bloom_size: variety.bloom_size || '',
      color_hex: variety.color_hex || '',
      stock: String(variety.count),
    },
    ...(variety.photo_urls?.[0] ? { images: [variety.photo_urls[0]] } : {}),
  }, { merge: true });

  // Create/update the price as a sub-collection doc
  // The extension expects prices in a `prices` subcollection
  const priceRef = doc(db, 'products', variety.id, 'prices', 'default');
  await setDoc(priceRef, {
    unit_amount: Math.round((variety.price || 0) * 100), // cents
    currency: 'usd',
    active: true,
    type: 'one_time',
    metadata: {
      variety_id: variety.id,
    },
  }, { merge: true });
}

/**
 * Remove a variety from the Stripe products collection.
 * Call when a variety is unlisted, sold out, or deleted.
 */
export async function removeVarietyFromStripe(varietyId: string) {
  try {
    // Delete prices subcollection first
    const pricesRef = collection(db, 'products', varietyId, 'prices');
    const pricesSnap = await getDocs(pricesRef);
    for (const priceDoc of pricesSnap.docs) {
      await deleteDoc(priceDoc.ref);
    }
    // Mark product as inactive (don't delete — Stripe may still reference it)
    const productRef = doc(db, 'products', varietyId);
    await setDoc(productRef, { active: false }, { merge: true });
  } catch {
    // Silently fail — product may not exist
  }
}

/**
 * Sync ALL listed varieties to Stripe.
 * Call once to bootstrap, or periodically to ensure consistency.
 */
export async function syncAllVarietiesToStripe(varieties: Variety[]) {
  const listed = varieties.filter(v => v.status === 'listed' && v.count > 0);
  for (const v of listed) {
    await syncVarietyToStripe(v);
  }
}
