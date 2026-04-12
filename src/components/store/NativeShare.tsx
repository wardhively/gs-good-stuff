"use client";

import { Share } from "lucide-react";

export default function NativeShare({ title }: { title: string }) {
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title, url: window.location.href }).catch(console.error);
    }
  };
  return (
    <button onClick={handleShare} className="px-6 py-2.5 bg-white border border-fence-lt shadow-sm rounded-full font-bold text-root text-sm flex items-center gap-2 hover:border-soil transition-colors">
      <Share className="w-4 h-4"/> Share Story
    </button>
  );
}
