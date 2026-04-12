"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Sun, MapPin, Flower2, Snowflake, Heart, Scissors, Church, Gift, Sprout, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Variety } from "@/lib/types";

export default function StorefrontHome() {
  const scrollRef = useScrollReveal();
  const [featured, setFeatured] = useState<Variety[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const q = query(collection(db, "varieties"), where("status", "==", "listed"), where("count", ">", 0), limit(4));
        const snap = await getDocs(q);
        setFeatured(snap.docs.map(d => ({ ...d.data(), id: d.id } as Variety)));
      } catch {}
    }
    loadFeatured();
  }, []);

  return (
    <div ref={scrollRef}>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-root">
        <div className="absolute inset-0 bg-gradient-to-b from-root via-soil/90 to-root" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #C17F4E 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="animate-fade-up inline-flex items-center gap-2 bg-petal/20 border border-petal/30 text-petal-lt px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
            <Leaf className="w-3 h-3" /> Addison, NY · Zone 5b
          </div>

          <h1 className="animate-fade-up-delay-1 font-bitter text-5xl md:text-7xl font-bold text-linen leading-[1.1] mb-6">
            Farm Fresh<br />
            <span className="text-petal">Dahlia Tubers</span>
          </h1>

          <p className="animate-fade-up-delay-2 text-lg md:text-xl text-fence/70 font-dm-sans max-w-lg mx-auto mb-10 leading-relaxed">
            Grown with intention on 16 acres in the Canisteo River valley. Premium varieties, hand-divided, shipped to your door.
          </p>

          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="group inline-flex items-center gap-3 bg-petal text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-petal/90 hover:shadow-xl transition-all active:scale-95">
              Shop Tubers
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 text-linen/60 hover:text-linen px-6 py-4 font-dm-sans font-medium transition-colors">
              Our Story
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-linen/30 flex justify-center pt-2">
            <div className="w-1 h-2.5 bg-linen/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-cream border-y border-fence-lt">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          {[
            { icon: Sun, text: "16 Acres, Full Sun" },
            { icon: Snowflake, text: "Zone 5b Hardened" },
            { icon: Heart, text: "Hand Divided" },
            { icon: MapPin, text: "Ships Nationwide" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-stone-c text-sm font-dm-sans font-medium">
              <Icon className="w-4 h-4 text-petal" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Varieties */}
      {featured.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 reveal">
              <span className="text-xs font-bold uppercase tracking-widest text-petal font-dm-sans">From the Field</span>
              <h2 className="font-bitter text-4xl font-bold text-root mt-2">Featured Varieties</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((v, i) => (
                <Link href={`/shop/${v.id}`} key={v.id} className={`reveal reveal-delay-${i + 1} group card-hover rounded-2xl overflow-hidden bg-linen border border-fence-lt`}>
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {v.photo_urls?.[0] ? (
                      <img src={v.photo_urls[0]} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: v.color_hex || '#F3ECE2' }}>
                        <Flower2 className="w-16 h-16 text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-root/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-petal text-white px-4 py-2 rounded-full text-sm font-bold">View Details</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-root/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                      ${v.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bitter font-bold text-root text-lg">{v.name}</h3>
                    <p className="text-xs text-stone-c font-dm-sans mt-1">{v.bloom_form} · {v.bloom_size}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12 reveal">
              <Link href="/shop" className="group inline-flex items-center gap-2 bg-soil text-white px-8 py-3.5 rounded-full font-bold hover:bg-root hover:shadow-lg transition-all active:scale-95">
                View All Varieties <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Who Grows With Us */}
      <section className="py-20 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-creek font-dm-sans">Who Grows With Us</span>
            <h2 className="font-bitter text-4xl font-bold text-root mt-2">Perfect For Every Occasion</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Flower2, title: "Wedding & Event Florists", desc: "Dinner-plate blooms in every color for your biggest day. We grow the show-stopping varieties that elevate bouquets, centerpieces, and arches. Bulk pricing available.", cta: "Plan Your Wedding Blooms" },
              { icon: Sprout, title: "Home Gardeners", desc: "Whether you're planting your first dahlia or your hundredth, our Zone 5b-hardened tubers arrive ready to thrive. We include growing tips with every order.", cta: "Start Your Garden" },
              { icon: Gift, title: "Gift Givers", desc: "Mother's Day, Easter, birthdays, housewarmings — a dahlia tuber is a gift that blooms all summer long. Beautifully packed and shipped with a care card.", cta: "Send a Living Gift" },
            ].map((item, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1} bg-linen rounded-2xl p-8 border border-fence-lt card-hover text-center`}>
                <div className="w-12 h-12 rounded-full bg-petal/10 flex items-center justify-center mx-auto mb-4"><item.icon className="w-6 h-6 text-petal" /></div>
                <h3 className="font-bitter text-xl font-bold text-root mb-3">{item.title}</h3>
                <p className="text-sm text-stone-c font-dm-sans leading-relaxed mb-6">{item.desc}</p>
                <Link href="/shop" className="text-petal font-bold text-sm hover:text-soil transition-colors inline-flex items-center gap-1">
                  {item.cta} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {[
              { icon: Scissors, title: "Cut Flower Farmers", desc: "High-yield varieties bred for vase life and stem length. We track division yields so you know exactly what to expect. Wholesale pricing for orders of 50+." },
              { icon: Users, title: "Churches & Garden Clubs", desc: "Group orders for communal gardens, Easter displays, and fundraiser plant sales. We'll work with your timeline and budget." },
            ].map((item, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1} bg-linen rounded-2xl p-8 border border-fence-lt card-hover flex gap-6 items-start`}>
                <div className="w-10 h-10 rounded-full bg-creek/10 flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5 text-creek" /></div>
                <div>
                  <h3 className="font-bitter text-lg font-bold text-root mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-c font-dm-sans leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-soil/5 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center reveal">
          <Flower2 className="w-10 h-10 text-petal mx-auto mb-6" />
          <h2 className="font-bitter text-3xl md:text-4xl font-bold text-root mb-6 leading-tight">
            From Our Hands<br />to Your Garden
          </h2>
          <p className="text-lg text-stone-c font-dm-sans leading-relaxed max-w-2xl mx-auto mb-8">
            Every tuber is hand-divided, inspected, and packed with care. We grow because we love it — and we want you to love it too. Our 5-year mission: scale from 100 to 80,000 tubers while keeping the personal touch.
          </p>
          <Link href="/about" className="group inline-flex items-center gap-2 text-petal font-bold hover:text-soil transition-colors">
            Read Our Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Growing Guide CTA */}
      <section className="py-20 px-6 reveal">
        <div className="max-w-5xl mx-auto bg-root rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #C17F4E 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10 p-10 md:p-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-petal font-dm-sans">From the Field</span>
            <h2 className="font-bitter text-3xl md:text-4xl font-bold text-linen mt-2 mb-4">Growing Guide</h2>
            <p className="text-fence/60 font-dm-sans max-w-lg mx-auto mb-8">Tips, tricks, and field notes from our daily work with dahlias.</p>
            <Link href="/blog" className="group inline-flex items-center gap-2 bg-petal text-white px-8 py-3.5 rounded-full font-bold hover:bg-petal/90 hover:shadow-lg transition-all active:scale-95">
              Read the Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
