"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag } from "lucide-react";
import { CartProvider, useCart } from "@/lib/cart";
import { SOCIAL } from "@/lib/constants";

function CartNavButton() {
  const { cartCount } = useCart();
  return (
    <Link href="/cart" className="relative flex items-center gap-2 bg-petal text-white px-4 py-2 rounded-full font-bold hover:bg-petal/90 transition-all hover:shadow-lg active:scale-95">
      <ShoppingBag className="w-4 h-4" />
      <span className="hidden sm:inline">Cart</span>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-frost text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-cart-pulse">
          {cartCount}
        </span>
      )}
    </Link>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-root/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 w-72 h-full bg-linen shadow-2xl flex flex-col animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-fence-lt">
          <span className="font-bitter text-lg font-bold text-root">Menu</span>
          <button onClick={onClose} className="p-2 text-stone-c hover:text-root"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex flex-col p-6 gap-1 font-dm-sans">
          {[
            { href: "/shop", label: "Shop Blooms" },
            { href: "/blog", label: "Growing Guide" },
            { href: "/about", label: "Our Story" },
            { href: "/cart", label: "Cart" },
          ].map(link => (
            <Link key={link.href} href={link.href} onClick={onClose} className="py-3 px-4 rounded-xl text-root font-bold hover:bg-clay transition-colors text-lg">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-6 border-t border-fence-lt">
          <p className="text-xs text-stone-c font-dm-sans">Addison, NY · Zone 5b</p>
          <p className="text-xs text-ash mt-1">Fresh cut dahlias, bouquets & arrangements</p>
        </div>
      </div>
    </div>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-soil/95 backdrop-blur-md shadow-lg border-b border-petal/10"
            : "bg-soil border-b border-transparent"
        }`}>
          <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
            <Link href="/" className="font-bitter text-2xl font-bold text-linen tracking-tight hover:text-petal-lt transition-colors">
              G&S Good Stuff
            </Link>
            <nav className="hidden md:flex gap-8 items-center font-dm-sans">
              {[
                { href: "/shop", label: "Shop" },
                { href: "/blog", label: "Growing Guide" },
                { href: "/about", label: "Our Story" },
              ].map(link => (
                <Link key={link.href} href={link.href} className="text-linen/80 hover:text-white font-medium transition-colors relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-petal transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              <CartNavButton />
            </nav>
            <div className="flex md:hidden items-center gap-3">
              <CartNavButton />
              <button onClick={() => setMobileNav(true)} className="p-2 text-linen hover:text-petal-lt transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <MobileNav open={mobileNav} onClose={() => setMobileNav(false)} />

        <main className="flex-1 mt-[60px]">{children}</main>

        {/* Footer */}
        <footer className="bg-root text-fence">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <h3 className="font-bitter text-xl font-bold text-linen mb-3">G&S Good Stuff</h3>
                <p className="text-sm text-fence/70 font-dm-sans leading-relaxed">Farm fresh cut dahlias grown with intention in Addison, NY. Bouquets, arrangements, and wholesale stems.</p>
              </div>
              <div>
                <h4 className="font-bold text-linen text-sm uppercase tracking-widest mb-3">Navigate</h4>
                <div className="flex flex-col gap-2 font-dm-sans text-sm">
                  <Link href="/shop" className="text-fence/70 hover:text-petal transition-colors">Shop Blooms</Link>
                  <Link href="/blog" className="text-fence/70 hover:text-petal transition-colors">Growing Guide</Link>
                  <Link href="/about" className="text-fence/70 hover:text-petal transition-colors">Our Story</Link>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-linen text-sm uppercase tracking-widest mb-3">Connect</h4>
                <div className="flex flex-col gap-2 font-dm-sans text-sm">
                  <a href={SOCIAL.instagram} target="_blank" rel="noopener" className="text-fence/70 hover:text-petal transition-colors">Instagram</a>
                  <a href={SOCIAL.tiktok} target="_blank" rel="noopener" className="text-fence/70 hover:text-petal transition-colors">TikTok</a>
                  <a href={SOCIAL.facebook} target="_blank" rel="noopener" className="text-fence/70 hover:text-petal transition-colors">Facebook</a>
                </div>
              </div>
            </div>
            <div className="border-t border-fence/20 pt-6 text-center">
              <p className="text-xs text-fence/50 font-dm-sans">&copy; {new Date().getFullYear()} G&S Good Stuff · Addison, NY</p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
