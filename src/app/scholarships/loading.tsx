export default function ScholarshipsLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <div className="h-64 bg-slate-950" />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-80 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <span className="sr-only">Loading Scholarships</span>
    </div>
  );
}
