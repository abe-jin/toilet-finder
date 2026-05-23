import { Button } from "@/components/ui/Button";
import { Home, MapPin } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 pb-12 pt-10">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <MapPin size={28} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-black text-ink">ページが見つかりません</h1>
          <p className="text-sm font-bold leading-6 text-slate-500">
            URLを確認するか、ホームに戻ってください。
          </p>
        </div>
        <Link href="/" className="block">
          <Button className="h-14 w-full rounded-[22px]">
            <Home size={17} />
            ホームに戻る
          </Button>
        </Link>
      </div>
    </main>
  );
}
