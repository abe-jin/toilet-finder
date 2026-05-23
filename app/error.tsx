"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 pb-12 pt-10">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle size={28} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-black text-ink">エラーが発生しました</h1>
          <p className="text-sm font-bold leading-6 text-slate-500">
            ページを再読み込みするか、ホームに戻ってください。
          </p>
        </div>
        <div className="space-y-3">
          <Button className="h-14 w-full rounded-[22px]" onClick={reset}>
            <RotateCcw size={17} />
            再読み込みする
          </Button>
          <Link href="/" className="block">
            <Button variant="secondary" className="h-14 w-full rounded-[22px]">
              <Home size={17} />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
