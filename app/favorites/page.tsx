"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDistance, googleMapsDirectionsUrl, walkingMinutes, calculateDistanceMeters } from "@/lib/distance";
import { getFavoriteToilets, onFavoritesUpdated } from "@/lib/favorites";
import { FAST_GEOLOCATION_OPTIONS } from "@/lib/constants";
import type { Coordinates, Toilet } from "@/lib/types";
import { Accessibility, Baby, Clock3, Heart, MapPin, Navigation, Star, Toilet as ToiletIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FavoriteToilet = Toilet & {
  distanceMeters?: number;
  walkingMinutes?: number;
};

function withOptionalDistance(toilets: Toilet[], location: Coordinates | null): FavoriteToilet[] {
  if (!location) return toilets;

  return toilets
    .map((toilet) => {
      const distanceMeters = calculateDistanceMeters(location, toilet);
      return {
        ...toilet,
        distanceMeters,
        walkingMinutes: walkingMinutes(distanceMeters)
      };
    })
    .sort((a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER));
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Toilet[]>([]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationTried, setLocationTried] = useState(false);

  useEffect(() => {
    const sync = () => setFavorites(getFavoriteToilets());
    sync();
    return onFavoritesUpdated(sync);
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationTried(true);
      },
      () => setLocationTried(true),
      FAST_GEOLOCATION_OPTIONS
    );
  }, []);

  const favoriteToilets = useMemo(() => withOptionalDistance(favorites, location), [favorites, location]);

  return (
    <main className="min-h-dvh bg-slate-50 pb-32">
      <header className="rounded-b-[30px] bg-white px-4 pb-4 pt-5 shadow-sm ring-1 ring-slate-200/70">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Favorites</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">お気に入り</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
          よく使うトイレを保存して、あとで素早く経路案内できます。
        </p>
        {!location && locationTried ? (
          <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            現在地を許可すると、保存済みトイレまでの距離と徒歩時間を再計算します。
          </p>
        ) : null}
      </header>

      <section className="space-y-3 px-4 pt-4">
        {favoriteToilets.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="よく使うトイレを保存できます"
            description="トイレカードや詳細画面のハートを押すと、ここに一覧で表示されます。"
            action={
              <Link href="/">
                <Button>近くのトイレを探す</Button>
              </Link>
            }
          />
        ) : (
          favoriteToilets.map((toilet) => (
            <Card key={toilet.id} className="relative overflow-hidden p-0">
              <FavoriteButton toilet={toilet} className="absolute right-3 top-3 z-10 border-white/80 bg-white/95 shadow-sm" />
              <Link href={`/toilet/${toilet.id}`} className="block p-4 pr-14">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[16px] font-black leading-6 text-ink">{toilet.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
                    <MapPin size={13} className="shrink-0 text-accent" />
                    <span className="line-clamp-1">{toilet.address}</span>
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-[22px] bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/60">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <MapPin size={16} className="shrink-0 text-accent" />
                    <span className="truncate text-xl font-black leading-none text-ink">{formatDistance(toilet.distanceMeters)}</span>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 text-slate-600">
                    <Clock3 size={16} className="shrink-0 text-accent" />
                    <span className="truncate text-sm font-black">
                      {toilet.walkingMinutes ? `徒歩${toilet.walkingMinutes}分` : "現在地待ち"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-amber-50 px-3 py-2 text-amber-700">
                    <p className="flex items-center gap-1 text-sm font-black">
                      <Star size={14} className="fill-current" />
                      {toilet.rating.toFixed(1)}
                    </p>
                    <p className="text-[11px] font-bold text-amber-700/70">評価</p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 px-3 py-2 text-teal-700">
                    <p className="flex items-center gap-1 truncate text-sm font-black">
                      <ToiletIcon size={14} />
                      {toilet.amenities.free ? "無料" : "有料"}
                    </p>
                    <p className="truncate text-[11px] font-bold text-teal-700/70">{toilet.amenities.category}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-700">
                    <p className="truncate text-sm font-black">{toilet.openingHours}</p>
                    <p className="text-[11px] font-bold text-slate-500">営業</p>
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
              <a className="block border-t border-slate-100 p-3 pt-2" href={googleMapsDirectionsUrl(toilet, location)} target="_blank" rel="noreferrer">
                <Button className="h-12 w-full rounded-[18px]" variant="secondary">
                  <Navigation size={17} />
                  経路案内
                </Button>
              </a>
            </Card>
          ))
        )}
      </section>
      <BottomNav />
    </main>
  );
}
