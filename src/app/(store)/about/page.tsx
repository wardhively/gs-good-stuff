import { MapPin, Flower, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SOCIAL } from "@/lib/constants";

export const metadata = {
  title: "About G&S Good Stuff | Addison, NY",
  description: "Learn about Gary and Suzy's 16-acre dahlia farm in Addison, New York, expanding robustly towards massive production yields by 2030.",
};

export default function AboutPage() {
  return (
    <div className="bg-cream min-h-screen">
      
      {/* Hero */}
      <section className="bg-soil py-24 px-6 text-center text-linen relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
           <MapPin className="w-10 h-10 text-petal mb-6" />
           <h1 className="font-bitter text-5xl md:text-7xl font-bold mb-6">Our Roots</h1>
           <p className="font-dm-sans text-xl uppercase tracking-widest opacity-80 font-bold">Addison, New York · Zone 5b</p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
               <h2 className="font-bitter text-4xl font-bold text-root mb-6">Gary & Suzy</h2>
               <div className="font-dm-sans text-stone-800 space-y-4 leading-relaxed">
                  <p>Welcome to G&S Good Stuff. We operate a carefully curated 16-acre farm strictly dedicated to the propagation and distribution of premium Dahlia tubers.</p>
                  <p>Farming in Zone 5b comes with unique environmental bounds—our season is dictated strictly by the frost lines of mid-May and October. We lean into this cycle, aggressively optimizing our field operations using internal tooling to ensure every tuber lifted yields pristine viabilities.</p>
               </div>
            </div>
            <div className="aspect-square bg-linen rounded-3xl shadow-sm border border-fence overflow-hidden flex items-center justify-center p-8">
                {/* Photo placeholder */}
                <div className="text-stone-c text-center">
                   <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                   <p className="text-xs uppercase tracking-widest font-bold">Farm Photography Incoming</p>
                </div>
            </div>
         </div>

         <div className="bg-linen p-10 md:p-16 rounded-3xl border border-fence-lt text-center mb-24 shadow-sm relative overflow-hidden">
            <Flower className="absolute top-[-20px] right-[-20px] w-48 h-48 text-cream opacity-50" />
            <h2 className="font-bitter text-4xl font-bold text-root mb-6 relative z-10">Our 2030 Mission</h2>
            <p className="font-dm-sans text-stone-800 text-xl leading-relaxed relative z-10">
              We are scaling our operations methodically. From 100 meticulously sorted varieties this season, tracking directly towards shipping <strong className="text-leaf">80,000+</strong> individual tubers successfully reaching households across the continent by 2030.
            </p>
         </div>

         {/* Call to Actions & Links */}
         <div className="text-center pb-12">
            <h3 className="font-bitter text-2xl font-bold text-root mb-6">Join the Field Walk</h3>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
               {Object.entries(SOCIAL).map(([network, url]) => (
                  <a key={network} href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-fence shadow-sm rounded-full font-bold text-root hover:border-soil capitalize text-sm transition-colors">
                     {network}
                  </a>
               ))}
            </div>

            <Link href="/shop" className="inline-flex items-center gap-2 bg-soil text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-root transition-all shadow-md">
              Shop The Catalog <ArrowRight className="w-5 h-5"/>
            </Link>
         </div>

      </section>
    </div>
  );
}
