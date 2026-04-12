"use client";

import { useCart } from "@/lib/cart";
import { Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const shipping = cartTotal >= 150 || cartTotal === 0 ? 0 : 9.45;
  const orderTotal = cartTotal + shipping;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shipping }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initialize secure checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Encountered unknown checkout exception mapping paths locally.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-bitter text-3xl font-bold text-root mb-4">Your cart is empty</h2>
        <p className="font-dm-sans text-stone-c mb-8">Ready to add spectacular color to your garden?</p>
        <Link href="/shop" className="bg-soil text-white px-8 py-4 rounded-xl font-bold hover:bg-root transition-colors shadow-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Cart Line Items */}
        <div className="flex-1">
          <h1 className="font-bitter text-3xl font-bold text-root mb-8 border-b border-fence-lt pb-4">Shopping Cart</h1>
          
          <div className="flex flex-col gap-6">
            {items.map(item => (
              <div key={item.variety_id} className="flex gap-4 md:gap-6 items-center bg-white p-4 rounded-2xl border border-fence-lt shadow-sm">
                
                <div className="w-20 h-20 bg-linen rounded-xl overflow-hidden shrink-0">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-fence-lt" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${item.variety_id}`} className="font-bold text-root hover:text-petal text-lg truncate block">
                    {item.name}
                  </Link>
                  <p className="text-stone-c text-sm font-dm-sans">${item.unit_price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center border border-fence rounded-lg overflow-hidden bg-cream shrink-0">
                  <button onClick={() => updateQuantity(item.variety_id, item.quantity - 1)} className="px-3 py-2 text-stone-c font-bold hover:bg-linen">-</button>
                  <span className="w-8 text-center text-sm font-bold text-root">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variety_id, item.quantity + 1)} className="px-3 py-2 text-stone-c font-bold hover:bg-linen">+</button>
                </div>

                <div className="text-right shrink-0 min-w-[70px]">
                  <p className="font-bold text-root">${(item.quantity * item.unit_price).toFixed(2)}</p>
                </div>

                <button onClick={() => removeFromCart(item.variety_id)} className="p-2 text-stone-c hover:text-frost hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[350px] shrink-0">
          <div className="bg-linen p-6 rounded-2xl border border-fence-lt shadow-sm sticky top-24">
            <h2 className="font-bitter text-xl font-bold text-root mb-6">Order Summary</h2>
            
            <div className="space-y-4 font-dm-sans text-sm mb-6 pb-6 border-b border-fence-lt">
              <div className="flex justify-between items-center">
                <span className="text-stone-c">Subtotal</span>
                <span className="font-bold text-root">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-c">Flat Rate Shipping</span>
                <span className="font-bold text-root">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg mb-8">
              <span className="font-bold text-root">Total</span>
              <span className="font-bitter font-bold text-root">${orderTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout} disabled={isCheckingOut}
              className="w-full py-4 bg-soil text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-root transition-all shadow-sm disabled:opacity-50"
            >
              {isCheckingOut ? 'Securing Session...' : 'Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
            </button>

            {shipping > 0 && (
               <p className="text-[10px] text-center mt-4 text-stone-c uppercase tracking-widest font-bold">
                 Spend ${(150 - cartTotal).toFixed(2)} more for Free Shipping
               </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
