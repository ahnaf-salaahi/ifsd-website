export default function SuccessStoryDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="h-4 w-36 rounded bg-slate-800" />
            <div className="mt-10 h-12 w-4/5 rounded bg-slate-800" />
            <div className="mt-5 h-20 rounded bg-slate-900" />
          </div>
          <div className="aspect-[16/10] rounded-2xl bg-slate-800" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="mt-12 h-72 rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
