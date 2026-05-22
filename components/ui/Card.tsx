import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-sm", className)}
      {...props}
    />
  );
}
