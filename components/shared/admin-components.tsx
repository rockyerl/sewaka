import Link from "next/link";

export function AdminPagination({
  page,
  totalPages,
  baseUrl,
}: {
  page: number;
  totalPages: number;
  baseUrl: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={`${baseUrl}?page=${page - 1}`}
            className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted"
          >
            Sebelumnya
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={`${baseUrl}?page=${page + 1}`}
            className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted"
          >
            Selanjutnya
          </Link>
        )}
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl font-normal tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl font-medium tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

export function AdminNavCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-colors"
    >
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
