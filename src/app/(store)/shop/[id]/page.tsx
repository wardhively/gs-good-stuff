import { getDocRest } from "@/lib/firestore-rest";
import type { Variety } from "@/lib/types";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params;
    const variety = await getDocRest("varieties", id);
    if (!variety) return { title: "Variety Not Found" };

    return {
      title: `${variety.name} | G&S Good Stuff`,
      description: `Shop ${variety.name} dahlias. ${variety.bloom_form} · ${variety.bloom_size}.`,
      openGraph: {
        images: variety.photo_urls?.[variety.cover_photo_index || 0] ? [variety.photo_urls[variety.cover_photo_index || 0]] : [],
      }
    };
  } catch {
    return { title: "Dahlia Tuber" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const variety = await getDocRest("varieties", id);
  if (!variety) notFound();

  return (
    <div className="bg-cream min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <ProductDetailClient variety={variety as Variety} />
      </div>
    </div>
  );
}
