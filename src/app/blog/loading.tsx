export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-24">
      <div className="mx-auto h-10 w-64 rounded bg-gray-200" />
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="h-72 rounded-2xl bg-gray-100" />
        <div className="h-72 rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
