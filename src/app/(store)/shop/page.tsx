"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Filter } from "lucide-react";
import { collection, query, where, getDocs, orderBy as fsOrderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/lib/cart";
import type { Variety } from "@/lib/types";

export default function ShopPage() {
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
        const q = query(
          collection(db, "varieties"),
          where("status", "==", "listed"),
          where("count", ">", 0)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Variety));
        
        setVarieties(results);
        
        // Extract unique forms
        const forms = new Set<string>();
        results.forEach(r => { if(r.bloom_form) forms.add(r.bloom_form) });
        setAvailableForms(Array.from(forms).sort());
      } catch (err) {
        console.error("Public fetch failed:", err);
      }
      setLoading(false);
    }
    loadCatalog();
  }, []);

  const sortedAndFiltered = varieties
    .filter(v => filterForm === 'All' || v.bloom_form === filterForm)
    .sort((a, b) => {
      if (sortParam === 'name') return a.name.localeCompare(b.name);
      if (sortParam === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortParam === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-fence-lt pb-6">
           <div>
             <h1 className="font-bitter text-4xl font-bold text-root mb-2">Tuber Catalog</h1>
             <p className="font-dm-sans text-stone-c">Guaranteed viable with visible eyes.</p>
           </div>
           
           <div className="flex items-center gap-4 mt-6 md:mt-0 font-dm-sans">
              <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-stone-c" />
                 <select 
                   value={filterForm} onChange={e => setFilterForm(e.target.value)}
                   className="bg-transparent border-none text-root font-bold focus:ring-0 cursor-pointer"
                 >
                   <option value="All">All Forms</option>
                   {availableForms.map(f => <option key={f} value={f}>{f}</option>)}
                 </select>
              </div>
              <div className="h-6 w-px bg-fence-lt"></div>
              <select 
                 value={sortParam} onChange={e => setSortParam(e.target.value as any)}
                 className="bg-transparent border-none text-root font-bold focus:ring-0 cursor-pointer pr-8"
              >
                 <option value="name">Sort by Name</option>
                 <option value="price_asc">Price: Low to High</option>
                 <option value="price_desc">Price: High to Low</option>
              </select>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-linen rounded-2xl border border-fence-lt" />)}
          </div>
        ) : sortedAndFiltered.length === 0 ? (
          <div className="text-center py-24 text-stone-c font-dm-sans">
             No listed tubers found matching these filters. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedAndFiltered.map(v => (
              <div key={v.id} className="group bg-white rounded-2xl border border-fence-lt overflow-hidden shadow-sm hover:shadow-lg hover:border-soil transition-all flex flex-col h-full">
                 <Link href={`/shop/${v.id}`} className="block relative aspect-square bg-linen">
                   {v.photo_urls?.[0] ? (
                     <img src={v.photo_urls[0]} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full" style={{ backgroundColor: v.color_hex || '#EAE8E3' }} />
                   )}
                 </Link>
                 
                 <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <Link href={`/shop/${v.id}`} className="font-bold text-root text-lg hover:text-petal transition-colors">
                        {v.name}
                      </Link>
                      <span className="font-bold text-root">${(v.price || 0).toFixed(2)}</span>
                    </div>
                    
                    <p className="text-xs text-stone-c font-dm-sans mb-4 uppercase tracking-widest leading-relaxed">
                      {v.bloom_form} • {v.bloom_size}
                    </p>
                    
                    <div className="mt-auto">
                       <button 
                         onClick={() => addToCart({ variety_id: v.id, name: v.name, quantity: 1, unit_price: v.price || 0, photo_url: v.photo_urls?.[0] })}
                         className="w-full py-3 bg-soil text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-root active:scale-95 transition-all shadow-sm"
                       >
                         <ShoppingBag className="w-4 h-4" /> Add to Cart
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
