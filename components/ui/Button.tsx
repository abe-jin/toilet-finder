import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold tracking-normal transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-ink text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800",
        variant === "secondary" && "border border-slate-200 bg-white text-ink shadow-sm hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-ink hover:bg-slate-100",
        variant === "danger" && "bg-rose-600 text-white shadow-lg shadow-rose-900/15 hover:bg-rose-700",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-14 px-5 text-base",
        size === "icon" && "h-11 w-11 p-0",
        className
      )}
      {...props}
    />
  );
}
