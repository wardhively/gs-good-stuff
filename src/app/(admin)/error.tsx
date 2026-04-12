"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
       <ShieldAlert className="w-16 h-16 text-frost mb-4 opacity-80" />
       <h1 className="font-bitter text-2xl font-bold text-root mb-2">Admin Dashboard Failure</h1>
       <p className="font-dm-sans text-stone-c max-w-[250px] mb-8">{error.message}</p>
       
       <button onClick={() => reset()} className="mb-3 px-8 py-3 bg-soil text-white rounded-xl font-bold hover:bg-root transition-colors shadow-sm text-sm">
          Attempt Recovery
       </button>
       <Link href="/inventory" className="text-sm font-bold text-stone-c hover:text-root underline">Return to Operations Context</Link>
    </div>
  );
}
