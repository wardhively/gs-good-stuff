import { Map } from "lucide-react";

export default function MapLoading() {
  return (
    <div className="h-screen w-full bg-clay flex flex-col items-center justify-center animate-pulse text-stone-c relative overflow-hidden">
       <Map className="w-16 h-16 mb-4 opacity-30" />
       <h1 className="font-bitter font-bold text-2xl opacity-60">Initializing Farm Grid...</h1>
    </div>
  );
}
