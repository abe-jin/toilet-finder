"use client";

import type { FilterKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Accessibility, Clock3, Droplets, Sparkles, Star } from "lucide-react";
import type { ElementType } from "react";

const filters: { key: FilterKey; label: string; icon: ElementType }[] = [
  { key: "multipurpose", label: "多目的", icon: Accessibility },
  { key: "open24h", label: "24時間", icon: Clock3 },
  { key: "rating4", label: "評価4+", icon: Star },
  { key: "within500m", label: "500m以内", icon: Sparkles },
  { key: "clean", label: "清潔さ高め", icon: Droplets }
];

type FilterBarProps = {
  activeFilters: FilterKey[];
  onToggle: (filter: FilterKey) => void;
};

export function FilterBar({ activeFilters, onToggle }: FilterBarProps) {
  return (
    <div className="rounded-[26px] bg-slate-50 p-3 ring-1 ring-slate-200/70">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-ink">条件で絞り込み</p>
          <p className="text-xs text-muted">
            {activeFilters.length > 0 ? `${activeFilters.length}件の条件を適用中` : "よく使う条件をワンタップ"}
          </p>
        </div>
      </div>
      <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
      <div className="flex w-max gap-2">
        {filters.map(({ key, label, icon: Icon }) => {
          const active = activeFilters.includes(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-bold transition active:scale-[0.98]",
                active
                  ? "border-teal-500 bg-teal-600 text-white shadow-lg shadow-teal-900/10"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm"
              )}
              aria-pressed={active}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}
