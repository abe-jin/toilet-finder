"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDistance, googleMapsDirectionsUrl, withDistance } from "@/lib/distance";
import { averageRating, getReviewsForToilet, getStoredReviews } from "@/lib/reviews";
import { getCachedToilets, getToiletById, sampleToilets } from "@/lib/toilets";
import type { Coordinates, ToiletWithDistance } from "@/lib/types";
import {
  Accessibility,
  ArrowLeft,
  Baby,
  Clock3,
  CreditCard,
  DoorOpen,
  MapPin,
  Navigation,
  Sparkles,
  Star,
  Toilet,
  WalletCards
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const fallbackLocation = { lat: 35.69056, lng: 139.69964 };

function amenityTags(toilet: ToiletWithDistance) {
  return [
    { show: toilet.amenities.genderSeparated, label: "男女別", icon: DoorOpen },
    { show: toilet.amenities.multipurpose, label: "多目的トイレ", icon: Accessibility },
    { show: toilet.amenities.diaperChanging, label: "おむつ交換台", icon: Baby },
    { show: toilet.amenities.washlet, label: "ウォシュレット", icon: Sparkles },
    { show: toilet.amenities.wheelchair, label: "車椅子対応", icon: Accessibility },
    { show: toilet.amenities.open24h, label: "24時間利用可", icon: Clock3 },
    { show: true, label: toilet.amenities.category, icon: Toilet },
    { show: true, label: toilet.amenities.free ? "無料" : "有料", icon: toilet.amenities.free ? WalletCards : CreditCard }
  ].filter((item) => item.show);
}

export default function ToiletDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const toiletId = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id;
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  const toilet = useMemo(() => {
    void refreshKey;
    const candidates = getCachedToilets();
    const found = getToiletById(toiletId, candidates) ?? getToiletById(toiletId, sampleToilets);
    if (!found) return null;

    const [withDistanceToilet] = withDistance([found], location ?? fallbackLocation);
    const toiletReviews = getReviewsForToilet(found.id, getStoredReviews());
    return {
      ...withDistanceToilet,
      reviewRating: averageRating(toiletReviews)
    };
  }, [toiletId, location, refreshKey]);

  const tags = useMemo(() => (toilet ? amenityTags(toilet) : []), [toilet]);

  if (!toilet) {
    return (
      <main className="min-h-dvh bg-white p-5 pb-28">
        <EmptyState
          icon={MapPin}
          title="トイレ情報が見つかりません"
          description="ホームに戻って、現在地周辺のトイレをもう一度取得してください。"
          action={
            <Link href="/">
              <Button>ホームへ戻る</Button>
            </Link>
          }
        />
        <BottomNav />
      </main>
    );
  }

  const rating = toilet.reviewRating ?? toilet.rating;

  return (
    <main className="min-h-dvh bg-white pb-32">
      <header className="rounded-b-[34px] bg-slate-950 px-4 pb-6 pt-5 text-white shadow-soft">
        <Link
          href="/"
          className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95"
          aria-label="戻る"
        >
          <ArrowLeft size={20} />
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">Toilet Detail</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight">{toilet.name}</h1>
        <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-white/68">
          <MapPin size={17} className="mt-0.5 shrink-0" />
          {toilet.address}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-[20px] bg-white/10 p-3">
            <p className="text-xs text-white/60">距離</p>
            <p className="mt-1 text-lg font-black">{formatDistance(toilet.distanceMeters)}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 p-3">
            <p className="text-xs text-white/60">徒歩</p>
            <p className="mt-1 text-lg font-black">{toilet.walkingMinutes}分</p>
          </div>
          <div className="rounded-[20px] bg-white/10 p-3">
            <p className="text-xs text-white/60">評価</p>
            <p className="mt-1 flex items-center gap-1 text-lg font-black">
              <Star size={17} className="fill-current text-amber-300" />
              {rating.toFixed(1)}
            </p>
          </div>
        </div>
        <a href={googleMapsDirectionsUrl(toilet, location)} target="_blank" rel="noreferrer">
          <Button className="mt-5 h-14 w-full rounded-[22px] bg-white text-ink hover:bg-slate-100">
            <Navigation size={18} />
            Google Mapsで開く
          </Button>
        </a>
      </header>

      <section className="space-y-5 px-4 pt-5">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-ink">設備情報</h2>
            <Badge>
              <Clock3 size={13} className="mr-1" />
              {toilet.openingHours}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {tags.map(({ label, icon: Icon }) => (
              <div key={label} className="flex min-h-[52px] items-center gap-2 rounded-[20px] bg-slate-50 px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200/50">
                <Icon size={17} className="text-accent" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Card>

        <ReviewList toiletId={toilet.id} refreshKey={refreshKey} />
        <ReviewForm toiletId={toilet.id} onSubmitted={() => setRefreshKey((value) => value + 1)} />
      </section>
      <BottomNav />
    </main>
  );
}
