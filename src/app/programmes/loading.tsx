export default function ProgrammesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-slate-950" />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-80 rounded-2xl border border-gray-100 bg-gray-50"
          />
        ))}
      </div>
    </div>
  );
}
