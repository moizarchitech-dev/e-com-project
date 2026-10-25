export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10" role="status" aria-label="Loading products">
      <div className="h-10 w-64 animate-pulse rounded bg-ink/10" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-ink/10" />)}
      </div>
    </div>
  );
}
