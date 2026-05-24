import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDistance, googleMapsDirectionsUrl } from "@/lib/distance";
import type { Coordinates, ToiletWithDistance } from "@/lib/types";
import { Accessibility, ArrowRight, Clock3, Navigation, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

export function NearestToiletCard({ toilet, currentLocation }: { toilet: ToiletWithDistance; currentLocation?: Coordinates | null }) {
  const rating = toilet.reviewRating ?? toilet.rating;

  return (
    <section className="px-4 pb-5 pt-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">一番近いトイレ</p>
        <div className="flex items-center gap-2">
          <FavoriteButton toilet={toilet} />
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
            {toilet.dataKind === "generated" ? "確認用データ" : toilet.dataKind === "candidate" ? "トイレあり施設" : "最短"}
          </span>
        </div>
      </div>
      <div className="overflow-hidden rounded-[30px] bg-ink text-white shadow-soft ring-1 ring-slate-900/10">
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-[21px] font-black leading-7">{toilet.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-white/68">{toilet.address}</p>
            </div>
            <div className="shrink-0 rounded-[24px] bg-white px-4 py-3 text-right text-ink shadow-lg shadow-black/10">
              <p className="text-[24px] font-black leading-none">{formatDistance(toilet.distanceMeters)}</p>
              <p className="mt-1 text-sm font-black text-teal-700">徒歩{toilet.walkingMinutes}分</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/10 px-3 py-2">
              <p className="text-[11px] font-bold text-white/54">評価</p>
              <p className="mt-1 flex items-center gap-1 text-base font-black">
                <Star size={15} className="fill-current text-amber-300" />
                {rating.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2">
              <p className="text-[11px] font-bold text-white/54">営業</p>
              <p className="mt-1 truncate text-sm font-black">{toilet.openingHours}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2">
              <p className="text-[11px] font-bold text-white/54">設備</p>
              <p className="mt-1 truncate text-sm font-black">{toilet.amenities.multipurpose ? "多目的" : toilet.amenities.category}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-white/12 text-white">
              <Accessibility size={13} className="mr-1" />
              {toilet.amenities.wheelchair ? "車椅子対応" : "標準設備"}
            </Badge>
            <Badge className="bg-white/12 text-white">
              <Clock3 size={13} className="mr-1" />
              {toilet.amenities.open24h ? "24時間" : toilet.openingHours === "営業時間不明" ? "営業時間不明" : "営業時間あり"}
            </Badge>
            <Badge className="bg-white/12 text-white">
              <ShieldCheck size={13} className="mr-1" />
              {toilet.amenities.free ? "無料" : "有料"}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-white/10 bg-white/[0.03] p-3">
          <a href={googleMapsDirectionsUrl(toilet, currentLocation)} target="_blank" rel="noreferrer">
            <Button className="h-[52px] w-full rounded-[20px] bg-white text-ink hover:bg-slate-100">
              <Navigation size={17} />
              経路案内
            </Button>
          </a>
          <Link href={`/toilet?id=${toilet.id}`}>
            <Button variant="secondary" size="icon" aria-label="詳細を見る">
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
