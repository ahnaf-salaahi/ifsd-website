export default function SuccessStoriesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-gray-100" />
      <div className="mt-6 h-20 rounded-2xl bg-white" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-20 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}
