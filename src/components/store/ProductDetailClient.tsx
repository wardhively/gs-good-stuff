"use client";

import { useState } from "react";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { Variety } from "@/lib/types";

export default function ProductDetailClient({ variety }: { variety: Variety }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  
  const inStock = variety.count > 0 && variety.status === 'listed';

  return (
    <div className="flex flex-col md:flex-row gap-12 bg-white rounded-2xl border border-fence-lt shadow-sm p-6 md:p-12 overflow-hidden">
      
      {/* Photo Gallery */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <Link href="/shop" className="text-stone-c hover:text-root mb-4 inline-flex items-center gap-2 font-bold transition-colors">
          <ChevronLeft className="w-5 h-5"/> Back to Catalog
        </Link>
        <div className="w-full aspect-square bg-linen rounded-xl overflow-hidden border border-fence-lt">
           {variety.photo_urls?.[0] ? (
             <img src={variety.photo_urls[0]} alt={variety.name} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full" style={{ backgroundColor: variety.color_hex || '#EAE8E3' }} />
           )}
        </div>
      </div>

      {/* Details & Cart Trigger */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h1 className="font-bitter text-4xl md:text-5xl font-bold text-root mb-2">{variety.name}</h1>
        <p className="text-2xl font-bold text-root mb-6">${(variety.price || 0).toFixed(2)}</p>

        <div className="space-y-4 mb-8 font-dm-sans border-t border-b border-fence-lt py-6">
          <div className="flex justify-between items-center text-sm border-b border-fence-lt last:border-0 pb-2 mb-2">
             <span className="text-stone-c font-bold uppercase tracking-widest text-[10px]">Form</span>
             <span className="font-bold text-root">{variety.bloom_form || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-fence-lt last:border-0 pb-2 mb-2">
             <span className="text-stone-c font-bold uppercase tracking-widest text-[10px]">Size</span>
             <span className="font-bold text-root">{variety.bloom_size || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-fence-lt last:border-0 pb-2 mb-2">
             <span className="text-stone-c font-bold uppercase tracking-widest text-[10px]">Height</span>
             <span className="font-bold text-root">{variety.height || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-fence-lt last:border-0 pb-2 mb-2">
             <span className="text-stone-c font-bold uppercase tracking-widest text-[10px]">Season</span>
             <span className="font-bold text-root">{variety.season || 'N/A'}</span>
          </div>
        </div>

        <div className="font-dm-sans text-stone-c leading-relaxed mb-8">
           {variety.notes || 'A stunning dahlia cultivated carefully on our farm, guaranteed to provide striking blooms.'}
        </div>

        <div className="bg-linen p-6 rounded-xl border border-fence-lt mt-auto">
          {inStock ? (
            <>
               <div className="flex items-center gap-4 mb-6">
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-stone-c mb-1">Quantity</span>
                   <div className="flex items-center border border-fence rounded-lg bg-white overflow-hidden">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-stone-c hover:bg-linen font-bold transition-colors">-</button>
                      <span className="px-4 font-bold text-root min-w-[50px] text-center">{qty}</span>
                      <button onClick={() => setQty(Math.min(variety.count, qty + 1))} className="px-4 py-3 text-stone-c hover:bg-linen font-bold transition-colors">+</button>
                   </div>
                 </div>
                 <div className="flex flex-col pt-4">
                    <span className="text-xs text-leaf font-bold">{variety.count} Available</span>
                 </div>
               </div>

               <button 
                 onClick={() => addToCart({ variety_id: variety.id, name: variety.name, quantity: qty, unit_price: variety.price || 0, photo_url: variety.photo_urls?.[0] })}
                 className="w-full py-4 bg-soil text-white rounded-xl font-bold flex justify-center items-center gap-3 hover:bg-root active:scale-[0.98] transition-all shadow-sm text-lg"
               >
                 <ShoppingBag className="w-5 h-5" /> Add to Cart — ${(qty * (variety.price || 0)).toFixed(2)}
               </button>
            </>
          ) : (
            <div className="text-center py-4 font-bold text-frost">
               Currently Unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
