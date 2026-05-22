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
    <Card className={compact ? "p-3" : "p-3.5"}>
      <Link href={`/toilet/${toilet.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {toilet.dataKind === "generated" ? (
              <span className="mb-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600">
                確認用データ
              </span>
            ) : toilet.dataKind === "candidate" ? (
              <span className="mb-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-700">
                トイレあり施設
              </span>
            ) : null}
            <p className="line-clamp-2 text-[15px] font-black leading-6 text-ink">{toilet.name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <MapPin size={13} className="shrink-0" />
              <span className="line-clamp-1">{toilet.address}</span>
            </p>
          </div>
          <div className="shrink-0 rounded-[20px] bg-slate-950 px-3 py-2 text-right text-white">
            <p className="text-base font-black leading-none">{formatDistance(toilet.distanceMeters)}</p>
            <p className="mt-1 text-[11px] font-bold text-white/64">徒歩{toilet.walkingMinutes}分</p>
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
              {toilet.amenities.open24h ? "24h" : "営業中"}
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
        <a href={googleMapsDirectionsUrl(toilet, currentLocation)} target="_blank" rel="noreferrer">
          <Button className="mt-4 w-full" variant="secondary">
            <Navigation size={17} />
            ここへ行く
          </Button>
        </a>
      ) : null}
    </Card>
  );
}
