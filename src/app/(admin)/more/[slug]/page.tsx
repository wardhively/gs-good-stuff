"use client";

import { ChevronLeft, Hammer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EquipmentView from "@/components/admin/EquipmentView";
import BusinessView from "@/components/admin/BusinessView";
import WeatherDetailView from "@/components/admin/WeatherDetailView";
import OrdersView from "@/components/admin/OrdersView";
import RevenueView from "@/components/admin/RevenueView";
import CalendarView from "@/components/admin/CalendarView";
import SettingsView from "@/components/admin/SettingsView";

export default function MoreSubPage() {
  const params = useParams();
  const slug = params.slug as string;

  if (slug === "equip") return <EquipmentView />;
  if (slug === "business") return <BusinessView />;
  if (slug === "weather") return <WeatherDetailView />;
  if (slug === "orders") return <OrdersView />;
  if (slug === "revenue") return <RevenueView />;
  if (slug === "calendar") return <CalendarView />;
  if (slug === "settings") return <SettingsView />;

  // Under construction fallback for all other routes
  const titleMap: Record<string, string> = {
    orders: "Store Orders",
    revenue: "Revenue Metrics",
    business: "Business Plans",
    weather: "Field Intelligence",
    calendar: "Season Calendar",
    settings: "Settings & Preferences",
  };

  const title = titleMap[slug] || "Page";

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm flex items-center gap-3">
        <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-bitter text-3xl font-bold text-root">{title}</h1>
      </div>

      <div className="p-8 mt-12 flex flex-col items-center text-center text-stone-c">
        <Hammer className="w-16 h-16 text-fence-lt mb-4" />
        <h2 className="font-bitter text-2xl font-bold text-root mb-2">Under Construction</h2>
        <p className="font-dm-sans max-w-[250px] mb-6">Gary hasn't wired up these backend charts quite yet. Check back next season!</p>
        <Link href="/more" className="px-6 py-3 bg-white border border-fence-lt rounded-xl font-bold text-root hover:border-soil shadow-sm transition-all text-sm">
          Return to More
        </Link>
      </div>
    </div>
  );
}
