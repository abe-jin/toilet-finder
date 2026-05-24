import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDistance, googleMapsDirectionsUrl } from "@/lib/distance";
import type { Coordinates, ToiletWithDistance } from "@/lib/types";
import { Accessibility, Baby, Clock3, MapPin, Navigation, Star, Toilet } from "lucide-react";
import Link from "next/link";

type ToiletCardProps = {
  toilet: ToiletWithDistance;
  compact?: boolean;
  currentLocation?: Coordinates | null;
};

export function ToiletCard({ toilet, compact = false, currentLocation }: ToiletCardProps) {
  const rating = toilet.reviewRating ?? toilet.rating;

  return (
    <Card className="overflow-hidden p-0">
      {/* タイトル行：左＝タグ・名前・住所、右＝ハートボタン */}
      <div className="flex items-start gap-2 px-4 pt-4">
        <Link href={`/toilet/${toilet.id}`} className="block min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {toilet.dataKind === "generated" ? (
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600">
                確認用データ
              </span>
            ) : toilet.dataKind === "candidate" ? (
              <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-700">
                トイレあり施設
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-[16px] font-black leading-6 text-ink">{toilet.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
            <MapPin size={13} className="shrink-0 text-accent" />
            <span className="line-clamp-1">{toilet.address}</span>
          </p>
        </Link>
        <FavoriteButton toilet={toilet} className="mt-0.5 shrink-0 border-slate-200 bg-white shadow-sm" />
      </div>
      {/* 距離・統計・バッジ行：ハートと重ならない独立エリア */}
      <Link href={`/toilet/${toilet.id}`} className="block px-4 pb-4 pt-3">
        <div className="flex items-center gap-3 rounded-[22px] bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/60">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-accent">
            <MapPin size={16} className="shrink-0" />
            <span className="truncate text-xl font-black leading-none text-ink">{formatDistance(toilet.distanceMeters)}</span>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-slate-500">
            <Clock3 size={16} className="shrink-0" />
            <span className="truncate text-sm font-black">徒歩{toilet.walkingMinutes}分</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-amber-50 px-3 py-2 text-amber-700">
            <p className="flex items-center gap-1 text-sm font-black">
              <Star size={14} className="fill-current" />
              {rating.toFixed(1)}
            </p>
            <p className="text-[11px] font-bold text-amber-700/70">評価</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-700">
            <p className="flex items-center gap-1 truncate text-sm font-black">
              <Clock3 size={14} />
              {toilet.amenities.open24h ? "24h" : toilet.openingHours === "営業時間不明" ? "不明" : "営業"}
            </p>
            <p className="truncate text-[11px] font-bold text-slate-500">{toilet.openingHours}</p>
          </div>
          <div className="rounded-2xl bg-teal-50 px-3 py-2 text-teal-700">
            <p className="flex items-center gap-1 truncate text-sm font-black">
              <Toilet size={14} />
              {toilet.amenities.free ? "無料" : "有料"}
            </p>
            <p className="truncate text-[11px] font-bold text-teal-700/70">{toilet.amenities.category}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className={toilet.amenities.multipurpose ? "bg-teal-50 text-teal-700" : undefined}>
            <Accessibility size={13} className="mr-1" />
            {toilet.amenities.multipurpose ? "多目的" : "標準"}
          </Badge>
          {toilet.amenities.diaperChanging ? (
            <Badge>
              <Baby size={13} className="mr-1" />
              おむつ
            </Badge>
          ) : null}
          {toilet.amenities.washlet ? <Badge>ウォシュレット</Badge> : null}
        </div>
      </Link>
      {!compact ? (
        <a className="block border-t border-slate-100 p-3 pt-2" href={googleMapsDirectionsUrl(toilet, currentLocation)} target="_blank" rel="noreferrer">
          <Button className="h-12 w-full rounded-[18px]" variant="secondary">
            <Navigation size={17} />
            経路案内
          </Button>
        </a>
      ) : null}
    </Card>
  );
}
