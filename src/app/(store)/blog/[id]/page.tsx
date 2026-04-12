import { adminDb } from "@/lib/firebase-admin";
import type { JournalEntry, Variety } from "@/lib/types";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Cloud, ArrowRight, Share } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params;
    const docSnap = await adminDb.collection("journal_entries").doc(id).get();
    if (!docSnap.exists) return { title: "Post Not Found" };
    const post = docSnap.data() as JournalEntry;
    if (!post.is_public) return { title: "Private Post" };

    const bodyText = post.public_body || post.body;
    return {
      title: `${post.public_title || post.title} | G&S Good Stuff`,
      description: bodyText.substring(0, 160).trim() + "...",
      openGraph: {
        images: post.photo_urls?.[0] ? [post.photo_urls[0]] : [],
      }
    };
  } catch (err) {
    return { title: "Blog Post" };
  }
}

// Client Share component securely wrapping navigator calls safely escaping SSR loops natively
function NativeShare({ title }: { title: string }) {
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback
      alert("Sharing is not supported on this browser natively.");
    }
  };

  return (
    <button onClick={handleShare} className="px-6 py-2.5 bg-white border border-fence-lt shadow-sm rounded-full font-bold text-root text-sm flex items-center gap-2 hover:border-soil transition-colors">
      <Share className="w-4 h-4"/> Share Story
    </button>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const docSnap = await adminDb.collection("journal_entries").doc(id).get();
  if (!docSnap.exists) notFound();

  const post = docSnap.data() as JournalEntry;
  if (!post.is_public) notFound(); // Strictly reject private links publicly

  // Render cross-linked variables robustly pulling adminDb trees
  let linkedVarieties: any[] = [];
  if (post.variety_ids && post.variety_ids.length > 0) {
      const vSnaps = await Promise.all(post.variety_ids.map(id => adminDb.collection("varieties").doc(id).get()));
      linkedVarieties = vSnaps.filter(s => s.exists).map(s => ({ ...s.data(), id: s.id }));
  }

  const title = post.public_title || post.title;
  const bodyText = post.public_body || post.body;
  const dateObj = post.created_at ? new Date(post.created_at.seconds * 1000) : new Date();

  return (
    <div className="bg-cream min-h-screen pb-24">
      {/* Hero Header */}
      <div className="bg-root pt-32 pb-16 px-6 text-center text-linen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-root/80 to-transparent z-10" />
        {post.photo_urls?.[0] && (
           <img src={post.photo_urls[0]} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none" />
        )}
        
        <div className="relative z-20 max-w-3xl mx-auto">
          <span className="bg-petal/20 text-petal-lt px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-petal/30 mb-6 inline-block">
             {post.category}
          </span>
          <h1 className="font-bitter text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">{title}</h1>
          <p className="font-dm-sans font-bold text-linen/70 uppercase tracking-widest text-xs">
             {format(dateObj, 'MMMM d, yyyy')} • By {post.author}
          </p>
        </div>
      </div>

      {post.weather_snapshot && (
         <div className="max-w-2xl mx-auto mt-[-24px] relative z-30">
            <div className="mx-6 md:mx-0 bg-white p-4 rounded-xl shadow-lg border border-fence-lt flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Cloud className="w-8 h-8 text-creek" />
                  <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-stone-c tracking-widest">Recorded Conditions</span>
                     <span className="font-bold text-root text-sm capitalize">{post.weather_snapshot.conditions}</span>
                  </div>
               </div>
               <div className="flex gap-4 text-xs font-bold text-root font-dm-sans text-right">
                  <span>H: {post.weather_snapshot.temp_hi}°</span>
                  <span>L: {post.weather_snapshot.temp_lo}°</span>
                  <span className="text-creek border-l border-fence-lt pl-4">Rain: {post.weather_snapshot.precip}"</span>
               </div>
            </div>
         </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="prose prose-stone prose-lg prose-headings:font-bitter prose-headings:text-root prose-a:text-petal hover:prose-a:text-petal-dk font-dm-sans text-stone-800">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyText}</ReactMarkdown>
        </div>

        {/* Supplementary Photo Gallery if > 1 photo */}
        {post.photo_urls && post.photo_urls.length > 1 && (
           <div className="mt-16 grid grid-cols-2 gap-4">
              {post.photo_urls.slice(1).map((url, idx) => (
                 <img key={idx} src={url} alt={`Gallery ${idx}`} className="w-full h-48 object-cover rounded-xl border border-fence shadow-sm" />
              ))}
           </div>
        )}

        <div className="mt-16 pt-8 border-t border-fence flex justify-center">
          <NativeShare title={title} />
        </div>
      </div>

      {/* Recommended Variables / Farm Connections */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
         <div className="bg-linen p-8 md:p-12 rounded-3xl border border-fence-lt text-center shadow-sm">
            <h3 className="font-bitter text-3xl font-bold text-root mb-4">Grown with Intention</h3>
            <p className="font-dm-sans text-stone-c max-w-lg mx-auto mb-8">We carefully document the lifecycle of our tubers so you know exactly what is blooming in your yard.</p>
            
            {linkedVarieties.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                  {linkedVarieties.map((v) => (
                     <Link href={`/shop/${v.id}`} key={v.id} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-fence hover:border-soil transition-colors">
                        <div className="w-16 h-16 bg-cream rounded-lg overflow-hidden shrink-0">
                           {v.photo_urls?.[0] && <img src={v.photo_urls[0]} alt={v.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                           <p className="font-bold text-root">{v.name}</p>
                           <p className="text-xs text-stone-c font-dm-sans uppercase tracking-widest">{v.bloom_form}</p>
                        </div>
                     </Link>
                  ))}
               </div>
            )}
            
            <Link href="/shop" className="inline-flex items-center gap-2 bg-leaf text-white px-8 py-4 rounded-xl font-bold shadow-sm hover:bg-leaf-dk transition-colors">
              Explore Our Catalog <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
      </div>

    </div>
  );
}
