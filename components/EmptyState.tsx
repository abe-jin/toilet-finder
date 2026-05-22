import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[30px] border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white px-5 py-8 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-accent shadow-sm ring-1 ring-slate-200">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-black text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
