"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Analytics bounds
    console.error("Global React Layout execution crashed:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-frost-lt border border-frost rounded-3xl p-8 text-center shadow-lg">
         <AlertTriangle className="w-16 h-16 text-frost mx-auto mb-4" />
         <h1 className="font-bitter text-3xl font-bold text-frost mb-4">A Field Exception Occurred</h1>
         <p className="font-dm-sans text-frost/80 mb-8 leading-relaxed">
            Something unexpectedly failed loading the root layouts natively. 
            ({error.message})
         </p>
         <div className="flex flex-col gap-3">
            <button
               onClick={() => reset()}
               className="w-full py-4 bg-frost text-white rounded-xl font-bold hover:bg-frost/80 transition-colors shadow-sm"
            >
               Force Root Refresh
            </button>
            <Link
               href="/"
               className="w-full py-4 bg-white border border-frost text-frost rounded-xl font-bold hover:bg-white/80 transition-colors shadow-sm"
            >
               Return Home
            </Link>
         </div>
      </div>
    </div>
  );
}
