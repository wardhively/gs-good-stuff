"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Flower2 } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/lib/cart";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Variety } from "@/lib/types";

export default function ShopPage() {
  const scrollRef = useScrollReveal();
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortParam, setSortParam] = useState<'name' | 'price_asc' | 'price_desc'>('name');
  const [filterForm, setFilterForm] = useState<string>('All');
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const q = query(collection(db, "varieties"), where("status", "==", "listed"), where("count", ">", 0));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Variety));
        setVarieties(results);
        const forms = new Set<string>();
        results.forEach(r => { if (r.bloom_form) forms.add(r.bloom_form); });
        setAvailableForms(Array.from(forms).sort());
      } catch {}
      setLoading(false);
    }
    loadCatalog();
  }, []);

  const sorted = varieties
    .filter(v => filterForm === 'All' || v.bloom_form === filterForm)
    .sort((a, b) => {
      if (sortParam === 'name') return a.name.localeCompare(b.name);
      if (sortParam === 'price_asc') return (a.price || 0) - (b.price || 0);
      return (b.price || 0) - (a.price || 0);
    });

  return (
    <div ref={scrollRef} className="min-h-screen bg-cream">
      {/* Hero strip */}
      <div className="bg-root py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="animate-fade-up font-bitter text-4xl md:text-5xl font-bold text-linen mb-3">Tuber Catalog</h1>
          <p className="animate-fade-up-delay-1 font-dm-sans text-fence/60 text-lg">Every tuber guaranteed viable with visible eyes</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterForm('All')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterForm === 'All' ? 'bg-soil text-white' : 'bg-linen text-stone-c border border-fence hover:border-soil'}`}>
              All
            </button>
            {availableForms.map(f => (
              <button key={f} onClick={() => setFilterForm(f)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterForm === f ? 'bg-soil text-white' : 'bg-linen text-stone-c border border-fence hover:border-soil'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm font-dm-sans">
            <span className="text-stone-c">{sorted.length} varieties</span>
            <select value={sortParam} onChange={e => setSortParam(e.target.value as any)} className="bg-linen border border-fence rounded-lg px-3 py-2 text-root font-bold text-sm focus:outline-none focus:ring-2 focus:ring-petal">
              <option value="name">Name</option>
              <option value="price_asc">Price: Low</option>
              <option value="price_desc">Price: High</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-clay rounded-2xl mb-3" />
                <div className="h-5 bg-clay rounded w-2/3 mb-2" />
                <div className="h-4 bg-clay rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24">
            <Flower2 className="w-12 h-12 text-ash mx-auto mb-4" />
            <p className="font-bitter text-xl font-bold text-root mb-2">No varieties match your filters</p>
            <p className="text-stone-c font-dm-sans">Try selecting a different bloom form or check back soon for new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((v, i) => (
              <div key={v.id} className={`reveal reveal-delay-${(i % 3) + 1} group card-hover rounded-2xl overflow-hidden bg-linen border border-fence-lt`}>
                <Link href={`/shop/${v.id}`} className="block relative aspect-[3/4] overflow-hidden">
                  {v.photo_urls?.[0] ? (
                    <img src={v.photo_urls[0]} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: v.color_hex || '#F3ECE2' }}>
                      <Flower2 className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-root/70 via-root/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="bg-white text-root px-6 py-2.5 rounded-full font-bold text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                      View Details
                    </span>
                  </div>
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 bg-root/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold text-sm">
                    ${v.price}
                  </div>
                  {/* Low stock */}
                  {v.count <= 3 && (
                    <div className="absolute top-3 left-3 bg-frost/90 text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Only {v.count} left
                    </div>
                  )}
                </Link>

                <div className="p-5">
                  <Link href={`/shop/${v.id}`}>
                    <h3 className="font-bitter text-xl font-bold text-root group-hover:text-petal transition-colors">{v.name}</h3>
                  </Link>
                  <p className="text-xs text-stone-c font-dm-sans mt-1 uppercase tracking-widest">{v.bloom_form} · {v.bloom_size} · {v.height}</p>

                  <button
                    onClick={() => addToCart({ variety_id: v.id, name: v.name, quantity: 1, unit_price: v.price || 0, photo_url: v.photo_urls?.[0] })}
                    className="w-full mt-4 py-3 bg-soil text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-root active:scale-[0.98] transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
