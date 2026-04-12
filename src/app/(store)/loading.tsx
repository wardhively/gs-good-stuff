export default function StoreLoading() {
  return (
    <div className="bg-cream min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
         <div className="h-10 w-48 bg-clay/50 rounded-lg mb-8 animate-pulse"></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="animate-pulse bg-white rounded-3xl border border-fence-lt overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-clay/40"></div>
                  <div className="p-6">
                     <div className="h-6 w-32 bg-clay/50 rounded mt-2 mb-4"></div>
                     <div className="h-4 w-20 bg-clay/50 rounded"></div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
