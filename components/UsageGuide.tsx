"use client";

import { STORAGE_KEYS } from "@/lib/storage-keys";
import { ChevronDown, HelpCircle, Navigation, ShieldCheck, Toilet as ToiletIcon } from "lucide-react";
import { useState } from "react";

const USAGE_GUIDE_DISMISSED_KEY = STORAGE_KEYS.usageGuideDismissed;

const usageSteps = [
  { title: "現在地を許可", description: "近くのトイレを自動で探します。", icon: ShieldCheck },
  { title: "近くのトイレを確認", description: "距離・設備・レビューを確認できます。", icon: ToiletIcon },
  { title: "経路案内へ", description: "Google Mapsで徒歩ルートを開けます。", icon: Navigation }
];

export function UsageGuide() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && window.localStorage?.getItem(USAGE_GUIDE_DISMISSED_KEY) === "true"
  );

  if (dismissed) {
    return (
      <button
        type="button"
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-slate-600 shadow-sm ring-1 ring-slate-200/80"
        onClick={() => {
          window.localStorage?.removeItem(USAGE_GUIDE_DISMISSED_KEY);
          setDismissed(false);
          setOpen(true);
        }}
      >
        <HelpCircle size={16} className="text-accent" />
        使い方
      </button>
    );
  }

  return (
    <div className="mt-5 rounded-[26px] bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[20px] px-2 text-left active:scale-[0.99]"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex items-center gap-2 text-sm font-black text-ink">
          <HelpCircle size={18} className="text-accent" />
          使い方を見る
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="mt-2 space-y-2">
          {usageSteps.map(({ title, icon: Icon }, index) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-3 py-3 ring-1 ring-slate-200/60"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] bg-white text-accent shadow-sm">
                <Icon size={17} />
              </div>
              <p className="text-sm font-black text-ink">
                {index + 1}. {title}
              </p>
            </div>
          ))}
          <button
            type="button"
            className="min-h-10 w-full rounded-[18px] text-xs font-black text-slate-500 transition hover:bg-slate-50"
            onClick={() => {
              window.localStorage?.setItem(USAGE_GUIDE_DISMISSED_KEY, "true");
              setDismissed(true);
              setOpen(false);
            }}
          >
            今後表示しない
          </button>
        </div>
      ) : null}
    </div>
  );
}
