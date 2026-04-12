export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-cream relative pb-24 animate-pulse p-4 flex flex-col gap-4 mt-16">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-[120px] bg-clay/50 rounded-xl w-full border border-fence-lt/50"></div>
      ))}
    </div>
  );
}
