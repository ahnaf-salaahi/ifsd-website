export default function CmsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-100" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}
