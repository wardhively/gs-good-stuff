import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

export default function StorefrontHomePage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* HERO SECTION */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center bg-root overflow-hidden">
        {/* Placeholder background image gradient representing farm */}
        <div className="absolute inset-0 bg-gradient-to-br from-root to-soil opacity-90 z-0"></div>
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 z-0"></div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
          <Leaf className="w-12 h-12 text-leaf mb-6" />
          <h1 className="font-bitter text-5xl md:text-7xl font-bold text-linen mb-4 tracking-tight drop-shadow-lg">
            Farm Fresh Dahlia Tubers
          </h1>
          <p className="font-dm-sans text-lg md:text-xl text-linen/90 font-bold tracking-widest uppercase mb-10 border-b border-leaf/30 pb-4 inline-block">
            Addison, New York
          </p>
          <Link 
            href="/shop" 
            className="group bg-petal text-linen px-8 py-4 rounded-xl font-bold text-lg hover:bg-petal-dk transition-all shadow-xl flex items-center gap-3"
          >
            Shop All Tubers 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* FEATURED HIGHLIGHTS */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="font-bitter text-4xl font-bold text-root mb-2">Grown with Care</h2>
           <p className="font-dm-sans text-stone-c max-w-lg mx-auto">All our tubers are hand-dug, divided, and inspected on our operational farm. Shipped directly from climate-controlled storage when your planting zone allows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-linen p-8 rounded-2xl border border-fence text-center hover:border-soil transition-colors">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-fence-lt shadow-sm">
                 <Leaf className="w-8 h-8 text-leaf" />
              </div>
              <h3 className="font-bold text-root text-xl mb-2">Sustainable Practices</h3>
              <p className="text-sm text-stone-c font-dm-sans">We prioritize soil health and strictly monitor tools for disease prevention.</p>
           </div>
           <div className="bg-linen p-8 rounded-2xl border border-fence text-center hover:border-soil transition-colors">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-fence-lt shadow-sm">
                 <span className="font-bitter text-2xl font-bold text-petal">100+</span>
              </div>
              <h3 className="font-bold text-root text-xl mb-2">Curated Varieties</h3>
              <p className="text-sm text-stone-c font-dm-sans">From massive dinnerplates to perfect pompons, sorted explicitly by bloom standards.</p>
           </div>
           <div className="bg-linen p-8 rounded-2xl border border-fence text-center hover:border-soil transition-colors">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 border border-fence-lt shadow-sm">
                 <ArrowRight className="w-8 h-8 text-root" />
              </div>
              <h3 className="font-bold text-root text-xl mb-2">Zone Specific Shipping</h3>
              <p className="text-sm text-stone-c font-dm-sans">We hold orders in our cooler and ship exactly when the threat of frost is minimized.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
