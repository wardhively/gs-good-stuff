"use client";

import Link from "next/link";
import { CartProvider, useCart } from "@/lib/cart";

function CartNavButton() {
  const { cartCount } = useCart();
  return (
    <Link href="/cart" className="bg-petal text-linen px-4 py-2 rounded-lg font-bold hover:bg-petal/90 transition-colors">
      Cart ({cartCount})
    </Link>
  );
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-soil text-linen py-4 px-6 fixed top-0 w-full z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="font-bitter text-2xl font-bold tracking-tight">
              G&S Good Stuff
            </Link>
            <nav className="hidden md:flex gap-6 items-center font-dm-sans">
              <Link href="/shop" className="hover:text-petal-lt transition-colors">Shop</Link>
              <Link href="/blog" className="hover:text-petal-lt transition-colors">Growing Guide</Link>
              <Link href="/about" className="hover:text-petal-lt transition-colors">About</Link>
              <CartNavButton />
            </nav>
          </div>
        </header>
        
        <main className="flex-1 mt-[72px]">
          {children}
        </main>

        <footer className="bg-root text-fence py-10 text-center">
          <p className="font-dm-sans">&copy; {new Date().getFullYear()} G&S Good Stuff</p>
        </footer>
      </div>
    </CartProvider>
  );
}
