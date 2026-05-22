"use client";

import { cn } from "@/lib/utils";
import { Heart, Home, Map, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "ホーム", icon: Home, match: (pathname: string) => pathname === "/" },
  { href: "/map", label: "マップ", icon: Map, match: (pathname: string) => pathname.startsWith("/map") },
  { href: "/favorites", label: "保存", icon: Heart, match: (pathname: string) => pathname.startsWith("/favorites") },
  {
    href: "/#reviews",
    label: "レビュー",
    icon: MessageSquareText,
    match: (pathname: string) => pathname.startsWith("/toilet")
  }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-slate-200/80 bg-white/94 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2.5 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:bottom-6 sm:rounded-b-[32px]">
      <div className="grid grid-cols-4 gap-1.5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-[11px] font-bold text-slate-500 transition active:scale-[0.98]",
                active && "bg-slate-950 text-white shadow-lg shadow-slate-900/15"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
