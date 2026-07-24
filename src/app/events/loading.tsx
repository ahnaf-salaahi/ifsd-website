export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-24">
      <div className="mx-auto h-10 w-56 rounded bg-gray-200" />
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-80 rounded-2xl bg-gray-100" />
        <div className="h-80 rounded-2xl bg-gray-100" />
        <div className="h-80 rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
