import { LocateFixed } from "lucide-react";

export function LoadingState({ label = "現在地を確認しています" }: { label?: string }) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-[30px] bg-gradient-to-b from-slate-50 to-white px-6 text-center shadow-sm ring-1 ring-slate-200/70">
      <div>
        <div className="mx-auto mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-teal-50 text-accent ring-8 ring-teal-50/60">
          <LocateFixed size={26} />
        </div>
        <p className="text-base font-black text-ink">{label}</p>
        <p className="mt-2 text-sm leading-6 text-muted">近くのトイレを距離順に並べています。</p>
      </div>
    </div>
  );
}
