import Link from 'next/link';

export default function Pagination({ page, totalPages, params }: { page: number; totalPages: number; params: Record<string, string | undefined> }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && k !== 'page' && p.set(k, v));
    p.set('page', String(n));
    return `/products?${p.toString()}`;
  };
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm">
      {page > 1 ? <Link className="btn btn-secondary" href={href(page - 1)}>Previous</Link> : <span />}
      <span>Page {page} of {totalPages}</span>
      {page < totalPages ? <Link className="btn btn-secondary" href={href(page + 1)}>Next</Link> : <span />}
    </nav>
  );
}
