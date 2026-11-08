import { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  action,
  href,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          {eyebrow}
        </p>
        <h2 className="font-serif text-xl font-medium tracking-tight">{title}</h2>
      </div>
      {action && href ? (
        <Link
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
          href={href}
        >
          {action} <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClass,
  progress,
  trend,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  iconClass: string;
  progress?: number;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="gap-3 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-2xl font-medium tracking-tight">{value}</p>
        </div>
        <div className="flex items-center gap-2">
          {trend === "up" && <TrendingUp className="size-4 text-[#527553]" />}
          {trend === "down" && <TrendingDown className="size-4 text-[#9b4a4a]" />}
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconClass}`}>
            <Icon className="size-5" strokeWidth={1.7} />
          </span>
        </div>
      </div>
      {progress !== undefined ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{detail}</span>
            <span>{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-1.5 bg-[#eeeae3] [&_[data-slot=progress-indicator]]:bg-primary"
          />
        </div>
      ) : (
        detail && <p className="text-xs text-muted-foreground">{detail}</p>
      )}
    </Card>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          {eyebrow}
        </p>
        <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </section>
  );
}

export function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-5 gap-5 overflow-hidden rounded-2xl border-border/80 bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm sm:p-6">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          {eyebrow}
        </p>
        <h2 className="font-serif text-xl font-medium tracking-tight">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export function EmptyState({ message, icon: Icon }: { message: string; icon?: LucideIcon }) {
  return (
    <div className="mt-4 rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center">
      {Icon && (
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-muted/60">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
