import { Wrench, ChartLine, Calendar, Settings, FileText, Cloud, Package, Banknote } from "lucide-react";
import Link from "next/link";

export default function MoreMenuPage() {
  const hubs = [
    { title: "Equipment", slug: "equip", icon: <Wrench className="w-6 h-6 text-root" />, desc: "Maintenance limits, service logs." },
    { title: "Orders", slug: "orders", icon: <Package className="w-6 h-6 text-root" />, desc: "Storefront fulfillment & shipping." },
    { title: "Revenue", slug: "revenue", icon: <Banknote className="w-6 h-6 text-root" />, desc: "Tuber sales and margins." },
    { title: "Business Metrics", slug: "business", icon: <ChartLine className="w-6 h-6 text-root" />, desc: "Budgets & 10-year plans." },
    { title: "Weather History", slug: "weather", icon: <Cloud className="w-6 h-6 text-root" />, desc: "Historical field data & frost logging." },
    { title: "Calendar", slug: "calendar", icon: <Calendar className="w-6 h-6 text-root" />, desc: "Seasonal planning milestones." },
    { title: "Settings", slug: "settings", icon: <Settings className="w-6 h-6 text-root" />, desc: "Admin preferences & alerts." },
  ];

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
        <h1 className="font-bitter text-3xl font-bold text-root mb-1">More Controls</h1>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {hubs.map(hub => (
          <Link key={hub.slug} href={`/more/${hub.slug}`} className="bg-linen p-4 rounded-xl border border-fence-lt shadow-sm hover:border-soil active:scale-[0.98] transition-all flex flex-col items-start gap-3">
            <div className="p-3 bg-white rounded-lg border border-fence-lt shadow-sm">
              {hub.icon}
            </div>
            <div>
              <h3 className="font-bold text-root">{hub.title}</h3>
              <p className="text-[10px] text-stone-c font-dm-sans leading-snug mt-1">{hub.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
