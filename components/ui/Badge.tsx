import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700",
        className
      )}
      {...props}
    />
  );
}
