"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { SOCIAL } from "@/lib/constants";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-cream min-h-screen flex flex-col items-center justify-center p-6 text-center">
       <div className="max-w-md bg-white border border-fence-lt rounded-3xl p-8 mb-8 shadow-sm">
          <AlertCircle className="w-12 h-12 text-petal mx-auto mb-4" />
          <h1 className="font-bitter text-3xl font-bold text-root mb-4">Store Exception</h1>
          <p className="font-dm-sans text-stone-c mb-8">{error.message || "We encountered an issue communicating with the cart or catalog."}</p>
          
          <div className="flex flex-col gap-3">
             <button onClick={() => reset()} className="w-full bg-soil text-white px-6 py-3 rounded-xl font-bold hover:bg-root transition-colors shadow-sm">
                Try Reloading Storefront
             </button>
             <Link href="/" className="w-full bg-white border border-fence-lt px-6 py-3 rounded-xl font-bold text-root hover:border-soil transition-colors shadow-sm">
                Return to Home
             </Link>
          </div>
       </div>

       <p className="text-xs font-dm-sans text-stone-c uppercase tracking-widest font-bold">
          Reach out if this persists: <a href={SOCIAL.instagram} className="text-petal">@gsgoodstuff</a>
       </p>
    </div>
  );
}
