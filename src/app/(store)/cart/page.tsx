"use client";

import { useCart } from "@/lib/cart";
import { Trash2, ArrowRight, Truck, MapPin, Store, Gift, Building, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Delivery options
  const [deliveryMethod, setDeliveryMethod] = useState<'ship' | 'local_delivery' | 'pickup'>('ship');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isBusiness, setIsBusiness] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [occasion, setOccasion] = useState('');

  const shipping = deliveryMethod === 'pickup' ? 0 : cartTotal >= 150 || cartTotal === 0 ? 0 : 9.45;
  const orderTotal = cartTotal + shipping;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping,
          delivery_method: deliveryMethod,
          delivery_notes: deliveryNotes,
          is_business: isBusiness,
          business_name: businessName,
          occasion: occasion,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initialize checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout error. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-bitter text-3xl font-bold text-root mb-4">Your cart is empty</h2>
        <p className="font-dm-sans text-stone-c mb-8">Ready to brighten someone's day with farm-fresh dahlias?</p>
        <Link href="/shop" className="bg-soil text-white px-8 py-4 rounded-xl font-bold hover:bg-root transition-colors shadow-sm">
          Browse Blooms
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">

        {/* Left Column: Cart + Delivery */}
        <div className="flex-1">
          <h1 className="font-bitter text-3xl font-bold text-root mb-8 border-b border-fence-lt pb-4">Shopping Cart</h1>

          {/* Cart Items */}
          <div className="flex flex-col gap-4 mb-10">
            {items.map(item => (
              <div key={item.variety_id} className="flex gap-4 items-center bg-linen p-4 rounded-2xl border border-fence-lt">
                <div className="w-16 h-16 bg-clay rounded-xl overflow-hidden shrink-0">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full bg-fence-lt" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-root truncate">{item.name}</p>
                  <p className="text-xs text-stone-c font-dm-sans">${item.unit_price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center border border-fence rounded-full overflow-hidden bg-cream shrink-0">
                  <button onClick={() => updateQuantity(item.variety_id, item.quantity - 1)} className="px-3 py-1.5 text-stone-c font-bold hover:bg-clay">-</button>
                  <span className="w-6 text-center text-sm font-bold text-root">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variety_id, item.quantity + 1)} className="px-3 py-1.5 text-stone-c font-bold hover:bg-clay">+</button>
                </div>
                <span className="font-bold text-root min-w-[60px] text-right">${(item.quantity * item.unit_price).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.variety_id)} className="p-2 text-ash hover:text-frost transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Delivery Options */}
          <div className="bg-linen rounded-2xl border border-fence-lt p-6 mb-6">
            <h2 className="font-bitter text-lg font-bold text-root mb-4">How would you like to receive your flowers?</h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {([
                { value: 'ship', label: 'Ship to Me', icon: Truck, desc: 'USPS Priority Mail' },
                { value: 'local_delivery', label: 'Local Delivery', icon: MapPin, desc: 'Addison area' },
                { value: 'pickup', label: 'Farm Pickup', icon: Store, desc: 'Free · Schedule time' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDeliveryMethod(opt.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    deliveryMethod === opt.value
                      ? 'border-petal bg-petal/5'
                      : 'border-fence-lt bg-white hover:border-fence'
                  }`}
                >
                  <opt.icon className={`w-5 h-5 mx-auto mb-2 ${deliveryMethod === opt.value ? 'text-petal' : 'text-stone-c'}`} />
                  <p className="text-sm font-bold text-root">{opt.label}</p>
                  <p className="text-[10px] text-stone-c mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Is this for a business? */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsBusiness(!isBusiness)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isBusiness ? 'bg-petal border-petal text-white' : 'border-fence bg-white'}`}
              >
                {isBusiness && <Building className="w-3 h-3" />}
              </button>
              <span className="text-sm font-dm-sans text-root">This is for a business (venue, church, florist, etc.)</span>
            </div>

            {isBusiness && (
              <div className="mb-4">
                <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Business Name</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Hilltop Wedding Venue" className="w-full px-3 py-2 rounded-lg border border-fence bg-white text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
              </div>
            )}

            {/* Occasion */}
            <div className="mb-4">
              <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">What's the occasion? (optional)</label>
              <div className="flex flex-wrap gap-2">
                {['', 'Wedding', 'Birthday', "Mother's Day", 'Anniversary', 'Sympathy', 'Just Because', 'Event'].map(occ => (
                  <button
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      occasion === occ ? 'bg-petal text-white' : 'bg-white border border-fence text-stone-c hover:border-petal'
                    }`}
                  >
                    {occ || 'None'}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Delivery Instructions (optional)</label>
              <textarea
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
                rows={2}
                placeholder="Gate code, leave at side door, call on arrival, etc."
                className="w-full px-3 py-2 rounded-lg border border-fence bg-white text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[340px] shrink-0">
          <div className="bg-linen p-6 rounded-2xl border border-fence-lt shadow-sm sticky top-20">
            <h2 className="font-bitter text-lg font-bold text-root mb-6">Order Summary</h2>

            <div className="space-y-3 font-dm-sans text-sm mb-6 pb-6 border-b border-fence-lt">
              <div className="flex justify-between">
                <span className="text-stone-c">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-root">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-c">
                  {deliveryMethod === 'pickup' ? 'Farm Pickup' : deliveryMethod === 'local_delivery' ? 'Local Delivery' : 'Shipping'}
                </span>
                <span className="font-bold text-root">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-[10px] text-ash">
                <span>Tax calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-root text-lg">Estimated Total</span>
              <span className="font-bitter font-bold text-root text-xl">${orderTotal.toFixed(2)}</span>
            </div>

            {occasion && (
              <div className="bg-petal-lt/50 rounded-lg p-3 mb-4 text-xs text-root font-dm-sans flex items-center gap-2">
                <Gift className="w-4 h-4 text-petal flex-shrink-0" />
                Occasion: <strong>{occasion}</strong>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-4 bg-soil text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-root transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
            >
              {isCheckingOut ? 'Securing Session...' : 'Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
            </button>

            {shipping > 0 && (
              <div className="mt-4">
                <div className="h-1.5 bg-clay rounded-full overflow-hidden">
                  <div className="h-full bg-leaf rounded-full transition-all" style={{ width: `${Math.min(100, (cartTotal / 150) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-center mt-2 text-stone-c uppercase tracking-widest font-bold">
                  ${(150 - cartTotal).toFixed(2)} more for free shipping
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
