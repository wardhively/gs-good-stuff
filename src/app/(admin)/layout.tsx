"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Map, Box, CheckSquare, BookOpen, MoreHorizontal, Wifi, WifiOff, CloudSnow } from "lucide-react";
import Link from "next/link";
import { waitForPendingWrites } from "firebase/firestore";
import { db } from "@/lib/firebase";

function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    let isActive = true;
    const watchSync = () => {
       if (!isActive) return;
       setIsSyncing(true);
       waitForPendingWrites(db).then(() => {
          if (isActive) setIsSyncing(false);
          setTimeout(watchSync, 2000);
       });
    };
    watchSync();

    return () => {
      isActive = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div role="status" aria-label="Database Sync Status" className="flex items-center gap-1.5 absolute top-4 right-4 bg-cream/80 backdrop-blur px-2 py-1 rounded-full border border-fence-lt shadow-sm text-[10px] font-bold uppercase tracking-widest text-stone-c z-50">
       {!isOnline ? (
          <><WifiOff className="w-3 h-3 text-frost" /><span className="text-frost">Offline</span></>
       ) : isSyncing ? (
          <><CloudSnow className="w-3 h-3 text-bloom animate-spin" /><span className="text-bloom">Syncing...</span></>
       ) : (
          <><Wifi className="w-3 h-3 text-leaf" /><span className="text-leaf">Synced</span></>
       )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login"); // Redirect to login if unauth
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const tabs = [
    { label: "Map", icon: Map, href: "/map" },
    { label: "Inventory", icon: Box, href: "/inventory" },
    { label: "Tasks", icon: CheckSquare, href: "/tasks" },
    { label: "Journal", icon: BookOpen, href: "/journal" },
    { label: "More", icon: MoreHorizontal, href: "/more" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <SyncIndicator />
      
      {/* Main Content Area */}
      <main className="flex-1 pb-16 relative">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-linen border-t border-fence-lt safe-area-pb">
        <ul className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <li key={tab.label} className="flex-1">
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center py-2 relative ${
                    isActive ? "text-soil font-bold" : "text-stone-c"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-soil" />
                  )}
                  <tab.icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
