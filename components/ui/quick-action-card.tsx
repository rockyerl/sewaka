import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

/**
 * QuickActionCard — Card link dengan icon untuk aksi cepat.
 * Gunakan di dashboard atau halaman lain yang membutuhkan shortcut ke fitur.
 */

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  color = "bg-[#f4e9e9] text-primary",
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color?: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="group-hover:shadow-md transition-all rounded-xl border-border/80 bg-card p-4 hover:border-primary/20">
        <div className="flex items-center gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${color}`}>
            <Icon className="size-4" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}

/**
 * QuickActionsSection — Section wrapper untuk QuickActionCard.
 * Gunakan untuk menampilkan grid aksi cepat dengan judul section.
 */

export function QuickActionsSection({
  title,
  actions,
  columns = 3,
}: {
  title: string;
  actions: Array<{
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    color?: string;
  }>;
  columns?: 2 | 3;
}) {
  return (
    <section aria-label={title}>
      <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
        {title.toUpperCase()}
      </p>
      <div className={`grid gap-2 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
        {actions.map((action) => (
          <QuickActionCard key={action.href} {...action} />
        ))}
      </div>
    </section>
  );
}
