"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import Link from "next/link";
import { Leaf } from "lucide-react";
import type { JournalEntry } from "@/lib/types";

export default function BlogListingPage() {
  const [posts, setPosts] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublic() {
      try {
        const q = query(
          collection(db, "journal_entries"),
          where("is_public", "==", true),
          orderBy("created_at", "desc")
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as JournalEntry));
        setPosts(results);
      } catch (err) {
        console.error("Failed blog fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublic();
  }, []);

  return (
    <div className="bg-cream min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
           <Leaf className="w-10 h-10 text-leaf mx-auto mb-4" />
           <h1 className="font-bitter text-4xl md:text-5xl font-bold text-root mb-4">The Growing Guide</h1>
           <p className="font-dm-sans text-stone-c max-w-lg mx-auto">Field notes, seasonal observations, and masterclass instructions directly from the farm.</p>
        </div>

        {loading ? (
           <div className="space-y-8 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-[250px] bg-linen rounded-2xl border border-fence-lt"></div>)}
           </div>
        ) : posts.length === 0 ? (
           <div className="text-center py-24 bg-white rounded-2xl border border-fence-lt shadow-sm">
              <p className="font-dm-sans text-stone-c mb-4">No public dispatches yet. We're busy out in the field!</p>
              <Link href="/shop" className="text-leaf font-bold hover:text-leaf-dk transition-colors">Return to Shop</Link>
           </div>
        ) : (
           <div className="space-y-8">
              {posts.map(post => (
                 <Link href={`/blog/${post.id}`} key={post.id} className="group block bg-white rounded-2xl border border-fence-lt shadow-sm hover:shadow-lg hover:border-soil transition-all overflow-hidden">
                    <div className="flex flex-col md:flex-row h-full">
                       {post.photo_urls?.[0] && (
                          <div className="w-full md:w-1/3 aspect-video md:aspect-auto shrink-0 bg-linen">
                             <img src={post.photo_urls[0]} alt="Post Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                       )}
                       <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                          <div className="flex items-center gap-3 mb-3">
                             <span className="px-2 py-0.5 rounded-full bg-petal-lt text-petal font-bold text-[10px] uppercase tracking-widest">{post.category}</span>
                             <span className="text-xs text-stone-c font-dm-sans">
                                {post.created_at ? format(new Date(post.created_at.seconds * 1000), 'MMM d, yyyy') : ''}
                             </span>
                          </div>
                          
                          <h2 className="font-bitter text-2xl font-bold text-root mb-3 group-hover:text-petal transition-colors">
                            {post.public_title || post.title}
                          </h2>
                          
                          <p className="font-dm-sans text-stone-c text-sm line-clamp-3 mb-4 leading-relaxed">
                             {(post.public_body || post.body).substring(0, 200)}...
                          </p>

                          <div className="mt-auto pt-4 border-t border-fence-lt flex justify-between items-center text-xs font-bold font-dm-sans text-stone-c">
                             <span>By {post.author}</span>
                             <span className="text-petal group-hover:translate-x-1 transition-transform">Read Story &rarr;</span>
                          </div>
                       </div>
                    </div>
                 </Link>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
