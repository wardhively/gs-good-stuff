import { adminDb } from "@/lib/firebase-admin";
import type { Variety } from "@/lib/types";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params;
    const docSnap = await adminDb.collection("varieties").doc(id).get();
    if (!docSnap.exists) return { title: "Variety Not Found" };
    
    const variety = docSnap.data() as Variety;
    return {
      title: `${variety.name} | G&S Good Stuff`,
      description: `Shop ${variety.name} dahlias. ${variety.bloom_form} · ${variety.bloom_size}.`,
      openGraph: {
        images: variety.photo_urls?.[0] ? [variety.photo_urls[0]] : [],
      }
    };
  } catch (err) {
    return { title: "Dahlia Tuber" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const docSnap = await adminDb.collection("varieties").doc(id).get();
  if (!docSnap.exists) {
    notFound();
  }

  // Flatten timestamps to string formats to pass via Server Component Props safely natively
  const data = docSnap.data();
  const variety = {
    ...data,
    id: docSnap.id,
    created_at: undefined,
    updated_at: undefined,
    planted_date: undefined,
    expected_dig_date: undefined,
    jugged_date: undefined,
    status_history: undefined
  } as unknown as Variety;

  return (
    <div className="bg-cream min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
         <ProductDetailClient variety={variety} />
      </div>
    </div>
  );
}
